'use client';
import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppToast } from '@/components/ui/app-toast';
import { CheckCircle2, Copy, Check, Eye, EyeOff, Loader2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/lib/context/auth.context';
import { authService } from '@/lib/services/auth.service';
import { useUpdateMailbox } from '@/lib/hooks/useMailboxes';
import { mailConnectService, type DnsRecord, type DnsSetupInfo, type MailConnectionResponse } from '@/lib/services/mail-connect.service';
import { cn } from '@/lib/utils';
import TurnstileWidget from '@/components/TurnstileWidget';

const KERABIE_DOMAIN = 'kerabie.email';
const USERNAME_RE = /^[a-z0-9]([a-z0-9._-]{1,28}[a-z0-9])?$/;

type AvailState = 'idle' | 'checking' | 'available' | 'taken' | 'invalid';
type Mode = 'kerabie' | 'domain';

function RecordRow({ record }: { record: DnsRecord }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(record.value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <div className="border rounded-none p-3 space-y-1 text-xs font-mono">
      <div className="flex items-center justify-between gap-2">
        <span className="text-muted-foreground">{record.type}{record.priority != null ? ` (priority ${record.priority})` : ''}</span>
        <button type="button" onClick={copy} className="text-primary hover:underline flex items-center gap-1 font-sans">
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          {copied ? 'Copied' : 'Copy value'}
        </button>
      </div>
      {record.host && <div>Host: {record.host}</div>}
      <div className="break-all">{record.value}</div>
      {record.description && <div className="text-muted-foreground font-sans">{record.description}</div>}
    </div>
  );
}

function DnsInstructions({ config }: { config: DnsSetupInfo }) {
  return (
    <div className="space-y-4">
      {config.mx_records.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">MX records</p>
          {config.mx_records.map((r, i) => <RecordRow key={i} record={r} />)}
        </div>
      )}
      {config.txt_records.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">TXT records (SPF / verification)</p>
          {config.txt_records.map((r, i) => <RecordRow key={i} record={r} />)}
        </div>
      )}
      {config.dkim_record.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">DKIM</p>
          {config.dkim_record.map((r, i) => <RecordRow key={i} record={r} />)}
        </div>
      )}
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">DMARC</p>
        <RecordRow record={config.dmarc_record} />
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterPageInner />
    </Suspense>
  );
}

