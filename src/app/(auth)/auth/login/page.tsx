'use client';
import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppToast } from '@/components/ui/app-toast';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/lib/context/auth.context';
import TurnstileWidget from '@/components/TurnstileWidget';

function LoginForm() {
  const { login, verifyTwoFactor } = useAuth();
  const { success, error: toastError } = useAppToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pendingToken, setPendingToken] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  const goHome = () => {
    success('Welcome back!');
    // Honor a same-origin ?redirect= (e.g. from the OAuth consent flow
    // bouncing an unauthenticated user here) — only ever a relative path,
    // never an absolute/external URL, so this can't become an open redirect.
    const redirect = searchParams.get('redirect');
    router.push(redirect && redirect.startsWith('/') ? redirect : '/app');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!captchaToken) {
      toastError('Please complete the captcha');
      return;
    }
    setLoading(true);
    const result = await login(email, password, captchaToken);
    setLoading(false);
    if (result.ok) {
      goHome();
    } else if (result.requires2fa) {
      setPendingToken(result.pendingToken);
    } else {
      toastError(result.error || 'Invalid credentials');
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingToken) return;
    setLoading(true);
    const result = await verifyTwoFactor(pendingToken, code);
    setLoading(false);
    if (result.ok) {
      goHome();
    } else {
      toastError(result.error || 'Incorrect code');
    }
  };

  if (pendingToken) {
    return (
      <div className="space-y-6">
        <div className="space-y-1">
          <span className="font-mono text-[11px] uppercase tracking-[.13em] text-primary">Two-factor authentication</span>
          <h1 className="text-[28px] font-bold tracking-tight">Enter your code</h1>
          <p className="text-sm text-muted-foreground">
            Enter the 6-digit code from your authenticator app, or one of your backup codes.
          </p>
        </div>
        <form onSubmit={handleVerifyCode} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="totp-code">Code</Label>
            <Input
              id="totp-code"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="123456"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
              autoFocus
              className="rounded-none"
            />
          </div>
          <Button type="submit" className="w-full rounded-none" disabled={loading || !code.trim()}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Verify
          </Button>
          <button
            type="button"
            onClick={() => { setPendingToken(null); setCode(''); }}
            className="w-full text-center text-sm text-muted-foreground hover:text-foreground"
          >
            ← Back to sign in
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <span className="font-mono text-[11px] uppercase tracking-[.13em] text-primary">Welcome back</span>
        <h1 className="text-[28px] font-bold tracking-tight">Sign in</h1>
        <p className="text-sm text-muted-foreground">Enter your email and password to access your inbox.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@yourdomain.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="rounded-none"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link href="/auth/forgot-password" className="text-xs text-primary hover:underline">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
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

        <TurnstileWidget onVerify={setCaptchaToken} onExpire={() => setCaptchaToken(null)} />

        <Button type="submit" className="w-full rounded-none" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Sign in
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{' '}
        <Link
          href={searchParams.get('redirect') ? `/auth/register?redirect=${encodeURIComponent(searchParams.get('redirect')!)}` : '/auth/register'}
          className="text-primary font-medium hover:underline"
        >
          Create one
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
