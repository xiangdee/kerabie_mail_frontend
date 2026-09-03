'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import { Barlow, Barlow_Condensed, IBM_Plex_Mono } from 'next/font/google';
import { Loader2, Menu, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { SidebarProvider, useSidebar } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { blackblazebucket } from '@/lib/constants/links';
import { AppSidebar } from '@/components/app/AppSidebar';
import { useAuth } from '@/lib/context/auth.context';
import { usePhoneStatus } from '@/lib/hooks/usePhoneVerification';
import PhoneVerificationModal from '@/components/app/PhoneVerificationModal';
import AlternateEmailNagModal from '@/components/app/AlternateEmailNagModal';
import { ConnectionRibbon } from '@/components/app/ConnectionRibbon';
import { useMailboxes } from '@/lib/hooks/useMailboxes';
import { useUsage } from '@/lib/hooks/useUsage';

// The "Kerabie Console" design system — Barlow/Barlow Condensed body+display,
// IBM Plex Mono for kickers/labels, scoped to the /app shell only (not the
// marketing site or auth pages).
const barlow = Barlow({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-barlow' });
const barlowCondensed = Barlow_Condensed({ subsets: ['latin'], weight: ['500', '600', '700'], variable: '--font-barlow-condensed' });
const plexMono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-plex-mono' });

const CRUMBS: { match: (path: string) => boolean; label: string }[] = [
  { match: (p) => p === '/app', label: 'Overview' },
  { match: (p) => p === '/app/settings', label: 'Profile' },
  { match: (p) => p.startsWith('/app/settings/security'), label: 'Security' },
  { match: (p) => p.startsWith('/app/settings/billing'), label: 'Billing' },
  { match: (p) => p.startsWith('/app/settings/notifications'), label: 'Notifications' },
  { match: (p) => p.startsWith('/app/settings/mailboxes'), label: 'Mailboxes' },
  { match: (p) => p.startsWith('/app/settings/domains'), label: 'Domains' },
  { match: (p) => p.startsWith('/app/settings/forwarding'), label: 'Forwarding' },
  { match: (p) => p.startsWith('/app/settings/aliases'), label: 'Aliases' },
  { match: (p) => p.startsWith('/app/settings/shared-inbox'), label: 'Shared inboxes' },
  { match: (p) => p.startsWith('/app/settings/unsubscribes'), label: 'Unsubscribes' },
  { match: (p) => p.startsWith('/app/templates'), label: 'Templates' },
  { match: (p) => p.startsWith('/app/settings/branding'), label: 'Branding' },
  { match: (p) => p.startsWith('/app/contacts'), label: 'Contacts' },
  { match: (p) => p.startsWith('/app/campaigns'), label: 'Campaigns' },
  { match: (p) => p.startsWith('/app/settings/api-keys'), label: 'API keys' },
  { match: (p) => p.startsWith('/app/settings/webhooks'), label: 'Webhooks' },
  { match: (p) => p.startsWith('/app/api-console'), label: 'API console' },
  { match: (p) => p.startsWith('/app/partner'), label: 'Partner' },
];

// Gate everyone who hasn't verified AND hasn't actually paid — trial
// accounts (free Pro access, no card) and free-forever accounts alike.
// Scoping this to isTrial only (the old, since-fixed bug) left a real
// abuse hole: once a trial expires and downgrades to free, is_trial flips
// to false and the gate would stop applying forever, even for an account
// that was never verified — exactly the bot/spam case this exists to
// prevent. plan_status !== 'free' with is_trial === false means a real
// paid subscription (the only case that should be exempt, per "no
// verification needed once you've signed up with a card").
function ownsAPaidPlan(user: { plan_status?: string; is_trial?: boolean } | null | undefined): boolean {
  return !!user && user.plan_status !== 'free' && user.is_trial !== true;
}

function PhoneVerificationGate({ children }: { children: React.ReactNode }) {
  const { user, token } = useAuth();
  const { data: phoneStatus, refetch } = usePhoneStatus(token);
  const [dismissed, setDismissed] = useState(false);

  const needsVerification =
    !ownsAPaidPlan(user) &&
    phoneStatus !== undefined &&
    phoneStatus !== null &&
    !phoneStatus.is_verified &&
    !dismissed;

  return (
    <>
      {children}
      {token && needsVerification && (
        <PhoneVerificationModal
          open
          token={token}
          onVerified={() => {
            refetch();
            setDismissed(true);
          }}
        />
      )}
    </>
  );
}

// SidebarTrigger (components/ui/sidebar.tsx) hardcodes its own icon as
// children and doesn't actually forward an asChild override despite
// accepting the prop — passing `asChild` through to it just leaks onto the
// underlying Button/Slot with two children and crashes. Toggle directly.
// Works for both the mobile drawer and the desktop collapse (toggleSidebar
// itself branches on isMobile), so one button covers both breakpoints.
function SidebarToggleButton() {
  const { toggleSidebar, state, isMobile } = useSidebar();
  const collapsed = !isMobile && state === 'collapsed';
  return (
    <button
      type="button"
      onClick={toggleSidebar}
      title={collapsed ? 'Show sidebar' : 'Hide sidebar'}
      className="flex items-center justify-center h-8 w-8 shrink-0 border border-console-border bg-transparent text-console-muted2 hover:border-console-accent hover:text-console-accent transition-colors"
    >
      {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <Menu className="h-4 w-4 md:hidden" />}
      {!collapsed && <PanelLeftClose className="h-4 w-4 hidden md:block" />}
    </button>
  );
}

// "Add a recovery email" nag — alternate_email lives on the UserEmail row
// (per mailbox, not per account), shown once ever per mailbox rather than
// every load: a skipped recovery-email prompt reappearing constantly would
// just be annoying, not useful. Nested inside PhoneVerificationGate so it
// never stacks on top of that (mandatory) dialog.
function AlternateEmailGate({ children }: { children: React.ReactNode }) {
  const { user, token } = useAuth();
  const { data: mailboxes } = useMailboxes(token);
  const { data: phoneStatus } = usePhoneStatus(token);
  const [dismissed, setDismissed] = useState(false);
  const router = useRouter();

  const phoneGateActive = !ownsAPaidPlan(user) && phoneStatus !== undefined && phoneStatus !== null && !phoneStatus.is_verified;

  const mailbox = mailboxes?.find((m) => m.email_address === user?.email);
  const storageKey = mailbox ? `alt_email_prompted:${mailbox.email_address}` : null;
  const alreadyPrompted = storageKey && typeof window !== 'undefined'
    ? window.localStorage.getItem(storageKey)
    : null;

  const needsPrompt =
    !phoneGateActive &&
    !!mailbox &&
    mailbox.connection_type === 'dns' &&
    !mailbox.alternate_email_verified &&
    !alreadyPrompted &&
    !dismissed;

  const markPrompted = () => {
    setDismissed(true);
    if (storageKey) window.localStorage.setItem(storageKey, '1');
  };

  return (
    <>
      {children}
      <AlternateEmailNagModal
        open={needsPrompt}
        onSkip={markPrompted}
        onAddNow={() => {
          markPrompted();
          router.push('/app/settings/security');
        }}
      />
    </>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, token, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { data: usage } = useUsage(isAuthenticated ? token : null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/auth/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  const crumb = CRUMBS.find((c) => c.match(pathname))?.label ?? 'Overview';
  const planLabel = user?.plan_status ?? 'free';

  return (
    <SidebarProvider className={cn('app-console', barlow.variable, barlowCondensed.variable, plexMono.variable, 'font-[family-name:var(--font-barlow)]')}>
      <AppSidebar />
      <main className="flex-1 flex flex-col min-h-screen overflow-hidden bg-console-bg text-console-ink">
        <ConnectionRibbon />
        <div className="flex items-center gap-4 min-h-16 border-b border-console-border px-4 sm:px-8 shrink-0">
          <SidebarToggleButton />
          <div className="md:hidden flex items-center shrink-0">
            <Image src={blackblazebucket + '/assets/images/logo.png'} alt="Kerabie" width={48} height={29} priority className="h-4 w-auto" />
          </div>
          <div className="hidden sm:block font-[family-name:var(--font-plex-mono)] text-[11px] tracking-[0.1em] text-console-muted2 truncate">
            CONSOLE&nbsp;/&nbsp;<span className="text-console-ink">{crumb.toUpperCase()}</span>
          </div>
          <div className="sm:hidden font-[family-name:var(--font-barlow-condensed)] font-semibold text-base text-console-ink truncate">
            {crumb}
          </div>
          <div className="flex-1" />
          <div className="hidden sm:flex items-center gap-2 border border-console-border h-9 px-3 shrink-0">
            <span className="h-1.5 w-1.5 bg-console-accent shrink-0" />
            <span className="font-[family-name:var(--font-plex-mono)] text-[10.5px] tracking-[0.06em] text-console-ink/80 capitalize">
              {planLabel} plan{usage ? ` · ${usage.mailboxes.used}/${usage.mailboxes.limit === -1 ? '∞' : usage.mailboxes.limit} mailboxes` : ''}
            </span>
          </div>
        </div>
        <div className="flex-1 overflow-auto">
          <PhoneVerificationGate>
            <AlternateEmailGate>
              {children}
            </AlternateEmailGate>
          </PhoneVerificationGate>
        </div>
      </main>
    </SidebarProvider>
  );
}
