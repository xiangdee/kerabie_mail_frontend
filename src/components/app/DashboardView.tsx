'use client';
import Link from 'next/link';
import {
  Server, HardDrive, AtSign, ArrowRight, Globe, Plus,
  ShieldCheck, ShieldAlert, ShieldQuestion, Mail, CreditCard,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/context/auth.context';
import { useMailboxHealth } from '@/lib/hooks/useMailboxes';
import type { UsageSummary, Domain, UserEmailAccount } from '@/lib/types/api.types';

// ─── Small building blocks ─────────────────────────────────────────────────

function StatCard({
  icon: Icon, iconClassName, value, label,
}: { icon: React.ElementType; iconClassName: string; value: React.ReactNode; label: string }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center gap-3">
          <div className={cn('p-2 rounded-lg', iconClassName)}>
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-2xl font-bold truncate">{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function UsageBar({
  icon: Icon, label, used, limit, unlimited, percentage, suffix = '',
}: {
  icon: React.ElementType; label: string; used: number; limit: number;
  unlimited: boolean; percentage: number; suffix?: string;
}) {
  const pct = Math.min(percentage, 100);
  const barColor = pct >= 90 ? 'bg-destructive' : pct >= 70 ? 'bg-yellow-500' : 'bg-primary';
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="flex items-center gap-2 font-medium">
          <Icon className="h-4 w-4 text-muted-foreground" />
          {label}
        </span>
        <span className="text-muted-foreground text-xs">
          {unlimited ? `${used}${suffix} used · unlimited` : `${used}${suffix} / ${limit}${suffix}`}
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        {!unlimited && <div className={cn('h-full rounded-full transition-all', barColor)} style={{ width: `${pct}%` }} />}
      </div>
    </div>
  );
}

// ─── Mailbox health row ─────────────────────────────────────────────────────

function MailboxHealthRow({ email, isPrimary }: { email: string; isPrimary: boolean }) {
  const { token } = useAuth();
  const { data: health, isLoading } = useMailboxHealth(token, email);

  if (isLoading || !health) {
    return <Skeleton className="h-14 w-full rounded-xl" />;
  }

  const rate = health.reputation.bounce_rate_pct;
  const status = !health.is_active
    ? { label: 'Suspended', icon: ShieldAlert, tone: 'text-destructive bg-destructive/10' }
    : rate === null
      ? { label: 'Not enough data yet', icon: ShieldQuestion, tone: 'text-muted-foreground bg-muted' }
      : rate <= 2
        ? { label: `${rate}% bounce rate`, icon: ShieldCheck, tone: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30' }
        : { label: `${rate}% bounce rate`, icon: ShieldAlert, tone: 'text-amber-600 bg-amber-100 dark:bg-amber-900/30' };

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl border">
      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
        <Mail className="h-4 w-4 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="text-sm font-medium truncate">{email}</p>
          {isPrimary && <Badge variant="outline" className="text-[10px] px-1.5 py-0">Primary</Badge>}
        </div>
        <p className="text-xs text-muted-foreground">{health.storage.used_mb} MB used · {health.reputation.sent_24h} sent in 24h</p>
      </div>
      <span className={cn('flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full shrink-0', status.tone)}>
        <status.icon className="h-3.5 w-3.5" />
        {status.label}
      </span>
    </div>
  );
}

// ─── Main view ──────────────────────────────────────────────────────────────

