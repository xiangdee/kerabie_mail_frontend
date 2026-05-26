'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { MailboxIcon, AtSign, ArrowRight, HardDrive } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { UsageSummary } from '@/lib/types/api.types';

function formatBytes(mb: number): string {
  if (mb >= 1024) return `${(mb / 1024).toFixed(1)} GB`;
  return `${Math.round(mb)} MB`;
}

function UsageBar({
  label,
  icon: Icon,
  used,
  limit,
  unlimited,
  percentage,
  formatUsed,
  formatLimit,
}: {
  label: string;
  icon: React.ElementType;
  used: number;
  limit: number;
  unlimited: boolean;
  percentage: number;
  formatUsed?: (v: number) => string;
  formatLimit?: (v: number) => string;
}) {
  const pct = Math.min(percentage, 100);
  const critical = pct >= 90;
  const warning = pct >= 70 && pct < 90;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2 font-medium">
          <Icon className="h-4 w-4 text-muted-foreground" />
          {label}
        </div>
        <span className="text-muted-foreground">
          {formatUsed ? formatUsed(used) : used}
          {' / '}
          {unlimited ? 'Unlimited' : (formatLimit ? formatLimit(limit) : limit)}
        </span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        {!unlimited && (
          <div
            className={cn(
              'h-full rounded-full transition-all',
              critical ? 'bg-destructive' : warning ? 'bg-yellow-500' : 'bg-primary',
            )}
            style={{ width: `${pct}%` }}
          />
        )}
        {unlimited && <div className="h-full rounded-full bg-emerald-500 w-full opacity-30" />}
      </div>
      {!unlimited && <p className="text-xs text-muted-foreground">{pct.toFixed(0)}% used</p>}
    </div>
  );
}

interface Props {
  usage: UsageSummary | null | undefined;
  isLoading: boolean;
}

export default function UsageSummaryView({ usage, isLoading }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Usage</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {isLoading || !usage ? (
          <>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <Skeleton className="h-2 w-full rounded-full" />
              </div>
            ))}
          </>
        ) : (
          <>
            <UsageBar
              label="Mailboxes"
              icon={MailboxIcon}
              used={usage.mailboxes.used}
              limit={usage.mailboxes.limit}
              unlimited={false}
              percentage={usage.mailboxes.percentage}
            />
            <UsageBar
              label="Aliases"
              icon={AtSign}
              used={usage.aliases.used}
              limit={usage.aliases.limit}
              unlimited={usage.aliases.unlimited}
              percentage={usage.aliases.percentage}
            />
            <UsageBar
              label="Forwarding rules"
              icon={ArrowRight}
              used={usage.forwarding_rules.used}
              limit={usage.forwarding_rules.limit}
              unlimited={usage.forwarding_rules.unlimited}
              percentage={usage.forwarding_rules.percentage}
            />
            <UsageBar
              label="Storage"
              icon={HardDrive}
              used={usage.storage.used_mb}
              limit={usage.storage.limit_mb}
              unlimited={false}
              percentage={usage.storage.percentage}
              formatUsed={formatBytes}
              formatLimit={formatBytes}
            />
          </>
        )}
      </CardContent>
    </Card>
  );
}
