'use client';
import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { extractTemplateVariables, fillTemplateVariables } from '@/lib/constants/templateDesigns';
import type { EmailTemplate } from '@/lib/hooks/useTemplates';

const MONO = "font-[family-name:var(--font-plex-mono)]";

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <div className={cn(MONO, 'text-[10px] tracking-[0.12em] text-console-muted2 mb-1.5')}>{children}</div>;
}

// Campaign sends only fill {{unsubscribe_url}} per recipient (app/tasks/campaigns.py)
// — every other {{var}} in a template goes out unresolved, identically to every
// recipient. So picking a template here has to collect real values up front
// (same pattern as the one-off template "Send" dialog) rather than pasting raw
// placeholders into the campaign body.
const AUTO_FILLED = new Set(['unsubscribe_url']);

interface Props {
  templates: EmailTemplate[];
  onApply: (subject: string, bodyHtml: string) => void;
}

export function TemplatePicker({ templates, onApply }: Props) {
  const [pending, setPending] = useState<EmailTemplate | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});

  if (templates.length === 0) return null;

  const vars = pending
    ? extractTemplateVariables(pending.subject, pending.body_html).filter((v) => !AUTO_FILLED.has(v))
    : [];

  const pickTemplate = (t: EmailTemplate) => {
    const tVars = extractTemplateVariables(t.subject, t.body_html).filter((v) => !AUTO_FILLED.has(v));
    if (tVars.length === 0) {
      onApply(t.subject ?? '', t.body_html);
      return;
    }
    setValues({});
    setPending(t);
  };

  const confirmFill = () => {
    if (!pending) return;
    onApply(fillTemplateVariables(pending.subject ?? '', values), fillTemplateVariables(pending.body_html, values));
    setPending(null);
  };

  return (
    <>
      <div>
        <FieldLabel>Start from a template (optional)</FieldLabel>
        <Select
          value=""
          onValueChange={(idStr) => {
            const t = templates.find((x) => String(x.id) === idStr);
            if (t) pickTemplate(t);
          }}
        >
          <SelectTrigger><SelectValue placeholder="Pick a saved template…" /></SelectTrigger>
          <SelectContent>
            {templates.map((t) => <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <div className="text-console-muted2 text-[12px] mt-1.5">
          Copies the subject and HTML in below — edit freely, or skip this and write your own HTML directly.
        </div>
      </div>

      <Dialog open={!!pending} onOpenChange={(o) => !o && setPending(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Fill in &ldquo;{pending?.name}&rdquo;&rsquo;s placeholders</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">
            Campaigns send the same content to every recipient — these values go out to everyone as typed, not
            per-contact. Leave anything recipient-specific blank rather than guessing.
          </p>
          <div className="space-y-3">
            {vars.map((v) => (
              <div key={v}>
                <FieldLabel>{'{{' + v + '}}'}</FieldLabel>
                <Input value={values[v] ?? ''} onChange={(e) => setValues({ ...values, [v]: e.target.value })} />
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setPending(null)}>Cancel</Button>
            <Button onClick={confirmFill}>Insert</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
