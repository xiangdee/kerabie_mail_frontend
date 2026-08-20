'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppToast } from '@/components/ui/app-toast';
import { CheckCircle2, Eye, EyeOff, Loader2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/lib/context/auth.context';
import { authService } from '@/lib/services/auth.service';
import { cn } from '@/lib/utils';

const KERABIE_DOMAIN = 'kerabie.email';
const USERNAME_RE = /^[a-z0-9]([a-z0-9._-]{1,28}[a-z0-9])?$/;

type AvailState = 'idle' | 'checking' | 'available' | 'taken' | 'invalid';

export default function RegisterPage() {
  const { register } = useAuth();
  const { success, error: toastError, warning } = useAppToast();
  const router = useRouter();

  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [avail, setAvail] = useState<AvailState>('idle');

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
    setLoading(true);
    const result = await register(username.toLowerCase().trim(), password, fullName || undefined);
    setLoading(false);
    if (result.ok) {
      success('Account created!', { description: `Your mailbox ${username}@${KERABIE_DOMAIN} is ready.` });
      router.push('/app/settings');
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
        <Link href="/auth/login" className="text-primary font-medium hover:underline">Sign in</Link>
      </p>
    </div>
  );
}
