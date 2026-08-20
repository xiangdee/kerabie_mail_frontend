'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAppToast } from '@/components/ui/app-toast';
import { useAuth } from '@/lib/context/auth.context';
import { useUpdateMailbox } from '@/lib/hooks/useMailboxes';
import { mailConnectService, type DnsRecord, type DnsSetupInfo, type MailConnectionResponse } from '@/lib/services/mail-connect.service';

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

export default function RegisterDomainPage() {
  const { refreshUser, token } = useAuth();
  const { success, error: toastError } = useAppToast();
  const router = useRouter();
  const updateMailbox = useUpdateMailbox(token);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dnsConfig, setDnsConfig] = useState<DnsSetupInfo | null>(null);
  const [connectedMailboxId, setConnectedMailboxId] = useState<number | null>(null);
  const [senderName, setSenderName] = useState('');
  const [savingName, setSavingName] = useState(false);

  const goToApp = () => router.push('/app/settings');

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
      // "What's your name?" is a skippable prompt shown once, right after a
      // fresh connect — mirrors the mobile app's add-account success screen,
      // which this flow otherwise has no equivalent of.
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

  const handleSaveName = async () => {
    const trimmed = senderName.trim();
    if (!trimmed || connectedMailboxId === null) { goToApp(); return; }
    setSavingName(true);
    const res = await updateMailbox.mutateAsync({ id: connectedMailboxId, data: { display_name: trimmed } });
    setSavingName(false);
    if (res.status === true) success('Connected!', { description: `Signed in as ${trimmed}.` });
    goToApp();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@') || !password) {
      toastError('Enter your full email address and password.');
      return;
    }
    attemptConnect();
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
          {dnsConfig ? 'Verify your domain' : 'Register with your own domain'}
        </h1>
        <p className="text-sm text-muted-foreground">
          {dnsConfig
            ? `Add these records at your domain registrar, then come back and verify.`
            : 'Use admin@yourdomain.com instead of a @kerabie.email address. We’ll walk you through DNS setup.'}
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
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
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
            <p className="text-xs text-muted-foreground">
              This becomes your Kerabie Mail login password. If this address already has an account, enter its existing password to sign in instead.
            </p>
          </div>

          <Button type="submit" className="w-full rounded-none" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Continue
          </Button>
        </form>
      )}

      <p className="text-center text-sm text-muted-foreground">
        Want a free @kerabie.email address instead?{' '}
        <Link href="/auth/register" className="text-primary font-medium hover:underline">Sign up that way</Link>
      </p>
      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link href="/auth/login" className="text-primary font-medium hover:underline">Sign in</Link>
      </p>
    </div>
  );
}
