'use client';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/context/auth.context';
import { useMailboxHealth } from '@/lib/hooks/useMailboxes';
import { usePhoneStatus } from '@/lib/hooks/usePhoneVerification';
import { PlusCorners } from '@/components/app/console/PlusCorners';
import type { UsageSummary, Domain, UserEmailAccount } from '@/lib/types/api.types';

const MONO = "font-[family-name:var(--font-plex-mono)]";
const DISPLAY = "font-[family-name:var(--font-barlow-condensed)]";

function barStyle(pct: number, color: string) {
  return { width: `${Math.min(Math.max(pct, 0), 100)}%`, background: color };
}

function statusTone(status: Domain['status']) {
  return status === 'verified'
    ? { color: 'var(--color-console-accent)', label: 'Verified' }
    : status === 'pending'
      ? { color: 'var(--color-console-amber)', label: 'Pending' }
      : { color: 'var(--color-console-red)', label: status === 'failed' ? 'Failed' : 'Expired' };
}

function sevTone(sev: 'HIGH' | 'MED') {
  return sev === 'HIGH' ? 'var(--color-console-red)' : 'var(--color-console-amber)';
}

// ─── Stat cell ───────────────────────────────────────────────────────────────

function StatCell({
  kicker, value, unit, note, pct, warn,
}: { kicker: string; value: React.ReactNode; unit?: string; note?: string; pct: number; warn?: boolean }) {
  return (
    <div className="relative p-4 sm:p-5">
      <PlusCorners variant="diagonal" />
      <div className={cn(MONO, 'text-[10px] tracking-[0.12em] text-console-muted2')}>{kicker}</div>
      <div className="flex items-baseline gap-2 mt-3.5">
        <div className={cn(DISPLAY, 'font-semibold text-[34px] sm:text-[40px] leading-[0.9]')}>{value}</div>
        {unit && <div className={cn(MONO, 'text-[11px] text-console-muted2')}>{unit}</div>}
      </div>
      {note && <div className="text-console-muted2 text-[12.5px] mt-2.5 truncate">{note}</div>}
      <div className="h-[3px] bg-[#e2e4de] mt-3.5">
        <div className="h-full transition-all" style={barStyle(pct, warn ? 'var(--color-console-amber)' : 'var(--color-console-accent)')} />
      </div>
    </div>
  );
}

// ─── Domains panel ───────────────────────────────────────────────────────────

function DomainsPanel({ domains }: { domains: Domain[] }) {
  return (
    <div className="relative border border-console-border bg-white">
      <PlusCorners variant="all" />
      <div className="px-5 py-4 border-b border-console-border flex items-center gap-3">
        <div className={cn(MONO, 'text-[10px] tracking-[0.12em] text-console-muted2')}>DOMAINS</div>
        <div className="flex-1" />
        <Link href="/app/settings/domains" className={cn(MONO, 'text-[11px] text-console-muted2 hover:text-console-accent transition-colors')}>
          + Add domain
        </Link>
      </div>
      {domains.length === 0 ? (
        <div className="px-5 py-8 text-console-muted text-sm">No domains yet — add your own domain to send mail as you@yourdomain.com.</div>
      ) : (
        domains.map((d, i) => {
          const tone = statusTone(d.status);
          return (
            <Link
              key={d.id}
              href="/app/settings/domains"
              className={cn(
                'flex items-center justify-between gap-4 px-5 py-3.5 hover:bg-console-hover transition-colors',
                i < domains.length - 1 && 'border-b border-console-border-soft',
              )}
            >
              <div className={cn(DISPLAY, 'font-semibold text-lg truncate')}>{d.domain}</div>
              <span
                className={cn(MONO, 'text-[9.5px] tracking-[0.08em] uppercase px-1.5 py-0.5 border shrink-0')}
                style={{ borderColor: tone.color, color: tone.color }}
              >
                {tone.label}
              </span>
            </Link>
          );
        })
      )}
    </div>
  );
}

