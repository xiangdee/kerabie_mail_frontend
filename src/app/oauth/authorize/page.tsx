'use client';
import { Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/context/auth.context';
import { useMailboxes } from '@/lib/hooks/useMailboxes';
import { customAxiosPost } from '@/lib/utils/CustomAxiosRequest';
import { apiLink } from '@/lib/constants/links';
import { useAppToast } from '@/components/ui/app-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Mail, ShieldCheck, Loader2 } from 'lucide-react';

// Single trusted first-party client for now (see backend's
// app/routes/oauth.py::_TRUSTED_CLIENTS) — client_id isn't secret, just an
// identifier, so it's safe to pattern-match here for display purposes only.
// The actual authorization boundary is enforced server-side in /oauth/consent.
function clientDisplayName(clientId: string | null): string {
  if (clientId?.startsWith('kerabie_chat_')) return 'Kerabie Chat';
  return 'This application';
}

function AuthorizeInner() {
  const params = useSearchParams();
  const router = useRouter();
  const { error: toastError } = useAppToast();
  const { isAuthenticated, isLoading: authLoading, token } = useAuth();

  const clientId = params.get('client_id');
  const redirectUri = params.get('redirect_uri');
  const state = params.get('state');

  const { data: mailboxes = [], isLoading: mailboxesLoading } = useMailboxes(token);
  const [selected, setSelected] = useState<string>('');
  const [approving, setApproving] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      const returnTo = `/oauth/authorize?${params.toString()}`;
      router.replace(`/auth/login?redirect=${encodeURIComponent(returnTo)}`);
    }
  }, [authLoading, isAuthenticated, params, router]);

  useEffect(() => {
    if (!selected && mailboxes.length > 0) {
      setSelected(mailboxes[0].email_address);
    }
  }, [mailboxes, selected]);

  const missingParams = !clientId || !redirectUri;

  const handleApprove = async () => {
    if (!clientId || !redirectUri || !selected) return;
    setApproving(true);
    try {
      const res = await customAxiosPost(`${apiLink}/oauth/consent`, {
        client_id: clientId,
        redirect_uri: redirectUri,
        mailbox_email: selected,
        state: state || undefined,
      });
      if (res.status === true) {
        window.location.href = (res.response as { redirect_url: string }).redirect_url;
      } else {
        toastError('Could not complete authorization', { description: res.response as string });
        setApproving(false);
      }
    } catch {
      toastError('Could not complete authorization');
      setApproving(false);
    }
  };

  const handleCancel = () => {
    if (redirectUri) {
      window.location.href = `${redirectUri}?error=access_denied`;
    } else {
      router.push('/app/mail');
    }
  };

  const clientName = useMemo(() => clientDisplayName(clientId), [clientId]);

  if (authLoading || (isAuthenticated && mailboxesLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 space-y-4">
            <Skeleton className="h-6 w-2/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-24 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAuthenticated) return null; // redirecting to login

  if (missingParams) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">
              This authorization link is missing required parameters. Ask the application you were
              connecting from to try again.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-3 pb-2">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">{clientName} wants to connect a mailbox</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Choose which Kerabie Mail address to connect. {clientName} will be able to read and
              send email as this address only — nothing else on your account.
            </p>
          </div>
        </CardHeader>
        <CardContent className="space-y-5 pt-2">
          {mailboxes.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              You don&apos;t have any mailboxes yet. Add one in your Kerabie Mail settings first.
            </p>
          ) : (
            <RadioGroup value={selected} onValueChange={setSelected} className="space-y-2">
              {mailboxes.map((mb) => (
                <label
                  key={mb.id}
                  htmlFor={`mb-${mb.id}`}
                  className="flex items-center gap-3 rounded-lg border p-3 cursor-pointer hover:bg-muted/50 has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5"
                >
                  <RadioGroupItem value={mb.email_address} id={`mb-${mb.id}`} />
                  <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{mb.email_address}</p>
                    {mb.display_name && (
                      <p className="text-xs text-muted-foreground truncate">{mb.display_name}</p>
                    )}
                  </div>
                </label>
              ))}
            </RadioGroup>
          )}

          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1" onClick={handleCancel} disabled={approving}>
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handleApprove}
              disabled={approving || !selected || mailboxes.length === 0}
            >
              {approving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Approve
            </Button>
          </div>

          <p className="text-[11px] text-muted-foreground text-center">
            You can revoke this at any time from Settings → API Keys in Kerabie Mail.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function OAuthAuthorizePage() {
  return (
    <Suspense fallback={null}>
      <AuthorizeInner />
    </Suspense>
  );
}
