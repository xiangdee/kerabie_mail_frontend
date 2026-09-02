'use client';
import { useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Trash2, Send, Plus, Loader2 } from 'lucide-react';
import { PlusCorners } from '@/components/app/console/PlusCorners';
import { TemplatePicker } from '@/components/app/campaigns/TemplatePicker';
import { HtmlBodyField } from '@/components/app/campaigns/HtmlBodyField';
import { cn } from '@/lib/utils';
import type {
  Campaign, CampaignStep, CampaignStats, CampaignAnalytics, ContactGroup, SegmentCondition,
} from '@/lib/types/api.types';
import type { CampaignStepInput, CampaignUpdateInput } from '@/lib/hooks/useCampaigns';
import type { EmailTemplate } from '@/lib/hooks/useTemplates';

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

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <div className={cn(MONO, 'text-[10px] tracking-[0.12em] text-console-muted2 mb-1.5')}>{children}</div>;
}

function Panel({ kicker, title, description, children }: { kicker: string; title: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="border border-console-border bg-white">
      <div className="px-5 py-4 border-b border-console-border">
        <div className={cn(MONO, 'text-[10px] tracking-[0.12em] text-console-muted2')}>{kicker}</div>
        <div className={cn(DISPLAY, 'font-semibold text-xl mt-0.5')}>{title}</div>
        {description && <div className="text-console-muted text-[13px] mt-0.5">{description}</div>}
      </div>
      <div className="p-5 space-y-4">{children}</div>
    </div>
  );
}

const FIELD_OPTIONS = [
  { value: 'company', label: 'Company' },
  { value: 'name', label: 'Name' },
  { value: 'phone', label: 'Phone' },
  { value: 'email', label: 'Email' },
  { value: 'notes', label: 'Notes' },
] as const;

const OP_OPTIONS = [
  { value: 'contains', label: 'contains' },
  { value: 'equals', label: 'equals' },
  { value: 'is_set', label: 'is set' },
  { value: 'is_not_set', label: 'is not set' },
] as const;

function pct(n: number, total: number): string {
  if (!total) return '0%';
  return `${Math.round((n / total) * 100)}%`;
}

interface Props {
  campaign: Campaign | null | undefined;
  groups: ContactGroup[];
  steps: CampaignStep[];
  templates: EmailTemplate[];
  stats: CampaignStats | null | undefined;
  analytics: CampaignAnalytics | null | undefined;
  isSaving: boolean;
  isSending: boolean;
  isPausing: boolean;
  isResuming: boolean;
  isAddingStep: boolean;
  onSave: (data: CampaignUpdateInput) => void;
  onSend: () => void;
  onPause: () => void;
  onResume: () => void;
  onAddStep: (data: CampaignStepInput) => void;
  onDeleteStep: (stepId: number) => void;
}

export default function CampaignDetailView(props: Props) {
  const { campaign } = props;
  if (!campaign) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64 rounded-none" />
        <Skeleton className="h-72 w-full rounded-none" />
      </div>
    );
  }
  // Keyed by id so switching campaigns remounts with fresh initial state,
  // instead of syncing local edits from the loaded resource via an effect.
  return <CampaignDetailForm key={campaign.id} {...props} campaign={campaign} />;
}