// ─── Needs attention panel ───────────────────────────────────────────────────

interface Issue { sev: 'HIGH' | 'MED'; scope: string; title: string; body: string; action: string; href: string }

function AttentionPanel({ issues }: { issues: Issue[] }) {
  return (
    <div className="border border-console-border bg-white flex flex-col">
      <div className="px-5 py-4 border-b border-console-border flex items-center gap-2.5">
        {issues.length > 0 && <span className="w-[7px] h-[7px] bg-console-amber shrink-0" />}
        <div className={cn(DISPLAY, 'font-semibold text-xl')}>Needs attention</div>
        <div className="flex-1" />
        <div className={cn(MONO, 'text-[10px] text-console-muted2')}>{issues.length} OPEN</div>
      </div>
      {issues.length === 0 ? (
        <div className="px-5 py-8 text-console-muted text-sm">All clear — nothing needs your attention right now.</div>
      ) : (
        issues.map((iss, i) => (
          <Link
            key={i}
            href={iss.href}
            className={cn('px-5 py-4 hover:bg-console-hover transition-colors', i < issues.length - 1 && 'border-b border-console-border-soft')}
          >
            <div className="flex items-center gap-2">
              <span
                className={cn(MONO, 'text-[9.5px] tracking-[0.1em] px-1.5 py-0.5 text-white')}
                style={{ background: sevTone(iss.sev) }}
              >
                {iss.sev}
              </span>
              <span className={cn(MONO, 'text-[10px] text-console-muted3 truncate')}>{iss.scope}</span>
            </div>
            <div className="font-medium text-[14.5px] mt-1.5">{iss.title}</div>
            <div className="text-console-muted text-[13px] mt-0.5">{iss.body}</div>
            <div className="text-console-accent text-[13px] mt-2 font-medium">{iss.action} →</div>
          </Link>
        ))
      )}
    </div>
  );
}

// ─── Mailboxes panel ─────────────────────────────────────────────────────────

function MailboxRow({ mailbox, last }: { mailbox: UserEmailAccount; last: boolean }) {
  const { token } = useAuth();
  const { data: health, isLoading } = useMailboxHealth(token, mailbox.email_address);
  const initials = mailbox.email_address.slice(0, 2).toUpperCase();

  if (isLoading || !health) {
    return <Skeleton className="h-16 w-full rounded-none" />;
  }

  const rate = health.reputation.bounce_rate_pct;
  const inboxPct = rate === null ? null : Math.max(0, 100 - rate);

  return (
    <Link
      href="/app/settings/mailboxes"
      className={cn(
        'flex flex-wrap sm:flex-nowrap items-center gap-x-4 gap-y-2 px-5 py-3.5 hover:bg-console-hover transition-colors',
        !last && 'border-b border-console-border-soft',
      )}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1 basis-full sm:basis-auto">
        <div className={cn(DISPLAY, 'w-[30px] h-[30px] border border-console-border flex items-center justify-center text-sm text-console-muted shrink-0')}>
          {initials}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <div className="font-medium text-[13.5px] truncate">{mailbox.display_name || mailbox.email_address.split('@')[0]}</div>
            {mailbox.is_primary && <span className={cn(MONO, 'text-[9px] tracking-[0.08em] text-console-muted3 border border-console-border px-1')}>PRIMARY</span>}
          </div>
          <div className={cn(MONO, 'text-[11.5px] text-console-muted2 truncate')}>{mailbox.email_address}</div>
        </div>
      </div>
      <div className={cn(MONO, 'text-[12.5px] text-console-ink shrink-0 order-1 sm:order-none')}>{health.reputation.sent_24h} sent/24h</div>
      <div className={cn(MONO, 'text-[12.5px] shrink-0 order-1 sm:order-none')} style={{ color: inboxPct === null ? 'var(--color-console-muted3)' : 'var(--color-console-accent)' }}>
        {inboxPct === null ? 'no data' : `${inboxPct.toFixed(1)}% inbox`}
      </div>
      <div className="flex items-center gap-2 shrink-0 basis-full sm:basis-[110px]">
        <div className="flex-1 sm:flex-none sm:w-[70px] h-[3px] bg-[#e2e4de]">
          <div className="h-full" style={barStyle(health.storage.percentage, health.storage.percentage > 80 ? 'var(--color-console-amber)' : 'var(--color-console-accent)')} />
        </div>
        <span className={cn(MONO, 'text-[10.5px] text-console-muted2')}>{Math.round(health.storage.percentage)}%</span>
      </div>
    </Link>
  );
}

