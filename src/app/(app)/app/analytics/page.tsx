'use client';
import { useState } from 'react';
import { useAuth } from '@/lib/context/auth.context';
import { useMailboxes } from '@/lib/hooks/useMailboxes';
import { useMailAnalytics, useMailActivity, type MailActivityEvent } from '@/lib/hooks/useMailAnalytics';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Sparkles, Table2, Download, Send, XCircle, Eye, MousePointerClick, AlertTriangle, Flag, UserMinus } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { apiLink } from '@/lib/constants/links';

const EVENT_META: Record<MailActivityEvent['type'], { icon: typeof Send; label: string; color: string }> = {
  sent: { icon: Send, label: 'Sent', color: 'text-muted-foreground' },
  failed: { icon: XCircle, label: 'Failed', color: 'text-destructive' },
  opened: { icon: Eye, label: 'Opened', color: 'text-[#1c6b47]' },
  clicked: { icon: MousePointerClick, label: 'Clicked', color: 'text-[#1c6b47]' },
  bounced: { icon: AlertTriangle, label: 'Bounced', color: 'text-amber-600' },
  complained: { icon: Flag, label: 'Complained', color: 'text-destructive' },
  unsubscribed: { icon: UserMinus, label: 'Unsubscribed', color: 'text-amber-600' },
};