function CampaignDetailForm({
  campaign, groups, steps, templates, stats, analytics, isSaving, isSending, isPausing, isResuming, isAddingStep,
  onSave, onSend, onPause, onResume, onAddStep, onDeleteStep,
}: Omit<Props, 'campaign'> & { campaign: Campaign }) {
  const [name, setName] = useState(campaign.name);
  const [subject, setSubject] = useState(campaign.subject);
  const [bodyHtml, setBodyHtml] = useState(campaign.body_html);
  const [groupId, setGroupId] = useState(campaign.group_id ? String(campaign.group_id) : 'none');
  const [conditions, setConditions] = useState<SegmentCondition[]>(campaign.segment_filter ?? []);
  const [sendConfirmOpen, setSendConfirmOpen] = useState(false);
  const [deleteStepId, setDeleteStepId] = useState<number | null>(null);
  const [stepDialogOpen, setStepDialogOpen] = useState(false);

  const isDraft = campaign.status === 'draft';
  const isSendingOrPaused = campaign.status === 'sending' || campaign.status === 'paused';
  const followUps = steps.filter((s) => s.step_order > 0);
  const startedLabel = campaign.started_at ? format(new Date(campaign.started_at), 'd MMM HH:mm').toUpperCase() : '';
  const timestampLabel = campaign.status === 'draft'
    ? `CREATED ${format(new Date(campaign.created_at), 'd MMM yyyy').toUpperCase()}`
    : campaign.status === 'sending'
      ? `STARTED ${startedLabel}`
      : campaign.status === 'paused'
        ? `PAUSED · STARTED ${startedLabel}`
        : `SENT ${campaign.completed_at ? format(new Date(campaign.completed_at), 'd MMM HH:mm').toUpperCase() : ''}`;

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="flex items-center gap-3 flex-wrap">
        <Link href="/app/campaigns">
          <button type="button" className="bg-transparent border border-console-border h-8 px-3 text-[12.5px] text-console-muted hover:border-console-accent hover:text-console-accent transition-colors">
            ← Campaigns
          </button>
        </Link>
        <div className="flex-1" />
        {isDraft && (
          <Dialog open={sendConfirmOpen} onOpenChange={setSendConfirmOpen}>
            <DialogTrigger asChild>
              <Button disabled={campaign.recipient_count === 0}>
                <Send className="mr-2 h-4 w-4" /> Send
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Send to {campaign.recipient_count} recipients?</DialogTitle>
              </DialogHeader>
              <p className="text-sm text-muted-foreground">This starts sending immediately — you can pause it from here once it&rsquo;s underway.</p>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setSendConfirmOpen(false)}>Cancel</Button>
                <Button disabled={isSending} onClick={() => { onSend(); setSendConfirmOpen(false); }}>
                  {isSending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Send
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
        {isSendingOrPaused && (
          <Button
            variant="outline"
            disabled={isPausing || isResuming}
            onClick={campaign.status === 'paused' ? onResume : onPause}
          >
            {(isPausing || isResuming) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {campaign.status === 'paused' ? 'Resume send' : 'Pause send'}
          </Button>
        )}
      </div>

      <div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <StatusPill status={campaign.status} />
          <span className={cn(MONO, 'text-[10.5px] text-console-muted2 tracking-[0.06em]')}>{timestampLabel}</span>
        </div>
        <h1 className={cn(DISPLAY, 'font-semibold text-3xl sm:text-4xl leading-none mt-2')}>{campaign.name}</h1>
        <div className="text-console-muted mt-1.5">{campaign.subject}</div>
        <div className={cn(MONO, 'text-[11.5px] text-console-muted2 mt-1.5')}>
          {campaign.recipient_count.toLocaleString()} recipients · {campaign.step_count} step{campaign.step_count === 1 ? '' : 's'}
        </div>
      </div>

      <Panel kicker="STEP 1" title="Content &amp; recipients" description="Add follow-ups below for a drip sequence.">
        <div>
          <FieldLabel>Name</FieldLabel>
          <Input value={name} onChange={(e) => setName(e.target.value)} disabled={!isDraft} />
        </div>
        {isDraft && (
          <TemplatePicker
            templates={templates}
            onApply={(s, b) => { setSubject(s); setBodyHtml(b); }}
          />
        )}
        <div>
          <FieldLabel>Subject</FieldLabel>
          <Input value={subject} onChange={(e) => setSubject(e.target.value)} disabled={!isDraft} />
        </div>
        <HtmlBodyField value={bodyHtml} onChange={setBodyHtml} disabled={!isDraft} minHeight={150} />

        <div>
          <FieldLabel>Contact group</FieldLabel>
          <Select value={groupId} onValueChange={setGroupId} disabled={!isDraft}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">All contacts</SelectItem>
              {groups.map((g) => <SelectItem key={g.id} value={String(g.id)}>{g.name}</SelectItem>)}
            </SelectContent>
          </Select>
          {groups.length === 0 && (
            <div className="text-console-muted2 text-[12px] mt-1.5">
              No contact groups yet — <Link href="/app/contacts" className="underline hover:text-console-accent">create one in Contacts</Link>.
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <FieldLabel>Segment filters (optional, narrows the group above)</FieldLabel>
            {isDraft && (
              <button
                type="button"
                onClick={() => setConditions([...conditions, { field: 'company', op: 'contains', value: '' }])}
                className={cn(MONO, 'flex items-center gap-1 text-[10.5px] text-console-muted2 hover:text-console-accent transition-colors shrink-0')}
              >
                <Plus className="h-3 w-3" /> ADD FILTER
              </button>
            )}
          </div>
          <div className="space-y-2">
            {conditions.map((cond, i) => (
              <div key={i} className="flex items-center gap-2">
                <Select
                  value={cond.field} disabled={!isDraft}
                  onValueChange={(v) => setConditions(conditions.map((c, j) => j === i ? { ...c, field: v as SegmentCondition['field'] } : c))}
                >
                  <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                  <SelectContent>{FIELD_OPTIONS.map((f) => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}</SelectContent>
                </Select>
                <Select
                  value={cond.op} disabled={!isDraft}
                  onValueChange={(v) => setConditions(conditions.map((c, j) => j === i ? { ...c, op: v as SegmentCondition['op'] } : c))}
                >
                  <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                  <SelectContent>{OP_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                </Select>
                {(cond.op === 'contains' || cond.op === 'equals') && (
                  <Input
                    value={cond.value ?? ''} disabled={!isDraft}
                    onChange={(e) => setConditions(conditions.map((c, j) => j === i ? { ...c, value: e.target.value } : c))}
                    placeholder="value" className="flex-1"
                  />
                )}
                {isDraft && (
                  <Button variant="ghost" size="icon" onClick={() => setConditions(conditions.filter((_, j) => j !== i))}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>

        {isDraft && (
          <button
            type="button"
            disabled={isSaving}
            onClick={() => onSave({
              name, subject, body_html: bodyHtml,
              group_id: groupId === 'none' ? null : Number(groupId),
              segment_filter: conditions.filter((c) => c.field && c.op),
            })}
            className={cn('relative bg-console-accent text-white border-0 h-9 px-5 hover:bg-console-accent-dark transition-colors disabled:opacity-50', DISPLAY, 'font-semibold text-[15px] tracking-[0.04em] flex items-center gap-2')}
          >
            {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
            SAVE
            <PlusCorners variant="all" />
          </button>
        )}
      </Panel>

      <Panel kicker="SEQUENCE" title="Drip follow-ups" description="Sent automatically after the delay below, relative to the previous step.">
        {followUps.length > 0 && (
          <div className="border-t border-console-border-soft -mx-5 -mt-1">
            {followUps.map((s, i) => (
              <div
                key={s.id}
                className={cn('flex items-start justify-between gap-3 px-5 py-3.5', i < followUps.length - 1 && 'border-b border-console-border-soft')}
              >
                <div className="min-w-0">
                  <div className={cn(MONO, 'text-[10.5px] text-console-muted2 tracking-[0.04em]')}>
                    STEP {s.step_order + 1} · {s.delay_hours}H AFTER PREVIOUS
                  </div>
                  <p className="text-[13.5px] mt-1">
                    {s.subject}{s.subject_b ? ` (A/B vs "${s.subject_b}", ${s.ab_split_percent}% A)` : ''}
                  </p>
                </div>
                {isDraft && (
                  <button type="button" onClick={() => setDeleteStepId(s.id)} className="text-console-muted2 hover:text-console-red transition-colors shrink-0">
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {isDraft && (
          <Dialog open={stepDialogOpen} onOpenChange={setStepDialogOpen}>
            <DialogTrigger asChild>
              <button type="button" className="w-full border border-console-border h-9 px-5 text-[13px] text-console-muted hover:border-console-accent hover:text-console-accent transition-colors flex items-center justify-center gap-2">
                <Plus className="h-4 w-4" /> Add follow-up step
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
              <DialogHeader><DialogTitle>Add follow-up step</DialogTitle></DialogHeader>
              <AddStepForm
                templates={templates}
                isSubmitting={isAddingStep}
                onSubmit={(data) => { onAddStep(data); setStepDialogOpen(false); }}
              />
            </DialogContent>
          </Dialog>
        )}
      </Panel>

      {isDraft && !stats && (
        <section className="border border-console-border bg-console-hover p-5">
          <div className={cn(MONO, 'text-[10px] tracking-[0.12em] text-console-muted2')}>NO REPORT YET</div>
          <div className={cn(DISPLAY, 'font-semibold text-2xl mt-1')}>Nothing sent yet</div>
          <div className="text-console-muted mt-1 max-w-[60ch]">
            Reporting appears here once you send this campaign — delivered, opened and clicked counts refresh automatically while it sends.
          </div>
        </section>
      )}

      {stats && (
        <div>
          <div className={cn(MONO, 'text-[10px] tracking-[0.12em] text-console-muted2 mb-2')}>DELIVERY</div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 border border-console-border divide-x divide-y sm:divide-y-0 divide-console-border bg-white">
            {([
              ['TOTAL', stats.total, undefined],
              ['SENT', stats.sent, undefined],
              ['OPENED', stats.opened, pct(stats.opened, stats.sent)],
              ['CLICKED', stats.clicked, pct(stats.clicked, stats.sent)],
              ['SUPPRESSED', stats.suppressed, undefined],
              ['BOUNCED', stats.bounced, undefined],
            ] as const).map(([label, val, rate]) => (
              <div key={label} className="p-4">
                <div className={cn(MONO, 'text-[9.5px] tracking-[0.1em] text-console-muted2')}>{label}</div>
                <div className={cn(DISPLAY, 'font-semibold text-3xl leading-none mt-2')}>{val.toLocaleString()}</div>
                {rate && <div className={cn(MONO, 'text-[10.5px] text-console-accent mt-1.5')}>{rate}</div>}
              </div>
            ))}
          </div>
        </div>
      )}

      {analytics && analytics.steps.length > 0 && (
        <Panel
          kicker="PER-STEP"
          title="Step analytics"
          description={`${analytics.enrolled} enrolled · ${analytics.active} active · ${analytics.completed} completed · ${analytics.suppressed} suppressed`}
        >
          <div className="space-y-3">
            {analytics.steps.map((s) => (
              <div key={s.step_id} className="border border-console-border-soft bg-console-hover p-3.5">
                <p className={cn(MONO, 'text-[10.5px] text-console-muted2 tracking-[0.04em]')}>STEP {s.step_order + 1}</p>
                <p className="text-[13.5px] mt-1">
                  Sent {s.sent} · Opened {s.opened} ({pct(s.opened, s.sent)}) · Clicked {s.clicked} ({pct(s.clicked, s.sent)})
                </p>
                {(s.variant_a_sent > 0 || s.variant_b_sent > 0) && (
                  <div className="grid grid-cols-2 gap-3 text-[13px] mt-2.5">
                    <div>
                      <p className="font-medium">Variant A</p>
                      <p className="text-console-muted">
                        {s.variant_a_sent} sent · {pct(s.variant_a_opened, s.variant_a_sent)} opened · {pct(s.variant_a_clicked, s.variant_a_sent)} clicked
                      </p>
                    </div>
                    <div>
                      <p className="font-medium">Variant B</p>
                      <p className="text-console-muted">
                        {s.variant_b_sent} sent · {pct(s.variant_b_opened, s.variant_b_sent)} opened · {pct(s.variant_b_clicked, s.variant_b_sent)} clicked
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Panel>
      )}

      <Dialog open={deleteStepId !== null} onOpenChange={(o) => !o && setDeleteStepId(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Remove this step?</DialogTitle></DialogHeader>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setDeleteStepId(null)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={() => { if (deleteStepId !== null) onDeleteStep(deleteStepId); setDeleteStepId(null); }}
            >
              Remove
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AddStepForm({
  templates, isSubmitting, onSubmit,
}: { templates: EmailTemplate[]; isSubmitting: boolean; onSubmit: (data: CampaignStepInput) => void }) {
  const [delayHours, setDelayHours] = useState(24);
  const [subject, setSubject] = useState('');
  const [bodyHtml, setBodyHtml] = useState('');
  const [abEnabled, setAbEnabled] = useState(false);
  const [subjectB, setSubjectB] = useState('');
  const [splitPercent, setSplitPercent] = useState(50);

  const canSubmit = subject.trim() && bodyHtml.trim();

  return (
    <div className="space-y-3">
      <div>
        <FieldLabel>Delay (hours after previous step)</FieldLabel>
        <Input type="number" min={0} value={delayHours} onChange={(e) => setDelayHours(Number(e.target.value))} className="w-32" />
      </div>
      <TemplatePicker
        templates={templates}
        onApply={(s, b) => { setSubject(s); setBodyHtml(b); }}
      />
      <div>
        <FieldLabel>Subject</FieldLabel>
        <Input value={subject} onChange={(e) => setSubject(e.target.value)} />
      </div>
      <HtmlBodyField value={bodyHtml} onChange={setBodyHtml} minHeight={120} />
      <div className="flex items-center gap-2">
        <input type="checkbox" checked={abEnabled} onChange={(e) => setAbEnabled(e.target.checked)} id="ab-toggle" />
        <label htmlFor="ab-toggle" className="text-[13.5px]">A/B test the subject line</label>
      </div>
      {abEnabled && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <FieldLabel>Subject B</FieldLabel>
            <Input value={subjectB} onChange={(e) => setSubjectB(e.target.value)} />
          </div>
          <div>
            <FieldLabel>% on Variant A</FieldLabel>
            <Input type="number" min={0} max={100} value={splitPercent} onChange={(e) => setSplitPercent(Number(e.target.value))} />
          </div>
        </div>
      )}
      <button
        type="button"
        disabled={!canSubmit || isSubmitting}
        onClick={() => onSubmit({
          delay_hours: delayHours, subject, body_html: bodyHtml,
          ab_split_percent: splitPercent, subject_b: abEnabled ? subjectB : null,
        })}
        className={cn('relative w-full bg-console-accent text-white border-0 h-9 px-5 hover:bg-console-accent-dark transition-colors disabled:opacity-50', DISPLAY, 'font-semibold text-[15px] tracking-[0.04em] flex items-center justify-center gap-2')}
      >
        {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
        ADD STEP
        <PlusCorners variant="all" />
      </button>
    </div>
  );
}
