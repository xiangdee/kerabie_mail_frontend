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

function LoginForm() {
  const { login } = useAuth();
  const { success, error: toastError } = useAppToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (result.ok) {
      success('Welcome back!');
      // Honor a same-origin ?redirect= (e.g. from the OAuth consent flow
      // bouncing an unauthenticated user here) — only ever a relative path,
      // never an absolute/external URL, so this can't become an open redirect.
      const redirect = searchParams.get('redirect');
      router.push(redirect && redirect.startsWith('/') ? redirect : '/app/settings');
    } else {
      toastError(result.error || 'Invalid credentials');
    }
  };

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
