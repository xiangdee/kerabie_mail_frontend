'use client';
import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/context/auth.context';
import { useMailboxes } from '@/lib/hooks/useMailboxes';
import { customAxiosGet, customAxiosPost } from '@/lib/utils/CustomAxiosRequest';
import { apiLink } from '@/lib/constants/links';
import { useAppToast } from '@/components/ui/app-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle, BadgeCheck, Check, ExternalLink, Loader2, Mail } from 'lucide-react';

// What GET /oauth/client returns: public facts about the application asking, and exactly what for.
interface ClientInfo {
  name: string;
  description: string | null;
  logo_url: string | null;
  homepage_url: string | null;
  verified: boolean; // built and run by Kerabie
  redirect_host: string; // where the browser goes next
  scopes: { id: string; label: string; description: string }[];
  requires_pkce: boolean;
}

function ClientLogo({ info }: { info: ClientInfo }) {
  const [failed, setFailed] = useState(false);
  if (info.logo_url && !failed) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={info.logo_url} alt="" className="w-12 h-12 rounded-xl object-contain bg-muted" onError={() => setFailed(true)} />;
  }
  return (
    <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-lg font-semibold">
      {info.name.charAt(0).toUpperCase()}
    </div>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4 py-8">{children}</div>;
}

function AuthorizeInner() {
  const params = useSearchParams();
  const router = useRouter();
  const { error: toastError } = useAppToast();
  const { isAuthenticated, isLoading: authLoading, token, user, logout } = useAuth();
  const [switching, setSwitching] = useState(false);

  const clientId = params.get('client_id');
  const redirectUri = params.get('redirect_uri');
  const state = params.get('state');
  const scope = params.get('scope');
  const codeChallenge = params.get('code_challenge');
  const codeChallengeMethod = params.get('code_challenge_method');

  // The link's values come from the URL, so they're untrusted until the server confirms them: a crafted link must
  // never be able to send the browser to an arbitrary redirect_uri (e.g. via Cancel), or show a misleading screen.
  const [info, setInfo] = useState<ClientInfo | null>(null);
  const [linkCheck, setLinkCheck] = useState<'checking' | 'valid' | 'invalid'>('checking');
  const [linkError, setLinkError] = useState<string | null>(null);

  const { data: mailboxes = [], isLoading: mailboxesLoading } = useMailboxes(token);
  const [selected, setSelected] = useState<string[]>([]);
  const [preselected, setPreselected] = useState(false);
  const [approving, setApproving] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      const returnTo = `/oauth/authorize?${params.toString()}`;
      router.replace(`/auth/login?redirect=${encodeURIComponent(returnTo)}`);
    }
  }, [authLoading, isAuthenticated, params, router]);

  useEffect(() => {
    // Start with the first mailbox ticked, once. After that the user's choices are never overridden.
    if (!preselected && mailboxes.length > 0) {
      setSelected([mailboxes[0].email_address]);
      setPreselected(true);
    }
  }, [mailboxes, preselected]);

  const toggleMailbox = (email: string) =>
    setSelected((cur) => (cur.includes(email) ? cur.filter((e) => e !== email) : [...cur, email]));
  const allSelected = mailboxes.length > 0 && selected.length === mailboxes.length;
  const toggleAll = () => setSelected(allSelected ? [] : mailboxes.map((m) => m.email_address));

  const missingParams = !clientId || !redirectUri;

  useEffect(() => {
    if (!clientId || !redirectUri) return;
    let cancelled = false;
    customAxiosGet(`${apiLink}/oauth/client`, { client_id: clientId, redirect_uri: redirectUri, scope: scope || undefined })
      .then((res) => {
        if (cancelled) return;
        if (res.status === true) {
          setInfo(res.response as ClientInfo);
          setLinkCheck('valid');
        } else {
          // The server says why a scope request is wrong; anything else stays deliberately vague.
          setLinkError(typeof res.response === 'string' && /scope|PKCE/i.test(res.response) ? res.response : null);
          setLinkCheck('invalid');
        }
      })
      .catch(() => { if (!cancelled) setLinkCheck('invalid'); });
    return () => { cancelled = true; };
  }, [clientId, redirectUri, scope]);

  const handleApprove = async () => {
    if (!clientId || !redirectUri || selected.length === 0) return;
    setApproving(true);
    try {
      const res = await customAxiosPost(`${apiLink}/oauth/consent`, {
        client_id: clientId,
        redirect_uri: redirectUri,
        mailbox_emails: selected,
        state: state || undefined,
        scope: scope || undefined,
        code_challenge: codeChallenge || undefined,
        code_challenge_method: codeChallengeMethod || undefined,
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

  // Signing out drops back to the login screen (the effect above), which returns here afterwards.
  const handleSwitchAccount = async () => {
    setSwitching(true);
    try { await logout(); } finally { setSwitching(false); }
  };

  const handleCancel = () => {
    // Only a redirect_uri the server has confirmed is the registered callback is ever navigated to.
    if (redirectUri && linkCheck === 'valid') {
      window.location.href = `${redirectUri}${redirectUri.includes('?') ? '&' : '?'}error=access_denied${state ? `&state=${encodeURIComponent(state)}` : ''}`;
    } else {
      router.push('/app/mail');
    }
  };

  if (authLoading || (isAuthenticated && (mailboxesLoading || (!missingParams && linkCheck === 'checking')))) {
    return (
      <Shell>
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-12 w-12 rounded-xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            </div>
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-24 w-full" />
          </CardContent>
        </Card>
      </Shell>
    );
  }

  if (!isAuthenticated) return null; // redirecting to login

  if (missingParams || linkCheck === 'invalid' || !info) {
    return (
      <Shell>
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 space-y-2">
            <p className="font-medium">This authorization link isn&apos;t valid</p>
            <p className="text-sm text-muted-foreground">
              {linkError ?? 'Go back to the application you were connecting from and start again.'}
            </p>
          </CardContent>
        </Card>
      </Shell>
    );
  }

  return (
    <Shell>
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4 pb-2">
          <div className="flex items-center gap-3">
            <ClientLogo info={info} />
            <div className="min-w-0">
              <h1 className="text-lg font-semibold leading-tight truncate">{info.name}</h1>
              {info.verified ? (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-primary">
                  <BadgeCheck className="w-3.5 h-3.5" /> Verified by Kerabie
                </span>
              ) : (
                <span className="text-xs text-muted-foreground">Third-party application</span>
              )}
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            {info.description ? `${info.description} ` : ''}
            <span className="text-foreground font-medium">{info.name}</span> wants to connect to your mailboxes.
          </p>
        </CardHeader>

        <CardContent className="space-y-5 pt-2">
          {/* Exactly what access is being asked for */}
          <div className="rounded-xl border p-4 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">It will be able to</p>
            <ul className="space-y-2.5">
              {info.scopes.map((s) => (
                <li key={s.id} className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium leading-tight">{s.label}</p>
                    <p className="text-xs text-muted-foreground">{s.description}</p>
                  </div>
                </li>
              ))}
            </ul>
            <p className="text-xs text-muted-foreground border-t pt-3">
              Only the mailboxes you choose below — nothing else on your account.
            </p>
          </div>

          {!info.verified && (
            <div className="flex gap-2.5 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 p-3 dark:bg-amber-950/30 dark:text-amber-200 dark:border-amber-900">
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
              <p className="text-xs leading-relaxed">
                {info.name} is not made by Kerabie. Only continue if you trust it with the access listed above.
              </p>
            </div>
          )}

          {mailboxes.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              You don&apos;t have any mailboxes yet. Add one in your Kerabie Mail settings first.
            </p>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Choose mailboxes</p>
                {mailboxes.length > 1 && (
                  <button type="button" onClick={toggleAll} disabled={approving} className="text-xs text-primary hover:underline disabled:opacity-50">
                    {allSelected ? 'Clear all' : 'Select all'}
                  </button>
                )}
              </div>
              <div className="space-y-2">
                {mailboxes.map((mb) => (
                  <label
                    key={mb.id}
                    htmlFor={`mb-${mb.id}`}
                    className="flex items-center gap-3 rounded-lg border p-3 cursor-pointer hover:bg-muted/50 has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5"
                  >
                    <Checkbox
                      id={`mb-${mb.id}`}
                      checked={selected.includes(mb.email_address)}
                      onCheckedChange={() => toggleMailbox(mb.email_address)}
                    />
                    <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{mb.email_address}</p>
                      {mb.display_name && <p className="text-xs text-muted-foreground truncate">{mb.display_name}</p>}
                    </div>
                  </label>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Each mailbox gets its own separate access. {info.name} sees only the ones you tick.
              </p>
            </div>
          )}

          {user && (
            <p className="text-center text-xs text-muted-foreground">
              Signed in as <span className="font-medium text-foreground">{user.email}</span>.{' '}
              <button type="button" onClick={handleSwitchAccount} disabled={switching || approving} className="text-primary hover:underline disabled:opacity-50">
                Not you? Switch account
              </button>
            </p>
          )}

          <div className="flex gap-2 pt-1">
            <Button variant="outline" className="flex-1" onClick={handleCancel} disabled={approving}>
              Cancel
            </Button>
            <Button className="flex-1" onClick={handleApprove} disabled={approving || selected.length === 0 || mailboxes.length === 0}>
              {approving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {selected.length > 1 ? `Allow access to ${selected.length} mailboxes` : 'Allow access'}
            </Button>
          </div>

          <div className="space-y-1 text-center">
            <p className="text-xs text-muted-foreground inline-flex items-center gap-1">
              <ExternalLink className="w-3 h-3" /> You&apos;ll be taken to <span className="font-medium text-foreground">{info.redirect_host}</span>
            </p>
            <p className="text-[11px] text-muted-foreground">
              You can revoke this at any time from Settings → API Keys in Kerabie Mail.
            </p>
          </div>
        </CardContent>
      </Card>
    </Shell>
  );
}

export default function OAuthAuthorizePage() {
  return (
    <Suspense fallback={null}>
      <AuthorizeInner />
    </Suspense>
  );
}
