'use client';
import { useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { Search, Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { PlusCorners } from '@/components/app/console/PlusCorners';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/context/auth.context';
import { useAppToast } from '@/components/ui/app-toast';
import { useCampaignStats, usePauseCampaign, useResumeCampaign } from '@/lib/hooks/useCampaigns';
import type { Campaign, CampaignsSummary } from '@/lib/types/api.types';

const MONO = "font-[family-name:var(--font-plex-mono)]";
const DISPLAY = "font-[family-name:var(--font-barlow-condensed)]";

const STATUS_TONE: Record<Campaign['status'], { color: string; label: string }> = {
  draft: { color: 'var(--color-console-muted3)', label: 'Draft' },
  sending: { color: 'var(--color-console-accent)', label: 'Sending' },
  paused: { color: 'var(--color-console-amber)', label: 'Paused' },
  sent: { color: 'var(--color-console-accent)', label: 'Sent' },
};

function StatusPill({ status }: { status: Campaign['status'] }) {
  const tone = STATUS_TONE[status];
  return (
    <span
      className={cn(MONO, 'inline-flex items-center gap-1.5 text-[9.5px] tracking-[0.08em] uppercase px-1.5 py-0.5 border shrink-0')}
      style={{ borderColor: tone.color, color: tone.color }}
    >
      {status === 'sending' && <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: tone.color }} />}
      {tone.label}
    </span>
  );
}

// ── Send performance stat cards ──────────────────────────────────────────────

function SparkBars({ values, color }: { values: number[]; color: string }) {
  const max = Math.max(1, ...values);
  return (
    <div className="flex items-end gap-[2px] h-[26px] mt-3.5">
      {values.map((v, i) => (
        <div key={i} className="flex-1 min-w-[2px]" style={{ height: `${Math.max(6, (v / max) * 100)}%`, background: color }} />
      ))}
    </div>
  );
}

function DeltaPill({ value, suffix, good }: { value: number; suffix: string; good: boolean }) {
  const color = good ? 'var(--color-console-accent)' : 'var(--color-console-amber)';
  const sign = value > 0 ? '+' : '';
  return (
    <span className={cn(MONO, 'text-[11px] border px-1.5 py-0.5 shrink-0')} style={{ borderColor: color, color }}>
      {sign}{value.toFixed(1)}{suffix}
    </span>
  );
}

function SendStatCell({
  kicker, value, unit, delta, deltaSuffix, deltaGood, note, spark, sparkColor,
}: {
  kicker: string; value: React.ReactNode; unit?: string; delta: number; deltaSuffix: string; deltaGood: boolean;
  note: string; spark: number[]; sparkColor: string;
}) {
  return (
    <div className="relative p-4 sm:p-5">
      <PlusCorners variant="diagonal" />
      <div className={cn(MONO, 'text-[10px] tracking-[0.12em] text-console-muted2')}>{kicker}</div>
      <div className="flex items-baseline gap-2 mt-3.5">
        <div className={cn(DISPLAY, 'font-semibold text-[34px] sm:text-[40px] leading-[0.9]')}>{value}</div>
        {unit && <div className={cn(MONO, 'text-[11px] text-console-muted2')}>{unit}</div>}
      </div>
      <div className="flex items-center gap-2 mt-3 min-w-0">
        <DeltaPill value={delta} suffix={deltaSuffix} good={deltaGood} />
        <span className="text-console-muted2 text-[12.5px] truncate">{note}</span>
      </div>
      <SparkBars values={spark.length ? spark : [0]} color={sparkColor} />
    </div>
  );
}

