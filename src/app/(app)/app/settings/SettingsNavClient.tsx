'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  User, Globe, ArrowRight, Key, Webhook,
  CreditCard, Shield, Bell, Server, AtSign, Share2, Terminal, Users, UserX,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const GROUPS = [
  {
    label: 'Account',
    links: [
      { label: 'Profile', href: '/app/settings', icon: User, exact: true },
      { label: 'Security', href: '/app/settings/security', icon: Shield },
      { label: 'Billing', href: '/app/settings/billing', icon: CreditCard },
      { label: 'Notifications', href: '/app/settings/notifications', icon: Bell },
    ],
  },
  {
    label: 'Mail',
    links: [
      { label: 'Mailboxes', href: '/app/settings/mailboxes', icon: Server },
      { label: 'Domains', href: '/app/settings/domains', icon: Globe },
      { label: 'Forwarding', href: '/app/settings/forwarding', icon: ArrowRight },
      { label: 'Aliases', href: '/app/settings/aliases', icon: AtSign },
      { label: 'Shared Inboxes', href: '/app/settings/shared-inbox', icon: Users },
      { label: 'Unsubscribes', href: '/app/settings/unsubscribes', icon: UserX },
    ],
  },
  {
    label: 'Developer',
    links: [
      { label: 'API Keys', href: '/app/settings/api-keys', icon: Key },
      { label: 'Webhooks', href: '/app/settings/webhooks', icon: Webhook },
      { label: 'API Console', href: '/app/api-console', icon: Terminal },
      { label: 'Partner', href: '/app/partner', icon: Share2 },
    ],
  },
];

export default function SettingsNavClient() {
  const pathname = usePathname();

  return (
    <nav className="space-y-5">
      {GROUPS.map((group) => (
        <div key={group.label}>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground px-3 mb-1">
            {group.label}
          </p>
          <div className="space-y-0.5">
            {group.links.map(({ label, href, icon: Icon, exact }) => {
              const active = exact ? pathname === href : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors',
                    active
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {label}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}