function RegisterPageInner() {
  const [mode, setMode] = useState<Mode>('kerabie');
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 border">
        <button
          type="button"
          onClick={() => setMode('kerabie')}
          className={cn('py-2.5 text-sm font-medium transition-colors', mode === 'kerabie' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground')}
        >
          Free @{KERABIE_DOMAIN}
        </button>
        <button
          type="button"
          onClick={() => setMode('domain')}
          className={cn('py-2.5 text-sm font-medium transition-colors', mode === 'domain' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground')}
        >
          Your own domain
        </button>
      </div>
      {mode === 'kerabie' ? <KerabieForm /> : <DomainForm />}
    </div>
  );
}

// ── Free @kerabie.email signup ────────────────────────────────────────────────

function KerabieForm() {
  const { register } = useAuth();
  const { success, error: toastError, warning } = useAppToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect');

  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [avail, setAvail] = useState<AvailState>('idle');
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const checkUsername = useCallback(async (value: string) => {
    const v = value.toLowerCase().trim();
    if (!v) { setAvail('idle'); return; }
    if (!USERNAME_RE.test(v)) { setAvail('invalid'); return; }
    setAvail('checking');
    try {
      const res = await authService.checkUsername(v);
      if (res.status === true) {
        setAvail(res.response?.available ? 'available' : 'taken');
      } else {
        setAvail('idle');
      }
    } catch {
      setAvail('idle');
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => checkUsername(username), 400);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [username, checkUsername]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (avail !== 'available') {
      warning('Please choose a valid, available username');
      return;
    }
    if (password !== confirmPassword) {
      warning('Passwords do not match');
      return;
    }
    if (password.length < 8) {
      warning('Password must be at least 8 characters');
      return;
    }
    if (!captchaToken) {
      warning('Please complete the captcha');
      return;
    }
    setLoading(true);
    const result = await register(username.toLowerCase().trim(), password, fullName || undefined, captchaToken);
    setLoading(false);
    if (result.ok) {
      success('Account created!', { description: `Your mailbox ${username}@${KERABIE_DOMAIN} is ready.` });
      router.push(redirect && redirect.startsWith('/') ? redirect : '/app');
    } else {
      toastError(typeof result.error === 'string' ? result.error : 'Registration failed');
    }
  };

  const availIcon = {
    idle: null,
    invalid: <XCircle className="h-4 w-4 text-destructive" />,
    checking: <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />,
    available: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
    taken: <XCircle className="h-4 w-4 text-destructive" />,
  }[avail];

  const availMsg = {
    idle: null,
    invalid: 'Username must be 3-30 chars, letters/digits/dots/hyphens/underscores',
    checking: 'Checking availability…',
    available: `${username}@${KERABIE_DOMAIN} is available`,
    taken: 'That username is already taken',
  }[avail];

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <span className="font-mono text-[11px] uppercase tracking-[.13em] text-primary">Free mailbox</span>
        <h1 className="text-[28px] font-bold tracking-tight">Create your account</h1>
        <p className="text-sm text-muted-foreground">
          Get a free <span className="font-medium">@{KERABIE_DOMAIN}</span> mailbox. No credit card required.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="full-name">Full name <span className="text-muted-foreground font-normal">(optional)</span></Label>
          <Input
            id="full-name"
            type="text"
            placeholder="Your name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            autoComplete="name"
            className="rounded-none"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <div className="relative">
            <Input
              id="username"
              type="text"
              placeholder="yourname"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s/g, ''))}
              required
              autoComplete="username"
              className={cn(
                'rounded-none pr-28',
                avail === 'taken' || avail === 'invalid' ? 'border-destructive focus-visible:ring-destructive' : '',
                avail === 'available' ? 'border-emerald-500 focus-visible:ring-emerald-500' : '',
              )}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
              {availIcon}
              <span className="text-xs text-muted-foreground select-none">@{KERABIE_DOMAIN}</span>
            </div>
          </div>
          {availMsg && (
            <p className={cn('text-xs', avail === 'available' ? 'text-emerald-600' : avail === 'checking' ? 'text-muted-foreground' : 'text-destructive')}>
              {availMsg}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="At least 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
              className="rounded-none pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirm-password">Confirm password</Label>
          <Input
            id="confirm-password"
            type="password"
            placeholder="Repeat your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            autoComplete="new-password"
            className="rounded-none"
          />
        </div>

        <TurnstileWidget onVerify={setCaptchaToken} onExpire={() => setCaptchaToken(null)} />

        <Button
          type="submit"
          className="w-full rounded-none"
          disabled={loading || avail !== 'available'}
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Create account
        </Button>
      </form>

      <p className="text-xs text-center text-muted-foreground">
        By creating an account you agree to our{' '}
        <Link href="/terms" className="text-primary hover:underline">Terms of Service</Link>
        {' '}and{' '}
        <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
      </p>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link href={redirect ? `/auth/login?redirect=${encodeURIComponent(redirect)}` : '/auth/login'} className="text-primary font-medium hover:underline">Sign in</Link>
      </p>
    </div>
  );
}

// ── Register/login with your own domain ─────────────────────────────────────

function DomainForm() {
  const { refreshUser, token } = useAuth();
  const { success, error: toastError } = useAppToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect');
  const updateMailbox = useUpdateMailbox(token);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dnsConfig, setDnsConfig] = useState<DnsSetupInfo | null>(null);
  const [connectedMailboxId, setConnectedMailboxId] = useState<number | null>(null);
  const [senderName, setSenderName] = useState('');
  const [savingName, setSavingName] = useState(false);

  const goToApp = () => router.push(redirect && redirect.startsWith('/') ? redirect : '/app');

  const attemptConnect = async () => {
    setLoading(true);
    const res = await mailConnectService.connectDomain(email.trim().toLowerCase(), password);
    setLoading(false);

    if (res.status !== true) {
      toastError(typeof res.response === 'string' ? res.response : 'Could not connect that domain.');
      return;
    }

    const data = res.response as MailConnectionResponse;

    if (data.connection?.is_connected) {
      await refreshUser();
      // Skippable prompt, mirrors the mobile app's add-account success screen.
      setConnectedMailboxId(data.connection.id);
      return;
    }

    if (data.dns_setup_required && data.dns_config) {
      setDnsConfig(data.dns_config);
      success('Almost there', { description: 'Add these DNS records, then verify below.' });
      return;
    }

    toastError(data.message || 'Could not connect that domain.');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@') || !password) {
      toastError('Enter your full email address and password.');
      return;
    }
    attemptConnect();
  };

  const handleSaveName = async () => {
    const trimmed = senderName.trim();
    if (!trimmed || connectedMailboxId === null) { goToApp(); return; }
    setSavingName(true);
    const res = await updateMailbox.mutateAsync({ id: connectedMailboxId, data: { display_name: trimmed } });
    setSavingName(false);
    if (res.status === true) success('Connected!', { description: `Signed in as ${trimmed}.` });
    goToApp();
  };

  if (connectedMailboxId !== null) {
    return (
      <div className="space-y-6">
        <div className="space-y-1">
          <span className="font-mono text-[11px] uppercase tracking-[.13em] text-primary">Connected</span>
          <h1 className="text-[28px] font-bold tracking-tight">What&apos;s your name?</h1>
          <p className="text-sm text-muted-foreground">This appears as the sender name on emails you send.</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="sender-name">Full name</Label>
          <Input
            id="sender-name"
            type="text"
            placeholder="e.g. Jane Smith"
            value={senderName}
            onChange={(e) => setSenderName(e.target.value)}
            autoComplete="name"
            autoFocus
            className="rounded-none"
            onKeyDown={(e) => { if (e.key === 'Enter') handleSaveName(); }}
          />
        </div>
        <Button type="button" className="w-full rounded-none" disabled={savingName} onClick={handleSaveName}>
          {savingName && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save &amp; continue
        </Button>
        <button type="button" onClick={goToApp} className="w-full text-center text-sm text-muted-foreground hover:text-foreground">
          Skip for now
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <span className="font-mono text-[11px] uppercase tracking-[.13em] text-primary">Your own domain</span>
        <h1 className="text-[28px] font-bold tracking-tight">
          {dnsConfig ? 'Verify your domain' : 'Use your own domain'}
        </h1>
        <p className="text-sm text-muted-foreground">
          {dnsConfig
            ? 'Add these records at your domain registrar, then come back and verify.'
            : 'admin@yourdomain.com instead of a @kerabie.email address. Already have an account here? Enter its password to sign in instead.'}
        </p>
      </div>

      {dnsConfig ? (
        <div className="space-y-6">
          <DnsInstructions config={dnsConfig} />
          <Button
            type="button"
            className="w-full rounded-none"
            disabled={loading}
            onClick={attemptConnect}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            I&apos;ve added these — Verify
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            DNS changes can take a few minutes to propagate. This link expires in 72 hours.
          </p>
          {/* The account/session already exists at this point (backend sets
              auth cookies before DNS is ever verified) -- there's no reason
              to trap someone here until DNS propagates. Domain verification
              can be finished later from Settings. */}
          <button
            type="button"
            onClick={async () => { await refreshUser(); goToApp(); }}
            className="w-full text-center text-sm text-muted-foreground hover:text-foreground"
          >
            Skip for now — I&apos;ll verify later
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="domain-email">Email address</Label>
            <Input
              id="domain-email"
              type="email"
              placeholder="admin@yourdomain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="rounded-none"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="domain-password">Password</Label>
            <div className="relative">
              <Input
                id="domain-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                className="rounded-none pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <Button type="submit" className="w-full rounded-none" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Continue
          </Button>
        </form>
      )}

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link href={redirect ? `/auth/login?redirect=${encodeURIComponent(redirect)}` : '/auth/login'} className="text-primary font-medium hover:underline">Sign in</Link>
      </p>
    </div>
  );
}
