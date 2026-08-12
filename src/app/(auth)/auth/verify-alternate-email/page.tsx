'use client';
import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, CheckCircle, Loader2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { mailPasswordService } from '@/lib/services/mail-password.service';

export default function VerifyAlternateEmailPage() {
  return (
    <Suspense>
      <VerifyAlternateEmailForm />
    </Suspense>
  );
}

function VerifyAlternateEmailForm() {
  const params = useSearchParams();
  const token = params.get('token') ?? '';
  const email = params.get('email') ?? '';

  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!token || !email) {
      setStatus('error');
      setErrorMsg('This link is missing required information.');
      return;
    }

    mailPasswordService.verifyAlternateEmail(email, token).then((res) => {
      if (res.status === true) {
        setStatus('success');
      } else {
        setStatus('error');
        setErrorMsg(typeof res.response === 'string' ? res.response : 'This link is invalid or has expired.');
      }
    });
  }, [token, email]);

  if (status === 'verifying') {
    return (
      <div className="space-y-6 text-center">
        <div className="flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground">Verifying your alternate email…</p>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="space-y-6 text-center">
        <div className="flex justify-center">
          <div className="rounded-full bg-green-100 dark:bg-green-950/40 p-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Alternate email verified</h1>
          <p className="text-sm text-muted-foreground">
            This address can now be used to recover <strong>{email}</strong> if you ever get
            locked out.
          </p>
        </div>
        <Link href="/auth/login">
          <Button className="w-full">Sign in</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-center">
      <div className="flex justify-center">
        <div className="rounded-full bg-destructive/10 p-4">
          <XCircle className="h-8 w-8 text-destructive" />
        </div>
      </div>
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Verification failed</h1>
        <p className="text-sm text-muted-foreground">{errorMsg}</p>
      </div>
      <Link href="/auth/login" className="flex items-center justify-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3 w-3" /> Back to sign in
      </Link>
    </div>
  );
}
