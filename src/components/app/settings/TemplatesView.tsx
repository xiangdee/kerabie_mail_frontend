'use client';
import { useMemo, useState } from 'react';
import { Plus, Trash2, Pencil, Send, Loader2, FileText, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { STARTER_TEMPLATES } from '@/lib/constants/starterTemplates';
import type { EmailTemplate } from '@/lib/hooks/useTemplates';
import type { UserEmailAccount } from '@/lib/types/api.types';

// Every {{tag}} appearing in either field, in first-seen order, de-duped.
function extractVariables(subject: string | null, bodyHtml: string): string[] {
  const text = `${subject ?? ''} ${bodyHtml}`;
  const matches = [...text.matchAll(/\{\{(\w+)\}\}/g)].map((m) => m[1]);
  return [...new Set(matches)];
}

interface Props {
  templates: EmailTemplate[];
  mailboxes: UserEmailAccount[];
  isLoading: boolean;
  isSaving: boolean;
  isSending: boolean;
  onCreate: (data: { name: string; subject?: string; body_html: string }) => Promise<boolean>;
  onUpdate: (id: number, data: { name?: string; subject?: string; body_html?: string }) => Promise<boolean>;
  onDelete: (id: number) => void;
  onSend: (data: { from_email: string; to: string[]; template_id: number; variables: Record<string, string> }) => Promise<boolean>;
}

export default function TemplatesView({
  templates, mailboxes, isLoading, isSaving, isSending,
  onCreate, onUpdate, onDelete, onSend,
}: Props) {
  const [editing, setEditing] = useState<EmailTemplate | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [sendTarget, setSendTarget] = useState<EmailTemplate | null>(null);

  const [form, setForm] = useState({ name: '', subject: '', body_html: '' });

  const openBlank = () => { setForm({ name: '', subject: '', body_html: '' }); setCreateOpen(true); };
  const openStarter = (starterId: string) => {
    const s = STARTER_TEMPLATES.find((t) => t.id === starterId);
    if (!s) return;
    setForm({ name: s.label, subject: s.subject, body_html: s.body_html });
    setCreateOpen(true);
  };

  const handleCreate = async () => {
    if (!form.name.trim() || !form.body_html.trim()) return;
    const ok = await onCreate({ name: form.name.trim(), subject: form.subject.trim() || undefined, body_html: form.body_html });
    if (ok) setCreateOpen(false);
  };

  const handleUpdate = async () => {
    if (!editing) return;
    const ok = await onUpdate(editing.id, { name: form.name.trim(), subject: form.subject.trim(), body_html: form.body_html });
    if (ok) setEditing(null);
  };

  const openEdit = (t: EmailTemplate) => {
    setForm({ name: t.name, subject: t.subject ?? '', body_html: t.body_html });
    setEditing(t);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Email Templates</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Reusable HTML emails with <code className="text-xs bg-muted px-1 py-0.5 rounded">{'{{placeholders}}'}</code>{' '}
            — send them from here, from webmail compose, or via the API (see Settings → API Keys).
          </p>
        </div>
        <Dialog open={createOpen} onOpenChange={(o) => { setCreateOpen(o); if (o) openBlank(); }}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5">
              <Plus className="h-4 w-4" />
              New template
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-3xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>New template</DialogTitle>
            </DialogHeader>
            <TemplateForm form={form} setForm={setForm} showStarters onPickStarter={openStarter} />
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
              <Button onClick={handleCreate} disabled={isSaving || !form.name.trim() || !form.body_html.trim()}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save template
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
        </div>
      ) : templates.length === 0 ? (
        <Card className="p-12 text-center">
          <FileText className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground mb-4">No templates yet.</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {STARTER_TEMPLATES.map((s) => (
              <Button key={s.id} variant="outline" size="sm" className="gap-1.5" onClick={() => openStarter(s.id)}>
                <Sparkles className="h-3.5 w-3.5" />
                {s.label}
              </Button>
            ))}
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {templates.map((t) => (
            <Card key={t.id} className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{t.name}</p>
                {t.subject && <p className="text-xs text-muted-foreground truncate">{t.subject}</p>}
              </div>
              {t.is_shared && <Badge variant="outline" className="text-xs">Shared</Badge>}
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSendTarget(t)} title="Send">
                <Send className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(t)} title="Edit">
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive"
                onClick={() => onDelete(t.id)} title="Delete"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </Card>
          ))}
        </div>
      )}

      {/* Edit dialog */}
      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="sm:max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit template</DialogTitle>
          </DialogHeader>
          <TemplateForm form={form} setForm={setForm} />
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={handleUpdate} disabled={isSaving || !form.name.trim()}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Send dialog */}
      <Dialog open={!!sendTarget} onOpenChange={(o) => !o && setSendTarget(null)}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Send &quot;{sendTarget?.name}&quot;</DialogTitle>
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

function TemplateForm({
  form, setForm, showStarters, onPickStarter,
}: {
  form: { name: string; subject: string; body_html: string };
  setForm: (f: { name: string; subject: string; body_html: string }) => void;
  showStarters?: boolean;
  onPickStarter?: (id: string) => void;
}) {
  return (
    <div className="space-y-4 pt-2">
      {showStarters && (
        <div className="space-y-2">
          <Label>Start from a design</Label>
          <div className="grid sm:grid-cols-3 gap-2">
            {STARTER_TEMPLATES.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => onPickStarter?.(s.id)}
                className="text-left rounded-lg border p-3 hover:border-primary/50 hover:bg-primary/5 transition-colors"
              >
                <p className="text-sm font-medium flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5 text-primary" />{s.label}</p>
                <p className="text-xs text-muted-foreground mt-1">{s.description}</p>
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="space-y-2">
        <Label>Name</Label>
        <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Order Confirmation" />
      </div>
      <div className="space-y-2">
        <Label>Subject</Label>
        <Input
          value={form.subject}
          onChange={(e) => setForm({ ...form, subject: e.target.value })}
          placeholder="Your order {{order_id}} is confirmed"
        />
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>HTML body</Label>
          <Textarea
            value={form.body_html}
            onChange={(e) => setForm({ ...form, body_html: e.target.value })}
            className="font-mono text-xs min-h-[320px]"
            placeholder="<p>Hi {{first_name}}, ...</p>"
          />
        </div>
        <div className="space-y-2">
          <Label>Preview</Label>
          <div className="border rounded-lg overflow-hidden bg-white" style={{ height: 320 }}>
            <iframe title="Template preview" srcDoc={form.body_html} className="w-full h-full" sandbox="" />
          </div>
        </div>
      </div>
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
  const variables = useMemo(() => extractVariables(template.subject, template.body_html), [template]);
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