function MailboxesPanel({ mailboxes }: { mailboxes: UserEmailAccount[] }) {
  return (
    <div className="border border-console-border bg-white flex flex-col">
      <div className="px-5 py-4 border-b border-console-border flex items-center gap-3">
        <div className={cn(DISPLAY, 'font-semibold text-xl')}>Mailboxes</div>
        <div className="flex-1" />
        <Link href="/app/settings/mailboxes" className={cn(MONO, 'text-[11px] text-console-muted2 hover:text-console-accent transition-colors')}>
          All {mailboxes.length} →
        </Link>
      </div>
      {mailboxes.length === 0 ? (
        <div className="px-5 py-8 text-console-muted text-sm">No mailboxes yet.</div>
      ) : (
        mailboxes.map((mb, i) => <MailboxRow key={mb.id} mailbox={mb} last={i === mailboxes.length - 1} />)
      )}
    </div>
  );
}

// ─── Set up next panel ───────────────────────────────────────────────────────

interface ChecklistItem { id: string; label: string; done: boolean; href: string }

function ChecklistPanel({ items }: { items: ChecklistItem[] }) {
  const doneCount = items.filter((c) => c.done).length;
  return (
    <div className="border border-console-border bg-white flex flex-col">
      <div className="px-5 py-4 border-b border-console-border flex items-baseline gap-2.5">
        <div className={cn(DISPLAY, 'font-semibold text-xl')}>Set up next</div>
        <div className="flex-1" />
        <div className={cn(MONO, 'text-[11px] text-console-muted2')}>{doneCount}/{items.length}</div>
      </div>
      {items.map((c, i) => (
        <Link
          key={c.id}
          href={c.href}
          className={cn('flex items-center gap-3 px-5 py-3.5 hover:bg-console-hover transition-colors', i < items.length - 1 && 'border-b border-console-border-soft')}
        >
          <span className={cn(
            'w-[17px] h-[17px] shrink-0 flex items-center justify-center text-[11px]',
            c.done ? 'bg-console-accent text-white' : 'border border-console-tick text-transparent',
          )}
          >
            {c.done ? '✓' : ''}
          </span>
          <span className={cn('text-[13.5px]', c.done ? 'text-console-muted3 line-through' : 'text-console-ink')}>{c.label}</span>
          <span className="flex-1" />
          {c.done && <span className={cn(MONO, 'text-[10px] text-console-muted3')}>DONE</span>}
        </Link>
      ))}
    </div>
  );
}

// ─── Quick actions ───────────────────────────────────────────────────────────

function ActionTile({ href, mark, label }: { href: string; mark: string; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 border border-console-border bg-white px-4 py-3.5 hover:border-console-accent hover:bg-console-accent-tint transition-colors"
    >
      <span className={cn(MONO, 'text-[11px] text-console-muted2 shrink-0')}>{mark}</span>
      <span className="text-[13.5px] font-medium flex-1 truncate">{label}</span>
      <span className="text-console-accent text-[13px] shrink-0">→</span>
    </Link>
  );
}

// ─── Main view ────────────────────────────────────────────────────────────────

const GUIDE_COPY: Record<string, string> = {
  mailbox: 'Create your first mailbox to start sending and receiving mail on Kerabie.',
  domain: 'Verify a domain so you can send as you@yourdomain.com instead of a shared address.',
  phone: 'Verified accounts unlock full sending limits — this takes under a minute.',
  recovery: 'A verified recovery email is the fastest way back in if you ever get locked out.',
};

