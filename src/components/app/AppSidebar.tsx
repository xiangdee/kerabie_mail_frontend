'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  ChevronDown, ChevronRight,
  Globe, Key, Webhook, Share2, LogOut, Mail, Loader2,
  CreditCard, User, Bell, ArrowRight, Shield, AtSign, Server,
  Palette, Megaphone, Users, UserX, FileText, Terminal,
  LayoutDashboard,
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
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/lib/context/auth.context';
import { useAppToast } from '@/components/ui/app-toast';
import { useState } from 'react';

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
  { label: 'Shared Inboxes', href: '/app/settings/shared-inbox', icon: Users },
  { label: 'Unsubscribes', href: '/app/settings/unsubscribes', icon: UserX },
  { label: 'Templates', href: '/app/settings/templates', icon: FileText },
  { label: 'Branding', href: '/app/settings/branding', icon: Palette },
];

const MARKETING_LINKS = [
  { label: 'Campaigns', href: '/app/campaigns', icon: Megaphone },
];

const DEVELOPER_LINKS = [
  { label: 'API Keys', href: '/app/settings/api-keys', icon: Key },
  { label: 'Webhooks', href: '/app/settings/webhooks', icon: Webhook },
  { label: 'API Console', href: '/app/api-console', icon: Terminal },
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
  // Open by default; a group containing the current page always starts open
  // regardless, so navigating never hides where you already are.
  const containsActive = links.some((l) => isActive(l.href, l.exact));
  const [open, setOpen] = useState(true);

  return (
    <Collapsible open={open || containsActive} onOpenChange={setOpen}>
      <SidebarGroup className="py-1">
        <CollapsibleTrigger className="flex w-full items-center justify-between px-2 group/trigger">
          <SidebarGroupLabel className="p-0">{label}</SidebarGroupLabel>
          <ChevronRight className="h-3 w-3 text-muted-foreground transition-transform group-data-[state=open]/trigger:rotate-90" />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenu className="mt-0.5">
            {links.map(({ label: l, href, icon: Icon, exact }) => {
              const active = isActive(href, exact);
              return (
                <SidebarMenuItem key={href}>
                  <SidebarMenuButton
                    asChild
                    isActive={active}
                    className={cn(
                      'border-l-2 border-transparent rounded-l-none pl-3',
                      active && 'border-primary bg-primary/5 font-medium text-primary hover:bg-primary/10 hover:text-primary',
                    )}
                  >
                    <Link href={href} className="flex items-center gap-2">
                      <Icon className="h-4 w-4 shrink-0" />
                      {l}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </CollapsibleContent>
      </SidebarGroup>
    </Collapsible>
  );
}

export function AppSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { success } = useAppToast();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

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
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <Mail className="h-5 w-5 text-primary" />
          <span className="font-bold text-base">Kerabie Mail</span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup className="py-1">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={isActive('/app', true)}
                className={cn(
                  'border-l-2 border-transparent rounded-l-none pl-3',
                  isActive('/app', true) && 'border-primary bg-primary/5 font-medium text-primary hover:bg-primary/10 hover:text-primary',
                )}
              >
                <Link href="/app" className="flex items-center gap-2">
                  <LayoutDashboard className="h-4 w-4 shrink-0" />
                  Dashboard
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
        <SidebarSeparator />
        <NavGroup label="Account" links={ACCOUNT_LINKS} isActive={isActive} />
        <SidebarSeparator />
        <NavGroup label="Mail" links={MAIL_LINKS} isActive={isActive} />
        <SidebarSeparator />
        <NavGroup label="Marketing" links={MARKETING_LINKS} isActive={isActive} />
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