function SendStatsGrid({ summary, isLoading }: { summary: CampaignsSummary | null | undefined; isLoading: boolean }) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-console-border">
        {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-[132px] rounded-none" />)}
      </div>
    );
  }
  const s = summary ?? {
    days: 30, total_sent: 0, prev_total_sent: 0, mean_open_rate: 0, prev_mean_open_rate: 0,
    mean_click_rate: 0, prev_mean_click_rate: 0, unsubscribed: 0, unsubscribe_rate: 0,
    prev_unsubscribe_rate: 0, campaigns_sent_count: 0, daily: [],
  };
  const sendsDelta = s.prev_total_sent > 0 ? ((s.total_sent - s.prev_total_sent) / s.prev_total_sent) * 100 : (s.total_sent > 0 ? 100 : 0);
  const clicksInWindow = s.daily.reduce((a, d) => a + d.clicked, 0);
  const rateSpark = (numer: (d: CampaignsSummary['daily'][number]) => number) =>
    s.daily.map((d) => (d.sent > 0 ? (numer(d) / d.sent) * 100 : 0));

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 border border-console-border divide-x divide-y md:divide-y-0 divide-console-border bg-white">
      <SendStatCell
        kicker={`SENDS · ${s.days} DAYS`} value={s.total_sent.toLocaleString()} unit="emails"
        delta={sendsDelta} deltaSuffix="%" deltaGood={sendsDelta >= 0}
        note={`${s.campaigns_sent_count} campaign${s.campaigns_sent_count === 1 ? '' : 's'} sent`}
        spark={s.daily.map((d) => d.sent)} sparkColor="var(--color-console-accent)"
      />
      <SendStatCell
        kicker="MEAN OPEN RATE" value={s.mean_open_rate.toFixed(1)} unit="%"
        delta={s.mean_open_rate - s.prev_mean_open_rate} deltaSuffix="" deltaGood={s.mean_open_rate >= s.prev_mean_open_rate}
        note="benchmark 38%"
        spark={rateSpark((d) => d.opened)} sparkColor="var(--color-console-accent)"
      />
      <SendStatCell
        kicker="MEAN CLICK RATE" value={s.mean_click_rate.toFixed(1)} unit="%"
        delta={s.mean_click_rate - s.prev_mean_click_rate} deltaSuffix="" deltaGood={s.mean_click_rate >= s.prev_mean_click_rate}
        note={`${clicksInWindow.toLocaleString()} unique clicks`}
        spark={rateSpark((d) => d.clicked)} sparkColor="var(--color-console-amber)"
      />
      <SendStatCell
        kicker="UNSUBSCRIBES" value={s.unsubscribe_rate.toFixed(2)} unit="%"
        delta={s.unsubscribe_rate - s.prev_unsubscribe_rate} deltaSuffix="" deltaGood={s.unsubscribe_rate <= s.prev_unsubscribe_rate}
        note={`${s.unsubscribed.toLocaleString()} this month`}
        spark={rateSpark((d) => d.unsubscribed)} sparkColor="var(--color-console-amber)"
      />
    </div>
  );
}

// ── Live campaign banner (sending / paused) ──────────────────────────────────