export function DashboardView({
  usage, domains, mailboxes, isLoading,
}: {
  usage: UsageSummary | null;
  domains: Domain[];
  mailboxes: UserEmailAccount[];
  isLoading: boolean;
}) {
  const { user } = useAuth();
  const primaryMailbox = mailboxes.find((m) => m.is_primary) ?? mailboxes[0];
  const verifiedDomains = domains.filter((d) => d.status === 'verified').length;
  const pendingDomains = domains.length - verifiedDomains;
  const planStatus = (user as any)?.plan_status as string | undefined;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
        <Skeleton className="h-48 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Welcome back{user?.full_name ? `, ${user.full_name.split(' ')[0]}` : ''}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {primaryMailbox?.email_address ?? user?.email}
          </p>
        </div>
        <Badge variant="secondary" className="capitalize text-sm px-3 py-1">
          {planStatus ?? user?.plan_type ?? 'free'} plan
        </Badge>
      </div>

      {/* Usage stat cards */}
      {usage && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={Server} iconClassName="bg-primary/10 text-primary"
            value={`${usage.mailboxes.used}/${usage.mailboxes.limit}`}
            label="Mailboxes"
          />
          <StatCard
            icon={HardDrive} iconClassName="bg-blue-100 dark:bg-blue-900/30 text-blue-600"
            value={`${Math.round(usage.storage.percentage)}%`}
            label={`Storage (${usage.storage.used_mb.toFixed(0)}/${usage.storage.limit_mb} MB)`}
          />
          <StatCard
            icon={AtSign} iconClassName="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600"
            value={usage.aliases.unlimited ? '∞' : `${usage.aliases.used}/${usage.aliases.limit}`}
            label="Aliases"
          />
          <StatCard
            icon={ArrowRight} iconClassName="bg-purple-100 dark:bg-purple-900/30 text-purple-600"
            value={usage.forwarding_rules.unlimited ? '∞' : `${usage.forwarding_rules.used}/${usage.forwarding_rules.limit}`}
            label="Forwarding rules"
          />
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Usage detail */}
        {usage && (
          <Card>
            <CardContent className="pt-6 space-y-5">
              <h2 className="font-semibold text-sm">Plan usage</h2>
              <UsageBar icon={Server} label="Mailboxes" used={usage.mailboxes.used} limit={usage.mailboxes.limit} unlimited={false} percentage={usage.mailboxes.percentage} />
              <UsageBar icon={HardDrive} label="Storage" used={usage.storage.used_mb} limit={usage.storage.limit_mb} unlimited={false} percentage={usage.storage.percentage} suffix=" MB" />
              <UsageBar icon={AtSign} label="Aliases" used={usage.aliases.used} limit={usage.aliases.limit} unlimited={usage.aliases.unlimited} percentage={usage.aliases.percentage} />
              <UsageBar icon={ArrowRight} label="Forwarding rules" used={usage.forwarding_rules.used} limit={usage.forwarding_rules.limit} unlimited={usage.forwarding_rules.unlimited} percentage={usage.forwarding_rules.percentage} />
            </CardContent>
          </Card>
        )}

        {/* Domains */}
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-sm flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                Domains
              </h2>
              <Link href="/app/settings/domains">
                <Button size="sm" variant="outline" className="h-7 text-xs gap-1">
                  <Plus className="h-3.5 w-3.5" />Add domain
                </Button>
              </Link>
            </div>
            {domains.length === 0 ? (
              <p className="text-sm text-muted-foreground">No domains yet — add your own domain to send mail as you@yourdomain.com.</p>
            ) : (
              <div className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500" />{verifiedDomains} verified</span>
                {pendingDomains > 0 && <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-500" />{pendingDomains} pending</span>}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Mailbox health */}
      <div className="space-y-3">
        <h2 className="font-semibold text-sm">Mailbox health</h2>
        <div className="space-y-2">
          {mailboxes.length === 0 ? (
            <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">No mailboxes yet.</p></CardContent></Card>
          ) : (
            mailboxes.map((mb) => (
              <MailboxHealthRow key={mb.id} email={mb.email_address} isPrimary={!!mb.is_primary} />
            ))
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-2">
        <Link href="/app/settings/mailboxes"><Button variant="outline" size="sm" className="gap-1.5"><Plus className="h-4 w-4" />Add mailbox</Button></Link>
        <Link href="/app/settings/domains"><Button variant="outline" size="sm" className="gap-1.5"><Globe className="h-4 w-4" />Add domain</Button></Link>
        <Link href="/app/settings/billing"><Button variant="outline" size="sm" className="gap-1.5"><CreditCard className="h-4 w-4" />Manage billing</Button></Link>
      </div>
    </div>
  );
}
