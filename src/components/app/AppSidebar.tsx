'use client';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { ChevronDown, LogOut, Loader2, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { blackblazebucket } from '@/lib/constants/links';
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup,
  SidebarGroupLabel, SidebarHeader, SidebarMenu,
  SidebarMenuButton, SidebarMenuItem, SidebarSeparator,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/lib/context/auth.context';
import { useAppToast } from '@/components/ui/app-toast';
import { useDomains } from '@/lib/hooks/useDomains';
import { useMailboxes } from '@/lib/hooks/useMailboxes';
import { useState } from 'react';

const ACCOUNT_LINKS = [
  { label: 'Profile', href: '/app/settings', exact: true },
  { label: 'Security', href: '/app/settings/security' },
  { label: 'Billing', href: '/app/settings/billing' },
  { label: 'Notifications', href: '/app/settings/notifications' },
];

const MAIL_LINKS = [
  { label: 'Overview', href: '/app', exact: true },
  { label: 'Mailboxes', href: '/app/settings/mailboxes' },
  { label: 'Domains', href: '/app/settings/domains' },
  { label: 'Forwarding', href: '/app/settings/forwarding' },
  { label: 'Aliases', href: '/app/settings/aliases' },
  { label: 'Shared Inboxes', href: '/app/settings/shared-inbox' },
  { label: 'Unsubscribes', href: '/app/settings/unsubscribes' },
  { label: 'Templates', href: '/app/templates' },
  { label: 'Branding', href: '/app/settings/branding' },
];

const MARKETING_LINKS = [
  { label: 'Contacts', href: '/app/contacts' },
  { label: 'Campaigns', href: '/app/campaigns' },
];

const DEVELOPER_LINKS = [
  { label: 'API Keys', href: '/app/settings/api-keys' },
  { label: 'Webhooks', href: '/app/settings/webhooks' },
  { label: 'API Console', href: '/app/api-console' },
  { label: 'Partner', href: 'https://partner.kerabie.email', external: true },
];

const MONO = "font-[family-name:var(--font-plex-mono)]";
const DISPLAY = "font-[family-name:var(--font-barlow-condensed)]";

function NavLink({
  href, mark, label, active, external,
}: { href: string; mark: string; label: string; active: boolean; external?: boolean }) {
  const { isMobile, setOpenMobile } = useSidebar();
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        isActive={active}
        className={cn(
          'rounded-none h-9 gap-2.5 hover:bg-console-sidebar-hover hover:text-white',
          active
            ? 'bg-console-accent text-white font-medium hover:bg-console-accent hover:text-white'
            : 'text-console-sidebar-muted',
        )}
      >
        <Link
          href={href}
          className="flex items-center gap-2.5"
          onClick={() => { if (isMobile) setOpenMobile(false); }}
          {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        >
          <span className={cn(MONO, 'text-[11px] w-[18px] shrink-0', active ? 'opacity-90' : 'opacity-55')}>{mark}</span>
          <span className="flex-1 text-left truncate text-[13.5px]">{label}</span>
          {external && <ExternalLink className="h-3 w-3 opacity-55 shrink-0" />}
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

function NavGroup({
  label, links, isActive, startAt,
}: {
  label: string;
  links: { label: string; href: string; exact?: boolean; external?: boolean }[];
  isActive: (href: string, exact?: boolean) => boolean;
  startAt: number;
}) {
  return (
    <SidebarGroup className="py-1">
      <SidebarGroupLabel className={cn(MONO, 'px-2 pb-2 text-[10px] tracking-[0.14em] text-console-sidebar-muted2')}>
        {label}
      </SidebarGroupLabel>
      <SidebarMenu className="gap-0.5">
        {links.map(({ label: l, href, exact, external }, i) => (
          <NavLink key={href} href={href} mark={String(startAt + i).padStart(2, '0')} label={l} active={isActive(href, exact)} external={external} />
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}

export function AppSidebar() {
  const pathname = usePathname();
  const { user, token, logout } = useAuth();
  const { success } = useAppToast();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const { isMobile, setOpenMobile } = useSidebar();
  const closeMobile = () => { if (isMobile) setOpenMobile(false); };

  const { data: domains = [] } = useDomains(token);
  const { data: mailboxes = [] } = useMailboxes(token);
  const attentionCount =
    domains.filter((d) => d.status !== 'verified').length +
    mailboxes.filter((m) => m.is_active === false).length;

  const handleLogout = async () => {
    setLoggingOut(true);
    await logout();
    success('Signed out');
    router.push('/auth/login');
  };

  const initials = user?.full_name
    ?.split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() ?? '?';

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <Sidebar>
      <SidebarHeader className="h-16 flex-row items-center gap-2.5 px-[18px] border-b border-console-sidebar-border">
        <Link href="/app" className="flex items-center" onClick={closeMobile}>
          <Image src={blackblazebucket + '/assets/images/logo-white.png'} alt="Kerabie" width={64} height={39} priority className="h-4 w-auto" />
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-3 pt-5 gap-[22px] console-scroll">
        <NavGroup label="Mail" links={MAIL_LINKS} isActive={isActive} startAt={1} />
        <NavGroup label="Marketing" links={MARKETING_LINKS} isActive={isActive} startAt={1 + MAIL_LINKS.length} />
        <NavGroup label="Account" links={ACCOUNT_LINKS} isActive={isActive} startAt={1 + MAIL_LINKS.length + MARKETING_LINKS.length} />
        <NavGroup label="Developer" links={DEVELOPER_LINKS} isActive={isActive} startAt={1 + MAIL_LINKS.length + MARKETING_LINKS.length + ACCOUNT_LINKS.length} />
      </SidebarContent>

      <SidebarFooter className="p-0 border-t border-console-sidebar-border">
        <div className="p-3.5 flex flex-col gap-3">
          {attentionCount > 0 && (
            <Link
              href="/app/settings/domains"
              onClick={closeMobile}
              className="flex items-center gap-2.5 border border-console-sidebar-warn-border px-2.5 py-2.5 text-console-sidebar-warn-text hover:border-[#6b4f30] hover:bg-console-sidebar-warn-bg transition-colors"
            >
              <span className="h-1.5 w-1.5 bg-console-sidebar-warn-dot shrink-0" />
              <span className={cn(MONO, 'text-[10.5px] tracking-[0.06em]')}>
                {attentionCount} ITEM{attentionCount === 1 ? '' : 'S'} NEED ATTENTION
              </span>
            </Link>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2.5 w-full hover:bg-console-sidebar-hover transition-colors text-left p-1">
                <div className={cn('w-[30px] h-[30px] border border-console-sidebar-muted2/40 flex items-center justify-center shrink-0', DISPLAY, 'text-[15px] text-console-sidebar-fg/90')}>
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium truncate">{user?.full_name ?? 'User'}</p>
                  <p className={cn(MONO, 'text-[10px] text-console-sidebar-muted2 truncate')}>{user?.email}</p>
                </div>
                <ChevronDown className="h-4 w-4 text-console-sidebar-muted2 shrink-0" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" side="top" className="w-52">
              <DropdownMenuItem asChild>
                <Link href="/app/settings" onClick={closeMobile}>Account settings</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/app/settings/billing" onClick={closeMobile}>Billing</Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleLogout}
                disabled={loggingOut}
                className="text-destructive focus:text-destructive"
              >
                {loggingOut
                  ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  : <LogOut className="mr-2 h-4 w-4" />}
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