function LiveCampaignBanner({ campaign, token }: { campaign: Campaign; token: string | null }) {
  const { data: stats } = useCampaignStats(campaign.id, token);
  const pauseCampaign = usePauseCampaign(campaign.id, token);
  const resumeCampaign = useResumeCampaign(campaign.id, token);
  const { error: toastError } = useAppToast();
  const isPaused = campaign.status === 'paused';
  const busy = pauseCampaign.isPending || resumeCampaign.isPending;

  const total = campaign.recipient_count || 1;
  const done = stats?.sent ?? 0;
  const pct = Math.min(100, Math.round((done / total) * 100));
  const tone = isPaused ? 'var(--color-console-amber)' : 'var(--color-console-accent)';

  const handleToggle = async () => {
    const res = isPaused ? await resumeCampaign.mutateAsync() : await pauseCampaign.mutateAsync();
    if (res.status !== true) {
      toastError(isPaused ? 'Failed to resume campaign' : 'Failed to pause campaign', { description: typeof res.response === 'string' ? res.response : undefined });
    }
  };

  return (
    <section
      className="border p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6"
      style={{ borderColor: tone, background: isPaused ? '#f7ede1' : 'var(--color-console-accent-tint)' }}
    >
      <div className="flex items-center gap-2.5 shrink-0">
        <span className="w-[7px] h-[7px]" style={{ background: tone }} />
        <span className={cn(MONO, 'text-[10px] tracking-[0.12em]')} style={{ color: tone }}>{isPaused ? 'PAUSED' : 'SENDING NOW'}</span>
      </div>
      <div className="flex-1 min-w-[200px]">
        <div className={cn(DISPLAY, 'font-semibold text-xl sm:text-2xl leading-tight truncate')}>{campaign.name}</div>
        <div className="text-[13px] text-console-muted mt-0.5">{campaign.recipient_count.toLocaleString()} recipients</div>
      </div>
      <div className="flex-1 min-w-[200px]">
        <div className="h-[6px] bg-[#e2e4de]"><div className="h-full transition-all" style={{ width: `${pct}%`, background: tone }} /></div>
        <div className={cn(MONO, 'flex justify-between text-[10px] text-console-muted mt-1.5 tracking-[0.06em]')}>
          <span>{done.toLocaleString()} DELIVERED</span><span>{pct}%</span>
        </div>
      </div>
      <div className="flex gap-2 shrink-0">
        <Link href={`/app/campaigns/${campaign.id}`}>
          <button type="button" className="border border-console-border bg-white h-9 px-4 text-[13px] text-console-ink hover:border-console-accent hover:text-console-accent transition-colors">
            Live report
          </button>
        </Link>
        <button
          type="button" onClick={handleToggle} disabled={busy}
          className="bg-console-ink text-white border-0 h-9 px-4 text-[13px] hover:bg-black transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          {isPaused ? 'Resume send' : 'Pause send'}
        </button>
      </div>
    </section>
  );
}

interface Props {
  campaigns: Campaign[] | undefined;
  isLoading: boolean;
  summary: CampaignsSummary | null | undefined;
  isLoadingSummary: boolean;
}

