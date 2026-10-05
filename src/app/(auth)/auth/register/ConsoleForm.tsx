'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, Loader2, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { useAppToast } from '@/components/ui/app-toast';
import { useAuth } from '@/lib/context/auth.context';
import { authService } from '@/lib/services/auth.service';
import TurnstileWidget from '@/components/TurnstileWidget';

// Mirrors the backend's resend throttle (app/routes/console_auth.py).
const RESEND_COOLDOWN_SECONDS = 60;

// Console-only signup, like Brevo: any email address, no Kerabie mailbox.
// Step 1 collects the account details; step 2 confirms the emailed code,
// which is also where an unverified account lands after a blocked sign-in
// (/auth/register?verify=<email>).
export default function ConsoleForm() {
  const { registerConsole, verifyEmail } = useAuth();
  const { success, error: toastError, warning } = useAppToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect');
  const resumeEmail = searchParams.get('verify');

  const [step, setStep] = useState<'details' | 'code'>(resumeEmail ? 'code' : 'details');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState(resumeEmail ?? '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(resumeEmail ? 0 : RESEND_COOLDOWN_SECONDS);

  useEffect(() => {
    if (step !== 'code' || cooldown <= 0) return;
    const id = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(id);
  }, [step, cooldown]);

  const handleDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) { warning('Passwords do not match'); return; }
    if (password.length < 8) { warning('Password must be at least 8 characters'); return; }
    if (!captchaToken) { warning('Please complete the captcha'); return; }
    setLoading(true);
    const result = await registerConsole(email.trim().toLowerCase(), password, fullName || undefined, captchaToken);
    setLoading(false);
    if (result.ok) {
      success('Check your email', { description: `We sent a 6-digit code to ${email.trim()}.` });
      setCooldown(RESEND_COOLDOWN_SECONDS);
      setStep('code');
    } else {
      toastError(typeof result.error === 'string' ? result.error : 'Registration failed');
    }
  };

  const handleVerify = async (value = code) => {
    if (value.length < 6 || loading) return;
    setLoading(true);
    const result = await verifyEmail(email.trim().toLowerCase(), value);
    setLoading(false);
    if (result.ok) {
      success('Email verified');
      // Same destination as the other signup paths: verify-phone redirects on
      // to /app itself when verification doesn't apply.
      router.push(redirect && redirect.startsWith('/') ? redirect : '/auth/verify-phone');
    } else {
      setCode('');
      toastError(typeof result.error === 'string' ? result.error : 'Verification failed');
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;
    await authService.resendVerification(email.trim().toLowerCase());
    setCooldown(RESEND_COOLDOWN_SECONDS);
    success('Code sent', { description: 'If the account is awaiting verification, a new code is on its way.' });
  };

  if (step === 'code') {
    return (
      <div className="space-y-6">
        <div className="space-y-1">
          <span className="font-mono text-[11px] uppercase tracking-[.13em] text-primary">Verify email</span>
          <h1 className="text-[28px] font-bold tracking-tight">Enter your code</h1>
          <p className="text-sm text-muted-foreground">
            We sent a 6-digit code to <span className="font-medium text-foreground">{email}</span>. It expires in 15 minutes.
          </p>
        </div>

        <InputOTP maxLength={6} value={code} onChange={setCode} onComplete={handleVerify} autoFocus>
          <InputOTPGroup className="gap-2 justify-center w-full">
            {Array.from({ length: 6 }, (_, i) => (
              <InputOTPSlot key={i} index={i} className="h-12 w-11 rounded-none border text-lg" />
            ))}
          </InputOTPGroup>
        </InputOTP>

        <Button className="w-full rounded-none" disabled={loading || code.length < 6} onClick={() => handleVerify()}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShieldCheck className="mr-2 h-4 w-4" />}
          Verify email
        </Button>

        <div className="flex items-center justify-center gap-1 text-xs">
          <span className="text-muted-foreground">Didn&apos;t get a code?</span>
          <button
            type="button"
            className="text-primary hover:underline disabled:text-muted-foreground disabled:no-underline disabled:cursor-not-allowed"
            disabled={cooldown > 0}
            onClick={handleResend}
          >
            {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend code'}
          </button>
        </div>
        <button
          type="button"
          onClick={() => { setStep('details'); setCode(''); }}
          className="w-full text-xs text-muted-foreground hover:underline"
        >
          Use a different email
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <span className="font-mono text-[11px] uppercase tracking-[.13em] text-primary">Any email</span>
        <h1 className="text-[28px] font-bold tracking-tight">Create your account</h1>
        <p className="text-sm text-muted-foreground">
          Sign up with any email address, like Gmail or your work email, to use the dashboard. No Kerabie mailbox needed.
        </p>
      </div>

      <form onSubmit={handleDetails} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="console-name">Full name <span className="text-muted-foreground font-normal">(optional)</span></Label>
          <Input id="console-name" type="text" placeholder="Your name" value={fullName}
            onChange={(e) => setFullName(e.target.value)} autoComplete="name" className="rounded-none" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="console-email">Email address</Label>
          <Input id="console-email" type="email" placeholder="you@example.com" value={email}
            onChange={(e) => setEmail(e.target.value)} required autoComplete="email" className="rounded-none" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="console-password">Password</Label>
          <div className="relative">
            <Input id="console-password" type={showPassword ? 'text' : 'password'} placeholder="At least 8 characters"
              value={password} onChange={(e) => setPassword(e.target.value)} required
              autoComplete="new-password" className="rounded-none pr-10" />
            <button type="button" onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="console-confirm">Confirm password</Label>
          <Input id="console-confirm" type="password" placeholder="Repeat your password" value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)} required autoComplete="new-password" className="rounded-none" />
        </div>

        <TurnstileWidget onVerify={setCaptchaToken} onExpire={() => setCaptchaToken(null)} />

        <Button type="submit" className="w-full rounded-none" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Continue
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
