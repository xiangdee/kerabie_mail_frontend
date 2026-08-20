'use client';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Trash2, Send, Plus, Loader2, BarChart2 } from 'lucide-react';
import type {
  Campaign, CampaignStep, CampaignStats, CampaignAnalytics, ContactGroup, SegmentCondition,
} from '@/lib/types/api.types';
import type { CampaignStepInput, CampaignUpdateInput } from '@/lib/hooks/useCampaigns';

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'outline'> = {
  draft: 'outline',
  sending: 'secondary',
  sent: 'default',
};

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
  stats: CampaignStats | null | undefined;
  analytics: CampaignAnalytics | null | undefined;
  isSaving: boolean;
  isSending: boolean;
  isAddingStep: boolean;
  onSave: (data: CampaignUpdateInput) => void;
  onSend: () => void;
  onAddStep: (data: CampaignStepInput) => void;
  onDeleteStep: (stepId: number) => void;
}

export default function CampaignDetailView({
  campaign, groups, steps, stats, analytics, isSaving, isSending, isAddingStep,
  onSave, onSend, onAddStep, onDeleteStep,
}: Props) {
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [bodyHtml, setBodyHtml] = useState('');
  const [groupId, setGroupId] = useState('none');
  const [conditions, setConditions] = useState<SegmentCondition[]>([]);
  const [sendConfirmOpen, setSendConfirmOpen] = useState(false);
  const [deleteStepId, setDeleteStepId] = useState<number | null>(null);
  const [stepDialogOpen, setStepDialogOpen] = useState(false);

  useEffect(() => {
    if (!campaign) return;
    setName(campaign.name);
    setSubject(campaign.subject);
    setBodyHtml(campaign.body_html);
    setGroupId(campaign.group_id ? String(campaign.group_id) : 'none');
    setConditions(campaign.segment_filter ?? []);
  }, [campaign]);

  if (!campaign) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-72 w-full" />
      </div>
    );
  }

  const isDraft = campaign.status === 'draft';
  const followUps = steps.filter((s) => s.step_order > 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            {campaign.name}
            <Badge variant={STATUS_VARIANT[campaign.status] ?? 'outline'}>{campaign.status}</Badge>
          </h1>
          <p className="text-sm text-muted-foreground">{campaign.recipient_count} recipients &middot; {campaign.step_count} step(s)</p>
        </div>
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
              <p className="text-sm text-muted-foreground">This starts sending immediately and cannot be paused mid-flight.</p>
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
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Content &amp; Recipients</CardTitle>
          <CardDescription>Step 1 of the sequence &mdash; add follow-ups below for a drip.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} disabled={!isDraft} />
          </div>
          <div className="space-y-1.5">
            <Label>Subject</Label>
            <Input value={subject} onChange={(e) => setSubject(e.target.value)} disabled={!isDraft} />
          </div>
          <div className="space-y-1.5">
            <Label>Body (HTML)</Label>
            <Textarea value={bodyHtml} onChange={(e) => setBodyHtml(e.target.value)} disabled={!isDraft} className="min-h-[150px]" />
          </div>

          <div className="space-y-1.5">
            <Label>Contact Group</Label>
            <Select value={groupId} onValueChange={setGroupId} disabled={!isDraft}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">All contacts</SelectItem>
                {groups.map((g) => <SelectItem key={g.id} value={String(g.id)}>{g.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Segment filters (optional, narrows the group above)</Label>
              {isDraft && (
                <Button
                  variant="outline" size="sm"
                  onClick={() => setConditions([...conditions, { field: 'company', op: 'contains', value: '' }])}
                >
                  <Plus className="h-3 w-3 mr-1" /> Add filter
                </Button>
              )}
            </div>
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

          {isDraft && (
            <Button
              disabled={isSaving}
              onClick={() => onSave({
                name, subject, body_html: bodyHtml,
                group_id: groupId === 'none' ? null : Number(groupId),
                segment_filter: conditions.filter((c) => c.field && c.op),
              })}
            >
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save
            </Button>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Drip Follow-ups</CardTitle>
          <CardDescription>Sent automatically after the delay below, relative to the previous step.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {followUps.map((s) => (
            <div key={s.id} className="p-3 rounded-lg bg-muted/30 flex items-start justify-between gap-3">
              <div>
                <p className="font-medium text-sm">Step {s.step_order + 1} &mdash; {s.delay_hours}h after previous</p>
                <p className="text-sm text-muted-foreground">
                  {s.subject}{s.subject_b ? ` (A/B vs "${s.subject_b}", ${s.ab_split_percent}% A)` : ''}
                </p>
              </div>
              {isDraft && (
                <Button variant="ghost" size="icon" onClick={() => setDeleteStepId(s.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}

          {isDraft && (
            <Dialog open={stepDialogOpen} onOpenChange={setStepDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline"><Plus className="mr-2 h-4 w-4" /> Add follow-up step</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
                <DialogHeader><DialogTitle>Add follow-up step</DialogTitle></DialogHeader>
                <AddStepForm
                  isSubmitting={isAddingStep}
                  onSubmit={(data) => { onAddStep(data); setStepDialogOpen(false); }}
                />
              </DialogContent>
            </Dialog>
          )}
        </CardContent>
      </Card>

      {stats && (
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><BarChart2 className="h-4 w-4" /> Delivery</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-4 text-center">
              {([
                ['Total', stats.total], ['Sent', stats.sent], ['Suppressed', stats.suppressed],
                ['Opened', stats.opened], ['Clicked', stats.clicked], ['Bounced', stats.bounced],
              ] as const).map(([label, val]) => (
                <div key={label}>
                  <p className="text-2xl font-bold text-foreground">{val}</p>
                  <p className="text-xs text-muted-foreground">{label}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {analytics && analytics.steps.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Per-step Analytics</CardTitle>
            <CardDescription>
              {analytics.enrolled} enrolled &middot; {analytics.active} active &middot; {analytics.completed} completed &middot; {analytics.suppressed} suppressed
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {analytics.steps.map((s) => (
              <div key={s.step_id} className="p-3 rounded-lg bg-muted/30 space-y-2">
                <p className="font-medium text-sm">Step {s.step_order + 1}</p>
                <p className="text-sm text-muted-foreground">
                  Sent {s.sent} &middot; Opened {s.opened} ({pct(s.opened, s.sent)}) &middot; Clicked {s.clicked} ({pct(s.clicked, s.sent)})
                </p>
                {(s.variant_a_sent > 0 || s.variant_b_sent > 0) && (
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="font-medium">Variant A</p>
                      <p className="text-muted-foreground">
                        {s.variant_a_sent} sent &middot; {pct(s.variant_a_opened, s.variant_a_sent)} opened &middot; {pct(s.variant_a_clicked, s.variant_a_sent)} clicked
                      </p>
                    </div>
                    <div>
                      <p className="font-medium">Variant B</p>
                      <p className="text-muted-foreground">
                        {s.variant_b_sent} sent &middot; {pct(s.variant_b_opened, s.variant_b_sent)} opened &middot; {pct(s.variant_b_clicked, s.variant_b_sent)} clicked
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
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

function AddStepForm({ isSubmitting, onSubmit }: { isSubmitting: boolean; onSubmit: (data: CampaignStepInput) => void }) {
  const [delayHours, setDelayHours] = useState(24);
  const [subject, setSubject] = useState('');
  const [bodyHtml, setBodyHtml] = useState('');
  const [abEnabled, setAbEnabled] = useState(false);
  const [subjectB, setSubjectB] = useState('');
  const [splitPercent, setSplitPercent] = useState(50);

  const canSubmit = subject.trim() && bodyHtml.trim();

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label>Delay (hours after previous step)</Label>
        <Input type="number" min={0} value={delayHours} onChange={(e) => setDelayHours(Number(e.target.value))} className="w-32" />
      </div>
      <div className="space-y-1.5">
        <Label>Subject</Label>
        <Input value={subject} onChange={(e) => setSubject(e.target.value)} />
      </div>
      <div className="space-y-1.5">
        <Label>Body (HTML)</Label>
        <Textarea value={bodyHtml} onChange={(e) => setBodyHtml(e.target.value)} className="min-h-[120px]" />
      </div>
      <div className="flex items-center gap-2">
        <input type="checkbox" checked={abEnabled} onChange={(e) => setAbEnabled(e.target.checked)} id="ab-toggle" />
        <Label htmlFor="ab-toggle">A/B test the subject line</Label>
      </div>
      {abEnabled && (
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Subject B</Label>
            <Input value={subjectB} onChange={(e) => setSubjectB(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>% on Variant A</Label>
            <Input type="number" min={0} max={100} value={splitPercent} onChange={(e) => setSplitPercent(Number(e.target.value))} />
          </div>
        </div>
      )}
      <Button
        disabled={!canSubmit || isSubmitting}
        onClick={() => onSubmit({
          delay_hours: delayHours, subject, body_html: bodyHtml,
          ab_split_percent: splitPercent, subject_b: abEnabled ? subjectB : null,
        })}
      >
        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Add Step
      </Button>
    </div>
  );
}
