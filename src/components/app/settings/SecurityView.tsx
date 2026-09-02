'use client';
import { format, formatDistanceToNow } from 'date-fns';
import { Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { PlusCorners } from '@/components/app/console/PlusCorners';
import { cn } from '@/lib/utils';
import type { Session } from '@/lib/hooks/useSecurity';

const MONO = "font-[family-name:var(--font-plex-mono)]";
const DISPLAY = "font-[family-name:var(--font-barlow-condensed)]";

// A user agent doesn't reveal a hardware model (no "MacBook Pro" / "iPhone
// 15" — that's not information the browser sends), only browser + platform
// family, and not reliably versioned without a full UA-parsing library —
// so this stays a coarse, honest label rather than guessing specifics.
function parseClient(ua: string | null): string {
  if (!ua) return 'Unknown device';
  const lower = ua.toLowerCase();
  let browser = 'Browser';
  if (lower.includes('firefox')) browser = 'Firefox';
  else if (lower.includes('edg/')) browser = 'Edge';
  else if (lower.includes('chrome')) browser = 'Chrome';
  else if (lower.includes('safari')) browser = 'Safari';
  let os = '';
  if (lower.includes('iphone') || lower.includes('ipad')) os = 'iOS';
  else if (lower.includes('android')) os = 'Android';
  else if (lower.includes('mac os')) os = 'macOS';
  else if (lower.includes('windows')) os = 'Windows';
  else if (lower.includes('linux')) os = 'Linux';
  return os ? `${browser} · ${os}` : browser;
}

function isMobileUa(ua: string | null): boolean {
  if (!ua) return false;
  const lower = ua.toLowerCase();
  return lower.includes('mobile') || lower.includes('android') || lower.includes('iphone');
}

export interface SecurityRecommendation {
  id: string;
  title: string;
  desc: string;
  done: boolean;
  cta: string;
  href: string;
}

interface Props {
  mailboxEmail?: string;
  sessions: Session[];
  isLoading: boolean;
  isRevoking: boolean;
  isRevokingAll: boolean;
  recommendations: SecurityRecommendation[];
  onRevoke: (id: number) => void;
  onRevokeAll: () => void;
}

export default function SecurityView({
  mailboxEmail, sessions, isLoading, isRevoking, isRevokingAll, recommendations,
  onRevoke, onRevokeAll,
}: Props) {
  const otherSessions = sessions.filter((s) => !s.is_current);
  const doneCount = recommendations.filter((r) => r.done).length;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-72 rounded-none" />
        <Skeleton className="h-40 w-full rounded-none" />
        <Skeleton className="h-64 w-full rounded-none" />
      </div>
    );
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="flex items-end gap-4 flex-wrap">
        <div>
          <h1 className={cn(DISPLAY, 'font-semibold text-3xl sm:text-4xl leading-none')}>Security</h1>
          <div className="text-console-muted mt-1.5 max-w-[70ch]">
            Sign-in protection, device access, and account recovery
            {mailboxEmail && <> for <span className={cn(MONO, 'text-console-ink text-[12.5px]')}>{mailboxEmail}</span></>}.
          </div>
        </div>
        <div className="flex-1" />
        {otherSessions.length > 0 && (
          <button
            type="button" onClick={onRevokeAll} disabled={isRevokingAll}
            className={cn('bg-console-ink text-white border-0 h-9 px-5 hover:bg-console-red transition-colors disabled:opacity-40 flex items-center gap-2', MONO, 'text-[10.5px] tracking-[0.08em]')}
          >
            {isRevokingAll && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            SIGN OUT ALL OTHER DEVICES
          </button>
        )}
      </div>

      {/* Posture */}
      <section className="grid grid-cols-1 md:grid-cols-[280px_minmax(0,1fr)] border border-console-border bg-white">
        <div className="relative p-5 border-b md:border-b-0 md:border-r border-console-border">
          <PlusCorners variant="diagonal" />
          <div className={cn(MONO, 'text-[10px] tracking-[0.12em] text-console-muted2')}>ACCOUNT HARDENING</div>
          <div className="flex items-baseline gap-2 mt-3">
            <div className={cn(DISPLAY, 'font-semibold text-[48px] leading-[0.9]')}>{doneCount}</div>
            <div className={cn(MONO, 'text-[12px] text-console-muted2')}>/ {recommendations.length} STEPS DONE</div>
          </div>
          <div className="flex gap-1 mt-4">
            {recommendations.map((r) => (
              <div key={r.id} className="flex-1 h-1.5" style={{ background: r.done ? 'var(--color-console-accent)' : '#dfe2dc' }} />
            ))}
          </div>
          <div className="text-console-muted text-[13px] mt-3.5">
            {doneCount >= recommendations.length
              ? 'This account is in good shape. Keep an eye on new sessions after every handover.'
              : 'Closing the gaps below meaningfully lowers the odds a leaked password is enough on its own.'}
          </div>
        </div>
        <div className="flex flex-col">
          {recommendations.map((r, i) => (
            <div
              key={r.id}
              className={cn('flex items-center gap-3.5 p-4 sm:p-5', i < recommendations.length - 1 && 'border-b border-console-border-soft')}
            >
              <span
                className="w-5 h-5 shrink-0 flex items-center justify-center text-[11px] text-white mt-0.5"
                style={{ background: r.done ? 'var(--color-console-accent)' : 'var(--color-console-amber)' }}
              >
                {r.done ? '✓' : '!'}
              </span>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-[14.5px]">{r.title}</div>
                <div className="text-console-muted text-[13px] mt-0.5">{r.desc}</div>
              </div>
              <a
                href={r.href}
                className={cn(
                  'shrink-0 border h-8 px-3.5 flex items-center text-[12.5px] transition-colors',
                  r.done ? 'border-console-border text-console-muted hover:border-console-accent hover:text-console-accent' : 'border-console-accent text-console-accent hover:bg-console-accent hover:text-white',
                )}
              >
                {r.cta}
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* Sessions */}
      <section id="sessions-section" className="border border-console-border bg-white scroll-mt-20">
        <div className="px-5 py-4 border-b border-console-border">
          <div className={cn(DISPLAY, 'font-semibold text-2xl leading-tight')}>Active sessions</div>
          <div className="text-console-muted text-[13px] mt-0.5">
            {sessions.length} device{sessions.length === 1 ? '' : 's'} signed in
          </div>
        </div>

        <div className="hidden md:grid grid-cols-[2fr_1.1fr_1fr_1fr_auto] px-5 py-2.5 border-b border-console-border">
          {['DEVICE', 'IP', 'LAST ACTIVE', 'SIGNED IN', ''].map((h) => (
            <div key={h} className={cn(MONO, 'text-[9.5px] tracking-[0.12em] text-console-muted2')}>{h}</div>
          ))}
        </div>
        {sessions.length === 0 ? (
          <div className="p-10 text-center text-console-muted text-sm">No sessions found.</div>
        ) : (
          sessions.map((s, i) => (
            <div
              key={s.id}
              className={cn(
                'flex flex-wrap md:grid md:grid-cols-[2fr_1.1fr_1fr_1fr_auto] items-center gap-x-4 gap-y-1.5 px-5 py-3.5',
                i < sessions.length - 1 && 'border-b border-console-border-soft',
              )}
            >
              <div className="flex items-center gap-2.5 min-w-0 basis-full md:basis-auto">
                <span className={cn(MONO, 'text-[13px] text-console-muted2 shrink-0')}>{isMobileUa(s.user_agent) ? '▯' : '▭'}</span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-[14px] truncate">{parseClient(s.user_agent)}</span>
                    {s.is_current && (
                      <span className={cn(MONO, 'text-[9px] tracking-[0.08em] uppercase px-1.5 py-0.5 border border-console-accent text-console-accent')}>Current</span>
                    )}
                  </div>
                </div>
              </div>
              <div className={cn(MONO, 'text-[12px] text-console-muted')}>{s.ip_address ?? 'Unknown'}</div>
              <div className={cn(MONO, 'text-[12px] text-console-muted')}>
                {formatDistanceToNow(new Date(s.last_active_at ?? s.created_at), { addSuffix: true })}
              </div>
              <div className={cn(MONO, 'text-[12px] text-console-muted3')}>{format(new Date(s.created_at), 'd MMM').toUpperCase()}</div>
              <div className="flex justify-start md:justify-end">
                {!s.is_current && (
                  <button
                    type="button" onClick={() => onRevoke(s.id)} disabled={isRevoking}
                    className={cn(MONO, 'border border-console-border h-7 px-2.5 text-[10px] tracking-[0.06em] text-console-muted hover:border-console-red hover:text-console-red transition-colors disabled:opacity-40')}
                  >
                    SIGN OUT
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  );
}