export default function CampaignsListView({ campaigns, isLoading, summary, isLoadingSummary }: Props) {
  const { token } = useAuth();
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState<'all' | Campaign['status']>('all');
  const [sort, setSort] = useState<'recent' | 'name' | 'recipients'>('recent');

  const list = campaigns ?? [];
  const live = list.find((c) => c.status === 'sending' || c.status === 'paused');

  const q = query.trim().toLowerCase();
  let rows = list.filter((c) => {
    const okQ = !q || c.name.toLowerCase().includes(q) || c.subject.toLowerCase().includes(q);
    const okTab = tab === 'all' || c.status === tab;
    return okQ && okTab;
  });
  if (sort === 'name') rows = [...rows].sort((a, b) => a.name.localeCompare(b.name));
  if (sort === 'recipients') rows = [...rows].sort((a, b) => b.recipient_count - a.recipient_count);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-72 rounded-none" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-console-border">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-[132px] rounded-none" />)}
        </div>
        <Skeleton className="h-64 w-full rounded-none" />
      </div>
    );
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="flex items-end gap-4 flex-wrap">
        <div>
          <h1 className={cn(DISPLAY, 'font-semibold text-3xl sm:text-4xl leading-none')}>Campaigns</h1>
          <div className="text-console-muted mt-1.5 max-w-[70ch]">
            Bulk sends built from your contacts. Every campaign is throttled to protect domain reputation.
          </div>
        </div>
        <div className="flex-1" />
        <div className="flex items-center gap-2 border border-console-border h-9 px-3 bg-white">
          <Search className="h-3.5 w-3.5 text-console-muted2" />
          <input
            value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder="Search campaigns" className="border-0 outline-none bg-transparent text-sm w-40 sm:w-56"
          />
        </div>
        <Link href="/app/campaigns/new">
          <button
            type="button"
            className={cn('relative bg-console-accent text-white border-0 h-9 px-5 hover:bg-console-accent-dark transition-colors', DISPLAY, 'font-semibold text-[15px] tracking-[0.04em]')}
          >
            + NEW CAMPAIGN
            <PlusCorners variant="all" />
          </button>
        </Link>
      </div>

      <SendStatsGrid summary={summary} isLoading={isLoadingSummary} />

      {live && <LiveCampaignBanner campaign={live} token={token} />}

      {list.length === 0 ? (
        <div className="border border-console-border bg-white p-12 text-center">
          <p className="text-sm text-console-muted mb-4">No campaigns yet.</p>
          <Link href="/app/campaigns/new">
            <button
              type="button"
              className={cn('relative bg-console-accent text-white border-0 h-9 px-5 hover:bg-console-accent-dark transition-colors', DISPLAY, 'font-semibold text-[15px] tracking-[0.04em]')}
            >
              + NEW CAMPAIGN
              <PlusCorners variant="all" />
            </button>
          </Link>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-3 flex-wrap border-t border-b border-console-border py-2.5">
            <div className="flex border border-console-border h-8">
              {(['all', 'draft', 'sending', 'paused', 'sent'] as const).map((t) => (
                <button
                  key={t} type="button" onClick={() => setTab(t)}
                  className={cn(MONO, 'px-3.5 text-[10.5px] tracking-[0.08em] uppercase', tab === t ? 'bg-console-ink text-white' : 'text-console-muted')}
                >
                  {t}
                </button>
              ))}
            </div>
            <div className="flex-1" />
            <div className={cn(MONO, 'text-[10.5px] tracking-[0.08em] text-console-muted2')}>{rows.length} OF {list.length} CAMPAIGNS</div>
            <div className="flex border border-console-border h-8">
              {([['recent', 'Recent'], ['name', 'Name'], ['recipients', 'Reach']] as const).map(([v, label]) => (
                <button
                  key={v} type="button" onClick={() => setSort(v)}
                  className={cn(MONO, 'px-3.5 text-[10.5px] tracking-[0.08em] uppercase', sort === v ? 'bg-console-ink text-white' : 'text-console-muted')}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="border border-console-border bg-white">
            <div className="hidden md:grid grid-cols-[2.2fr_1.3fr_0.8fr_0.6fr_1fr_0.9fr] px-5 py-2.5 border-b border-console-border">
              {['CAMPAIGN', 'AUDIENCE', 'RECIPIENTS', 'STEPS', 'CREATED', 'STATUS'].map((h) => (
                <div key={h} className={cn(MONO, 'text-[9.5px] tracking-[0.12em] text-console-muted2')}>{h}</div>
              ))}
            </div>
            {rows.length === 0 ? (
              <div className="p-10 text-center text-console-muted text-sm">No campaigns match your search.</div>
            ) : (
              rows.map((c, i) => (
                <Link
                  key={c.id}
                  href={`/app/campaigns/${c.id}`}
                  className={cn(
                    'flex flex-wrap md:grid md:grid-cols-[2.2fr_1.3fr_0.8fr_0.6fr_1fr_0.9fr] items-center gap-x-4 gap-y-1.5 px-5 py-3.5 hover:bg-console-hover transition-colors',
                    i < rows.length - 1 && 'border-b border-console-border-soft',
                  )}
                >
                  <div className="min-w-0 basis-full md:basis-auto">
                    <div className="font-medium text-[14.5px] truncate">{c.name}</div>
                    <div className={cn(MONO, 'text-[11px] text-console-muted3 truncate')}>{c.subject}</div>
                  </div>
                  <div className="text-[13px] text-console-muted truncate">
                    {c.group_name ?? 'All contacts'}
                    {c.segment_filter && c.segment_filter.length > 0 ? ` · ${c.segment_filter.length} filter${c.segment_filter.length === 1 ? '' : 's'}` : ''}
                  </div>
                  <div className={cn(MONO, 'text-[13px]')}>{c.recipient_count.toLocaleString()}</div>
                  <div className={cn(MONO, 'text-[13px] text-console-muted')}>{c.step_count}</div>
                  <div className={cn(MONO, 'text-[11.5px] text-console-muted2')}>{format(new Date(c.created_at), 'd MMM yyyy').toUpperCase()}</div>
                  <div><StatusPill status={c.status} /></div>
                </Link>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