// Polled (useMailActivity's 8s refetchInterval), not socket-pushed -- see
// that hook's own comment for why this is the right tradeoff here.
function ActivityFeed({ events, isLoading }: { events: MailActivityEvent[] | undefined; isLoading: boolean }) {
  if (isLoading) return <Skeleton className="h-48" />;
  const rows = events ?? [];
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="text-base flex items-center gap-2">
            Live activity
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1c6b47] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#1c6b47]" />
            </span>
          </CardTitle>
          <CardDescription>Sends, opens, and clicks as they happen</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">No activity in the last 7 days.</p>
        ) : (
          <div className="max-h-72 overflow-y-auto space-y-1">
            {rows.map((e, i) => {
              const meta = EVENT_META[e.type];
              const Icon = meta.icon;
              return (
                <div key={`${e.scheduled_id}-${e.type}-${i}`} className="flex items-center gap-3 text-sm py-1.5">
                  <Icon className={`h-4 w-4 shrink-0 ${meta.color}`} />
                  <span className={`font-medium shrink-0 ${meta.color}`}>{meta.label}</span>
                  <span className="truncate flex-1" title={e.subject}>{e.subject || '(no subject)'}</span>
                  <span className="text-muted-foreground truncate max-w-[160px] shrink-0" title={e.to.join(', ')}>{e.to[0] ?? ''}</span>
                  <span className="text-muted-foreground text-xs shrink-0 w-20 text-right">{formatDistanceToNow(new Date(e.at), { addSuffix: true })}</span>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Single-hue, single-series chart (opens per day is one series: count) --
// reuses the app's own primary/console-accent brand color rather than an
// unrelated default, per the dataviz skill's "swap in your brand's hues"
// guidance. No categorical palette needed since there's only one series.
const SERIES_COLOR = '#1c6b47';

const DAY_OPTIONS = [
  { label: 'Last 7 days', value: 7 },
  { label: 'Last 14 days', value: 14 },
  { label: 'Last 30 days', value: 30 },
  { label: 'Last 90 days', value: 90 },
];

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-3xl font-bold mt-1">{value}</p>
      </CardContent>
    </Card>
  );
}

// Thin bars, rounded data-end, a 2px surface gap between them, hover
// tooltip on every bar -- see the dataviz skill's mark-spec + interaction
// references. Single series: no legend (the card title already names it).
function OpensBarChart({ data }: { data: Array<{ date: string; opens: number }> }) {
  const max = Math.max(1, ...data.map((d) => d.opens));
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div className="flex items-end gap-[2px] h-40">
      {data.map((d, i) => (
        <div
          key={d.date}
          className="flex-1 h-full flex flex-col justify-end items-center relative group"
          onMouseEnter={() => setHovered(i)}
          onMouseLeave={() => setHovered(null)}
        >
          {hovered === i && (
            <div className="absolute bottom-full mb-1 px-2 py-1 rounded bg-foreground text-background text-xs whitespace-nowrap z-10">
              {new Date(d.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} · {d.opens} open{d.opens === 1 ? '' : 's'}
            </div>
          )}
          <div
            className="w-full rounded-t-sm transition-opacity"
            style={{
              height: `${Math.max((d.opens / max) * 100, d.opens > 0 ? 3 : 0)}%`,
              backgroundColor: SERIES_COLOR,
              opacity: hovered === null || hovered === i ? 1 : 0.5,
            }}
          />
        </div>
      ))}
    </div>
  );
}

function TopLinksList({ links }: { links: Array<{ url: string; clicks: number }> }) {
  const max = Math.max(1, ...links.map((l) => l.clicks));
  return (
    <div className="space-y-2">
      {links.map((l) => (
        <div key={l.url} className="space-y-1">
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="truncate" title={l.url}>{l.url}</span>
            <span className="text-muted-foreground shrink-0">{l.clicks}</span>
          </div>
          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{ width: `${(l.clicks / max) * 100}%`, backgroundColor: SERIES_COLOR }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AnalyticsPage() {
  const { token } = useAuth();
  const { data: mailboxes = [] } = useMailboxes(token);
  const [email, setEmail] = useState<string | null>(null);
  const [days, setDays] = useState(14);
  const [showTable, setShowTable] = useState(false);
  const activeEmail = email ?? mailboxes[0]?.email_address ?? null;

  const { data: result, isLoading } = useMailAnalytics(token, activeEmail, days);
  const analytics = result?.data;
  const { data: activityEvents, isLoading: isLoadingActivity } = useMailActivity(token, activeEmail);

  // Auth here is the httpOnly session cookie (CustomAxiosRequest.ts's
  // withCredentials), not the bearer token, so a plain new-tab navigation
  // carries it same as any other authenticated request — no need to fetch
  // a blob in JS just to attach an Authorization header. The backend's
  // Content-Disposition: attachment header handles the actual save-as.
  const handleExport = () => {
    if (!activeEmail) return;
    const url = `${apiLink}/mail/analytics/export?email=${encodeURIComponent(activeEmail)}&days=${days}`;
    window.open(url, '_blank');
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Analytics</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Opens and clicks across your sends</p>
        </div>
        <div className="flex gap-2">
          <Select value={activeEmail ?? ''} onValueChange={setEmail}>
            <SelectTrigger className="w-56"><SelectValue placeholder="Select a mailbox…" /></SelectTrigger>
            <SelectContent>
              {mailboxes.map((m) => (
                <SelectItem key={m.id} value={m.email_address}>{m.email_address}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={String(days)} onValueChange={(v) => setDays(Number(v))}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              {DAY_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={String(o.value)}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={handleExport} disabled={!activeEmail || !analytics}>
            <Download className="h-3.5 w-3.5 mr-1.5" /> Export CSV
          </Button>
        </div>
      </div>

      {activeEmail && <ActivityFeed events={activityEvents} isLoading={isLoadingActivity} />}

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-24" /><Skeleton className="h-24" /><Skeleton className="h-24" />
        </div>
      ) : result?.forbidden ? (
        <Card>
          <CardContent className="p-8 text-center space-y-3">
            <Sparkles className="h-8 w-8 mx-auto text-muted-foreground" />
            <p className="font-medium">Analytics is a Premium feature</p>
            <p className="text-sm text-muted-foreground">Upgrade to see opens-per-day trends and your most-clicked links.</p>
          </CardContent>
        </Card>
      ) : !analytics || !activeEmail ? (
        <p className="text-sm text-muted-foreground">No mailbox selected.</p>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <StatTile label="Emails sent" value={analytics.total_sent.toLocaleString()} />
            <StatTile label="Opens" value={analytics.total_opened.toLocaleString()} />
            <StatTile label="Open rate" value={`${Math.round(analytics.open_rate * 100)}%`} />
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-base">Opens per day</CardTitle>
                <CardDescription>Last {days} days</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setShowTable((v) => !v)}>
                <Table2 className="h-3.5 w-3.5 mr-1.5" /> {showTable ? 'Show chart' : 'Show as table'}
              </Button>
            </CardHeader>
            <CardContent>
              {analytics.opens_per_day.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">No opens recorded in this period.</p>
              ) : showTable ? (
                <div className="max-h-64 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="text-left text-muted-foreground"><th className="py-1">Date</th><th className="py-1 text-right">Opens</th></tr></thead>
                    <tbody>
                      {analytics.opens_per_day.map((d) => (
                        <tr key={d.date} className="border-t"><td className="py-1.5">{d.date}</td><td className="py-1.5 text-right">{d.opens}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <OpensBarChart data={analytics.opens_per_day} />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Top clicked links</CardTitle>
              <CardDescription>Last {days} days</CardDescription>
            </CardHeader>
            <CardContent>
              {analytics.top_links.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">No clicks recorded in this period.</p>
              ) : (
                <TopLinksList links={analytics.top_links} />
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
