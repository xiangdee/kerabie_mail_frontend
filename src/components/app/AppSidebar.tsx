'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  ExternalLink, Settings, ChevronDown,
  Globe, Key, Webhook, Share2, LogOut, Mail, Loader2,
  CreditCard, User, Bell, ArrowRight, Shield, AtSign, Server,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup,
  SidebarGroupLabel, SidebarHeader, SidebarMenu,
  SidebarMenuButton, SidebarMenuItem, SidebarSeparator,
} from '@/components/ui/sidebar';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/lib/context/auth.context';
import { useAppToast } from '@/components/ui/app-toast';
import { authService } from '@/lib/services/auth.service';
import { useState } from 'react';

const WEBMAIL_URL = process.env.NEXT_PUBLIC_WEBMAIL_URL ?? 'https://webmail.kerabie.email';

const ACCOUNT_LINKS = [
  { label: 'Profile', href: '/app/settings', icon: User, exact: true },
  { label: 'Security', href: '/app/settings/security', icon: Shield },
  { label: 'Billing', href: '/app/settings/billing', icon: CreditCard },
  { label: 'Notifications', href: '/app/settings/notifications', icon: Bell },
];

const MAIL_LINKS = [
  { label: 'Mailboxes', href: '/app/settings/mailboxes', icon: Server },
  { label: 'Domains', href: '/app/settings/domains', icon: Globe },
  { label: 'Forwarding', href: '/app/settings/forwarding', icon: ArrowRight },
  { label: 'Aliases', href: '/app/settings/aliases', icon: AtSign },
];

const DEVELOPER_LINKS = [
  { label: 'API Keys', href: '/app/settings/api-keys', icon: Key },
  { label: 'Webhooks', href: '/app/settings/webhooks', icon: Webhook },
  { label: 'Partner', href: '/app/partner', icon: Share2 },
];

function NavGroup({
  label,
  links,
  isActive,
}: {
  label: string;
  links: { label: string; href: string; icon: React.ElementType; exact?: boolean }[];
  isActive: (href: string, exact?: boolean) => boolean;
}) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>{label}</SidebarGroupLabel>
      <SidebarMenu>
        {links.map(({ label: l, href, icon: Icon, exact }) => (
          <SidebarMenuItem key={href}>
            <SidebarMenuButton asChild isActive={isActive(href, exact)}>
              <Link href={href} className="flex items-center gap-2">
                <Icon className="h-4 w-4" />
                {l}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}

export function AppSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { success } = useAppToast();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const [openingWebmail, setOpeningWebmail] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    await logout();
    success('Signed out');
    router.push('/auth/login');
  };

  const handleOpenWebmail = async () => {
    if (!user) {
      window.open(WEBMAIL_URL, '_blank', 'noopener,noreferrer');
      return;
    }
    setOpeningWebmail(true);
    try {
      const res = await authService.getWebmailToken();
      if (res.status === true && res.response?.token) {
        const url = `${WEBMAIL_URL}?sso=${encodeURIComponent(res.response.token)}`;
        window.open(url, '_blank', 'noopener,noreferrer');
      } else {
        window.open(WEBMAIL_URL, '_blank', 'noopener,noreferrer');
      }
    } catch {
      window.open(WEBMAIL_URL, '_blank', 'noopener,noreferrer');
    } finally {
      setOpeningWebmail(false);
    }
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
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Mail className="h-5 w-5 text-primary" />
          <span className="font-bold text-base">Kerabie Mail</span>
        </div>
        <button
          onClick={handleOpenWebmail}
          disabled={openingWebmail}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-70"
        >
          {openingWebmail
            ? <Loader2 className="h-4 w-4 animate-spin" />
            : <ExternalLink className="h-4 w-4" />}
          Open Webmail
        </button>
      </SidebarHeader>

      <SidebarContent>
        <NavGroup label="Account" links={ACCOUNT_LINKS} isActive={isActive} />
        <SidebarSeparator />
        <NavGroup label="Mail" links={MAIL_LINKS} isActive={isActive} />
        <SidebarSeparator />
        <NavGroup label="Developer" links={DEVELOPER_LINKS} isActive={isActive} />
      </SidebarContent>

      <SidebarFooter className="p-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-3 w-full rounded-lg p-2 hover:bg-muted transition-colors text-left">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs bg-primary/10 text-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.full_name ?? 'User'}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" side="top" className="w-52">
            <DropdownMenuItem asChild>
              <Link href="/app/settings">Account settings</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/app/settings/billing">Billing</Link>
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
      </SidebarFooter>
    </Sidebar>
  );
}