export function DashboardView({
  usage, domains, mailboxes, isLoading,
}: {
  usage: UsageSummary | null;
  domains: Domain[];
  mailboxes: UserEmailAccount[];
  isLoading: boolean;
}) {
  const { user, token } = useAuth();
  const { data: phoneStatus } = usePhoneStatus(token);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-72 rounded-none" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-console-border">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-28 rounded-none" />)}
        </div>
        <Skeleton className="h-48 rounded-none" />
      </div>
    );
  }

  const verifiedDomain = domains.find((d) => d.status === 'verified')?.domain;
  const fallbackDomain = mailboxes[0]?.email_address.split('@')[1];
  const scopeDomain = verifiedDomain ?? fallbackDomain ?? 'your account';
  const selfMailbox = mailboxes.find((m) => m.email_address === user?.email);
  const isTrial = user && (user as any).plan_status === 'trial';

  const checklist: ChecklistItem[] = [
    { id: 'mailbox', label: 'Add your first mailbox', done: mailboxes.length > 0, href: '/app/settings/mailboxes' },
    { id: 'domain', label: 'Verify a domain', done: domains.some((d) => d.status === 'verified'), href: '/app/settings/domains' },
    ...(isTrial ? [{ id: 'phone', label: 'Verify your phone number', done: !!phoneStatus?.is_verified, href: '/app/settings/security' }] : []),
    { id: 'recovery', label: 'Add a recovery email', done: !!selfMailbox?.alternate_email_verified, href: '/app/settings/security' },
  ];
  const doneCount = checklist.filter((c) => c.done).length;
  const nextItem = checklist.find((c) => !c.done);

  const issues: Issue[] = [
    ...domains.filter((d) => d.status !== 'verified').map((d) => ({
      sev: (d.status === 'pending' ? 'MED' : 'HIGH') as 'HIGH' | 'MED',
      scope: d.domain.toUpperCase(),
      title: d.status === 'pending' ? 'Domain verification pending' : d.status === 'failed' ? 'Domain verification failed' : 'Domain verification expired',
      body: d.status === 'pending'
        ? 'DNS records were added but verification hasn\'t completed yet.'
        : 'Recheck your DNS records to restore sending on this domain.',
      action: 'Review DNS',
      href: '/app/settings/domains',
    })),
    ...mailboxes.filter((m) => m.is_active === false).map((m) => ({
      sev: 'HIGH' as const,
      scope: m.email_address.toUpperCase(),
      title: 'Mailbox suspended',
      body: m.suspended_reason || 'This mailbox was suspended and needs your attention.',
      action: 'View mailbox',
      href: '/app/settings/mailboxes',
    })),
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Page head */}
      <div className="flex items-end gap-4 flex-wrap sm:flex-nowrap">
        <div>
          <h1 className={cn(DISPLAY, 'font-semibold text-[32px] sm:text-[40px] leading-none tracking-[0.01em]')}>Mail operations</h1>
          <div className="text-console-muted mt-1.5">
            Everything sending from <span className={cn(MONO, 'text-console-ink text-[12.5px]')}>{scopeDomain}</span>
            {' · '}{mailboxes.length} mailbox{mailboxes.length === 1 ? '' : 'es'} · {domains.length} domain{domains.length === 1 ? '' : 's'}
          </div>
        </div>
        <div className="flex-1" />
        <Link href="/app/settings/mailboxes">
          <button
            type="button"
            className={cn('relative bg-console-accent text-white border-0 h-9 px-5 hover:bg-console-accent-dark transition-colors', DISPLAY, 'font-semibold text-[15px] tracking-[0.04em]')}
          >
            + NEW MAILBOX
            <PlusCorners variant="all" />
          </button>
        </Link>
      </div>

      {/* Setup guide */}
      {nextItem && (
        <section className="border border-console-accent bg-console-accent-tint p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
          <div className="flex-1">
            <div className={cn(MONO, 'text-[10px] tracking-[0.12em]')} style={{ color: 'var(--color-console-accent)' }}>
              SETUP · STEP {doneCount + 1} OF {checklist.length}
            </div>
            <div className={cn(DISPLAY, 'font-semibold text-xl sm:text-2xl mt-1')}>{nextItem.label}</div>
            <div className="text-console-muted mt-1 max-w-[62ch]">{GUIDE_COPY[nextItem.id]}</div>
          </div>
          <Link href={nextItem.href} className="shrink-0">
            <button
              type="button"
              className={cn('relative bg-console-accent text-white border-0 h-11 px-6 hover:bg-console-accent-dark transition-colors', DISPLAY, 'font-semibold text-[15px] tracking-[0.03em]')}
            >
              REVIEW
              <PlusCorners variant="all" />
            </button>
          </Link>
        </section>
      )}

      {/* Stats grid */}
      {usage && (
        <div className="grid grid-cols-2 md:grid-cols-4 border border-console-border divide-x divide-y md:divide-y-0 divide-console-border bg-white">
          <StatCell
            kicker="MAILBOXES" value={usage.mailboxes.used} unit={`/ ${usage.mailboxes.limit}`}
            note={usage.mailboxes.limit - usage.mailboxes.used > 0 ? `${usage.mailboxes.limit - usage.mailboxes.used} remaining` : 'at limit'}
            pct={usage.mailboxes.percentage} warn={usage.mailboxes.percentage >= 90}
          />
          <StatCell
            kicker="STORAGE" value={Math.round(usage.storage.percentage)} unit="% USED"
            note={`${usage.storage.used_mb.toFixed(0)} / ${usage.storage.limit_mb} MB`}
            pct={usage.storage.percentage} warn={usage.storage.percentage >= 90}
          />
          <StatCell
            kicker="ALIASES" value={usage.aliases.unlimited ? '∞' : usage.aliases.used} unit={usage.aliases.unlimited ? 'UNLIMITED' : `/ ${usage.aliases.limit}`}
            note={usage.aliases.unlimited ? undefined : (usage.aliases.limit - usage.aliases.used > 0 ? `${usage.aliases.limit - usage.aliases.used} remaining` : 'at limit')}
            pct={usage.aliases.unlimited ? 100 : usage.aliases.percentage} warn={!usage.aliases.unlimited && usage.aliases.percentage >= 90}
          />
          <StatCell
            kicker="FORWARDING" value={usage.forwarding_rules.unlimited ? '∞' : usage.forwarding_rules.used} unit={usage.forwarding_rules.unlimited ? 'UNLIMITED' : `/ ${usage.forwarding_rules.limit}`}
            note={usage.forwarding_rules.unlimited ? undefined : (usage.forwarding_rules.limit - usage.forwarding_rules.used > 0 ? `${usage.forwarding_rules.limit - usage.forwarding_rules.used} remaining` : 'at limit')}
            pct={usage.forwarding_rules.unlimited ? 100 : usage.forwarding_rules.percentage} warn={!usage.forwarding_rules.unlimited && usage.forwarding_rules.percentage >= 90}
          />
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-5">
        <DomainsPanel domains={domains} />
        <AttentionPanel issues={issues} />
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <MailboxesPanel mailboxes={mailboxes} />
        <ChecklistPanel items={checklist} />
      </div>

      <div className="space-y-3">
        <div className={cn(MONO, 'text-[10px] tracking-[0.12em] text-console-muted2')}>QUICK ACTIONS</div>
        <div className="grid sm:grid-cols-3 gap-3">
          <ActionTile href="/app/settings/mailboxes" mark="+" label="Add mailbox" />
          <ActionTile href="/app/settings/domains" mark="+" label="Add domain" />
          <ActionTile href="/app/settings/billing" mark="$" label="Manage billing" />
        </div>
      </div>
    </div>
  );
}
