'use client';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Search, Loader2, Copy, Check } from 'lucide-react';
import { useAppToast } from '@/components/ui/app-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PlusCorners } from '@/components/app/console/PlusCorners';
import { cn } from '@/lib/utils';
import { extractTemplateVariables } from '@/lib/constants/templateDesigns';
import type { EmailTemplate } from '@/lib/hooks/useTemplates';
import type { UserEmailAccount } from '@/lib/types/api.types';

const MONO = "font-[family-name:var(--font-plex-mono)]";
const DISPLAY = "font-[family-name:var(--font-barlow-condensed)]";

interface Props {
  templates: EmailTemplate[];
  mailboxes: UserEmailAccount[];
  isLoading: boolean;
  isDeleting: boolean;
  isSending: boolean;
  onDuplicate: (t: EmailTemplate) => void;
  onDelete: (id: number) => void;
  onSend: (data: { from_email: string; to: string[]; template_id: number; variables: Record<string, string> }) => Promise<boolean>;
}

export default function TemplatesView({
  templates, mailboxes, isLoading, isDeleting, isSending, onDuplicate, onDelete, onSend,
}: Props) {
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState<'all' | 'mine' | 'shared'>('all');
  const [sendTarget, setSendTarget] = useState<EmailTemplate | null>(null);

  const list = useMemo(() => templates.filter((t) => {
    const q = query.trim().toLowerCase();
    const okQ = !q || t.name.toLowerCase().includes(q) || (t.subject ?? '').toLowerCase().includes(q);
    const okTab = tab === 'all' || (tab === 'shared' ? t.is_shared : !t.is_shared);
    return okQ && okTab;
  }), [templates, query, tab]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64 rounded-none" />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-72 rounded-none" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="flex items-end gap-4 flex-wrap">
        <div>
          <h1 className={cn(DISPLAY, 'font-semibold text-3xl sm:text-4xl leading-none')}>Email templates</h1>
          <div className="text-console-muted mt-1.5 max-w-[70ch]">
            Reusable HTML emails with placeholders. Send from here, from webmail compose, or over the API.
          </div>
        </div>
        <div className="flex-1" />
        <div className="flex items-center gap-2 border border-console-border h-9 px-3 bg-white">
          <Search className="h-3.5 w-3.5 text-console-muted2" />
          <input
            value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder="Search templates" className="border-0 outline-none bg-transparent text-sm w-40 sm:w-56"
          />
        </div>
        <Link href="/app/templates/new">
          <button
            type="button"
            className={cn('relative bg-console-accent text-white border-0 h-9 px-5 hover:bg-console-accent-dark transition-colors', DISPLAY, 'font-semibold text-[15px] tracking-[0.04em]')}
          >
            + NEW TEMPLATE
            <PlusCorners variant="all" />
          </button>
        </Link>
      </div>

      <div className="flex items-center gap-3 border-t border-b border-console-border py-2.5">
        <div className="flex border border-console-border h-8">
          {(['all', 'mine', 'shared'] as const).map((t) => (
            <button
              key={t} type="button" onClick={() => setTab(t)}
              className={cn(MONO, 'px-3.5 text-[10.5px] tracking-[0.08em] uppercase', tab === t ? 'bg-console-ink text-white' : 'text-console-muted')}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="flex-1" />
        <div className={cn(MONO, 'text-[10.5px] tracking-[0.08em] text-console-muted2')}>
          {list.length} OF {templates.length} TEMPLATES
        </div>
      </div>

      {list.length === 0 ? (
        <div className="border border-console-border bg-white p-12 text-center">
          <p className="text-sm text-console-muted mb-4">
            {templates.length === 0 ? 'No templates yet.' : 'No templates match your search.'}
          </p>
          {templates.length === 0 && (
            <Link href="/app/templates/new">
              <Button size="sm">Start from a design</Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {list.map((t) => (
            <TemplateCard key={t.id} template={t} onDuplicate={onDuplicate} onDelete={onDelete} onSend={setSendTarget} isDeleting={isDeleting} />
          ))}
        </div>
      )}

      <Dialog open={!!sendTarget} onOpenChange={(o) => !o && setSendTarget(null)}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Send "{sendTarget?.name}"</DialogTitle>
          </DialogHeader>
          {sendTarget && (
            <SendForm
              template={sendTarget}
              mailboxes={mailboxes}
              isSending={isSending}
              onSend={async (data) => {
                const ok = await onSend(data);
                if (ok) setSendTarget(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function TemplateCard({
  template, onDuplicate, onDelete, onSend, isDeleting,
}: {
  template: EmailTemplate;
  onDuplicate: (t: EmailTemplate) => void;
  onDelete: (id: number) => void;
  onSend: (t: EmailTemplate) => void;
  isDeleting: boolean;
}) {
  const { success } = useAppToast();
  const [copied, setCopied] = useState(false);

  const handleCopyId = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await navigator.clipboard.writeText(String(template.id));
    setCopied(true);
    success('Template ID copied');
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="relative border border-console-border bg-white flex flex-col hover:border-console-accent transition-colors">
      <Link href={`/app/templates/${template.id}`} className="relative block h-[190px] overflow-hidden bg-[#eceee8]">
        <iframe title={template.name} srcDoc={template.body_html} scrolling="no" className="w-full pointer-events-none" style={{ height: 250 }} />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white/90" />
      </Link>
      <div className="p-4 border-t border-console-border-soft flex flex-col gap-2 flex-1">
        <div className="flex items-center gap-2">
          <Link href={`/app/templates/${template.id}`} className={cn(DISPLAY, 'font-semibold text-xl leading-tight flex-1 min-w-0 truncate hover:text-console-accent')}>
            {template.name}
          </Link>
          {template.is_shared && (
            <span className={cn(MONO, 'text-[9.5px] tracking-[0.06em] px-1.5 py-0.5 border border-console-border text-console-muted2 shrink-0')}>SHARED</span>
          )}
        </div>
        {template.subject && <p className="text-[13px] text-console-muted truncate">{template.subject}</p>}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleCopyId}
            title="Copy template ID"
            className={cn(MONO, 'flex items-center gap-1.5 text-[10px] text-console-muted3 tracking-[0.03em] hover:text-console-accent transition-colors')}
          >
            {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            ID {template.id}
          </button>
          <div className={cn(MONO, 'text-[10px] text-console-muted3 tracking-[0.03em]')}>
            {extractTemplateVariables(template.subject, template.body_html).length} placeholders
          </div>
        </div>
        <div className="flex gap-2 mt-auto pt-1">
          <Link href={`/app/templates/${template.id}`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full h-8 text-xs">Edit</Button>
          </Link>
          <Button variant="outline" size="sm" className="h-8 text-xs px-3" onClick={() => onDuplicate(template)}>Duplicate</Button>
          <Button size="sm" className="h-8 text-xs px-3" onClick={() => onSend(template)}>Send</Button>
        </div>
        <button
          type="button"
          onClick={() => onDelete(template.id)}
          disabled={isDeleting}
          className="text-[11px] text-console-muted2 hover:text-console-red text-left mt-1"
        >
          Delete
        </button>
      </div>
      <PlusCorners variant="diagonal" />
    </div>
  );
}

function SendForm({
  template, mailboxes, isSending, onSend,
}: {
  template: EmailTemplate;
  mailboxes: UserEmailAccount[];
  isSending: boolean;
  onSend: (data: { from_email: string; to: string[]; template_id: number; variables: Record<string, string> }) => Promise<void>;
}) {
  const variables = useMemo(() => extractTemplateVariables(template.subject, template.body_html), [template]);
  const [fromEmail, setFromEmail] = useState(mailboxes[0]?.email_address ?? '');
  const [to, setTo] = useState('');
  const [values, setValues] = useState<Record<string, string>>({});

  const handleSubmit = () => {
    if (!fromEmail || !to.trim()) return;
    onSend({
      from_email: fromEmail,
      to: to.split(',').map((s) => s.trim()).filter(Boolean),
      template_id: template.id,
      variables: values,
    });
  };

  return (
    <div className="space-y-4 pt-2">
      <div className="space-y-2">
        <Label>From</Label>
        <Select value={fromEmail} onValueChange={setFromEmail}>
          <SelectTrigger><SelectValue placeholder="Select mailbox…" /></SelectTrigger>
          <SelectContent>
            {mailboxes.map((mb) => (
              <SelectItem key={mb.email_address} value={mb.email_address}>{mb.email_address}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>To</Label>
        <Input value={to} onChange={(e) => setTo(e.target.value)} placeholder="customer@example.com, another@example.com" />
      </div>
      {variables.length > 0 && (
        <div className="space-y-3">
          <Label>Fill in placeholders</Label>
          {variables.map((v) => (
            <div key={v} className="space-y-1.5">
              <Label className="text-xs text-muted-foreground font-mono">{'{{' + v + '}}'}</Label>
              <Input value={values[v] ?? ''} onChange={(e) => setValues({ ...values, [v]: e.target.value })} />
            </div>
          ))}
        </div>
      )}
      <Button onClick={handleSubmit} disabled={isSending || !fromEmail || !to.trim()} className="w-full">
        {isSending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Send
      </Button>
    </div>
  );
}
