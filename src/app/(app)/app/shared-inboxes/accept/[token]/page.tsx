'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/context/auth.context';
import { useAcceptInvite } from '@/lib/hooks/useSharedInbox';

export default function AcceptInvitePage() {
  const { token: inviteToken } = useParams<{ token: string }>();
  const { token: authToken, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const acceptMutation = useAcceptInvite(authToken);

  const [state, setState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (authLoading || !inviteToken || state !== 'idle') return;

    if (!isAuthenticated) {
      router.replace(`/auth/login?redirect=/app/shared-inboxes/accept/${inviteToken}`);
      return;
    }

    setState('loading');
    acceptMutation.mutateAsync(inviteToken)
      .then(res => {
        if (res.status === true) {
          setState('success');
        } else {
          setErrorMsg(typeof res.response === 'string' ? res.response : 'Could not accept the invitation.');
          setState('error');
        }
      })
      .catch(() => {
        setErrorMsg('Something went wrong. The invite may have expired or already been accepted.');
        setState('error');
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, isAuthenticated, inviteToken]);

  if (state === 'loading' || state === 'idle') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground text-sm">Accepting invitation…</p>
      </div>
    );
  }

  if (state === 'success') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-4">
        <CheckCircle2 className="h-14 w-14 text-green-500" />
        <h1 className="text-2xl font-bold">You're in!</h1>
        <p className="text-muted-foreground max-w-sm">
          The shared inbox has been added to your account. You can access it from your inbox.
        </p>
        <Button onClick={() => router.push('/app/mail')} className="mt-2">
          Go to inbox
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-4">
      <XCircle className="h-14 w-14 text-destructive" />
      <h1 className="text-2xl font-bold">Invitation failed</h1>
      <p className="text-muted-foreground max-w-sm">{errorMsg}</p>
      <Button variant="outline" onClick={() => router.push('/app/settings/shared-inbox')} className="mt-2">
        Back to settings
      </Button>
    </div>
  );
}
