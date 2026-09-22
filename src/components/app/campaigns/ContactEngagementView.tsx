'use client';
import { useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { ArrowLeft, Search } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { ContactEngagement } from '@/lib/types/api.types';

const MONO = "font-[family-name:var(--font-plex-mono)]";
const DISPLAY = "font-[family-name:var(--font-barlow-condensed)]";

const TIER_TONE: Record<ContactEngagement['tier'], { color: string; label: string }> = {
  at_risk: { color: 'var(--color-console-amber)', label: 'At risk' },
  engaged: { color: 'var(--color-console-accent)', label: 'Engaged' },
  new: { color: 'var(--color-console-muted3)', label: 'New' },
};

function TierPill({ tier }: { tier: ContactEngagement['tier'] }) {
  const tone = TIER_TONE[tier];
  return (
    <span
      className={cn(MONO, 'inline-flex items-center text-[9.5px] tracking-[0.08em] uppercase px-1.5 py-0.5 border shrink-0')}
      style={{ borderColor: tone.color, color: tone.color }}
    >
      {tone.label}
    </span>
  );
}

interface Props {
  contacts: ContactEngagement[] | undefined;
  isLoading: boolean;
}

export default function ContactEngagementView({ contacts, isLoading }: Props) {
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState<'all' | ContactEngagement['tier']>('all');

  const list = contacts ?? [];
  const atRiskCount = list.filter((c) => c.tier === 'at_risk').length;

  const q = query.trim().toLowerCase();
  const rows = list.filter((c) => {
    const okQ = !q || c.email.toLowerCase().includes(q) || (c.name ?? '').toLowerCase().includes(q);
    const okTab = tab === 'all' || c.tier === tab;
    return okQ && okTab;
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-72 rounded-none" />
        <Skeleton className="h-64 w-full rounded-none" />
      </div>
    );
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      <div>
        <Link href="/app/campaigns" className="inline-flex items-center gap-1.5 text-[13px] text-console-muted hover:text-console-accent transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" /> Campaigns
        </Link>
      </div>

      <div className="flex items-end gap-4 flex-wrap">
        <div>
          <h1 className={cn(DISPLAY, 'font-semibold text-3xl sm:text-4xl leading-none')}>List health</h1>
          <div className="text-console-muted mt-1.5 max-w-[70ch]">
            Per-contact engagement across every campaign send they&apos;ve received.
            {atRiskCount > 0 && ` ${atRiskCount} contact${atRiskCount === 1 ? '' : 's'} sent 3+ times with no opens — worth reviewing.`}
          </div>
        </div>
        <div className="flex-1" />
        <div className="flex items-center gap-2 border border-console-border h-9 px-3 bg-white">
          <Search className="h-3.5 w-3.5 text-console-muted2" />
          <input
            value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder="Search contacts" className="border-0 outline-none bg-transparent text-sm w-40 sm:w-56"
          />
        </div>
      </div>

      {list.length === 0 ? (
        <div className="border border-console-border bg-white p-12 text-center">
          <p className="text-sm text-console-muted">No campaign sends yet — engagement data appears once you&apos;ve sent at least one campaign.</p>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-3 flex-wrap border-t border-b border-console-border py-2.5">
            <div className="flex border border-console-border h-8">
              {(['all', 'at_risk', 'engaged', 'new'] as const).map((t) => (
                <button
                  key={t} type="button" onClick={() => setTab(t)}
                  className={cn(MONO, 'px-3.5 text-[10.5px] tracking-[0.08em] uppercase', tab === t ? 'bg-console-ink text-white' : 'text-console-muted')}
                >
                  {t === 'all' ? 'all' : TIER_TONE[t].label}
                </button>
              ))}
            </div>
            <div className="flex-1" />
            <div className={cn(MONO, 'text-[10.5px] tracking-[0.08em] text-console-muted2')}>{rows.length} OF {list.length} CONTACTS</div>
          </div>

          <div className="border border-console-border bg-white">
            <div className="hidden md:grid grid-cols-[2fr_0.7fr_0.7fr_0.7fr_0.8fr_1fr_0.8fr] px-5 py-2.5 border-b border-console-border">
              {['CONTACT', 'SENT', 'OPENED', 'CLICKED', 'OPEN RATE', 'LAST ENGAGED', 'STATUS'].map((h) => (
                <div key={h} className={cn(MONO, 'text-[9.5px] tracking-[0.12em] text-console-muted2')}>{h}</div>
              ))}
            </div>
            {rows.length === 0 ? (
              <div className="p-10 text-center text-console-muted text-sm">No contacts match your search.</div>
            ) : (
              rows.map((c, i) => (
                <div
                  key={c.contact_id}
                  className={cn(
                    'flex flex-wrap md:grid md:grid-cols-[2fr_0.7fr_0.7fr_0.7fr_0.8fr_1fr_0.8fr] items-center gap-x-4 gap-y-1.5 px-5 py-3.5',
                    i < rows.length - 1 && 'border-b border-console-border-soft',
                  )}
                >
                  <div className="min-w-0 basis-full md:basis-auto">
                    <div className="font-medium text-[14.5px] truncate">{c.name || c.email}</div>
                    {c.name && <div className={cn(MONO, 'text-[11px] text-console-muted3 truncate')}>{c.email}</div>}
                  </div>
                  <div className={cn(MONO, 'text-[13px]')}>{c.sent.toLocaleString()}</div>
                  <div className={cn(MONO, 'text-[13px]')}>{c.opened.toLocaleString()}</div>
                  <div className={cn(MONO, 'text-[13px]')}>{c.clicked.toLocaleString()}</div>
                  <div className={cn(MONO, 'text-[13px] text-console-muted')}>{Math.round(c.open_rate * 100)}%</div>
                  <div className={cn(MONO, 'text-[11.5px] text-console-muted2')}>
                    {c.last_engaged_at ? format(new Date(c.last_engaged_at), 'd MMM yyyy').toUpperCase() : '—'}
                  </div>
                  <div><TierPill tier={c.tier} /></div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
