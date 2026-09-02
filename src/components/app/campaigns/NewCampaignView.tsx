'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { PlusCorners } from '@/components/app/console/PlusCorners';
import { TemplatePicker } from '@/components/app/campaigns/TemplatePicker';
import { HtmlBodyField } from '@/components/app/campaigns/HtmlBodyField';
import { cn } from '@/lib/utils';
import type { UserEmailAccount } from '@/lib/types/api.types';
import type { CampaignCreateInput } from '@/lib/hooks/useCampaigns';
import type { EmailTemplate } from '@/lib/hooks/useTemplates';

const MONO = "font-[family-name:var(--font-plex-mono)]";
const DISPLAY = "font-[family-name:var(--font-barlow-condensed)]";

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <div className={cn(MONO, 'text-[10px] tracking-[0.12em] text-console-muted2 mb-1.5')}>{children}</div>;
}

interface Props {
  mailboxes: UserEmailAccount[];
  templates: EmailTemplate[];
  isCreating: boolean;
  onCreate: (data: CampaignCreateInput) => void;
}

export default function NewCampaignView({ mailboxes, templates, isCreating, onCreate }: Props) {
  const [name, setName] = useState('');
  const [fromEmailChoice, setFromEmailChoice] = useState<string | null>(null);
  const [subject, setSubject] = useState('');
  const [bodyHtml, setBodyHtml] = useState('');

  const fromEmail = fromEmailChoice ?? mailboxes[0]?.email_address ?? '';
  const canCreate = name.trim() && fromEmail && subject.trim() && bodyHtml.trim();

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/app/campaigns">
          <button type="button" className="bg-transparent border border-console-border h-8 px-3 text-[12.5px] text-console-muted hover:border-console-accent hover:text-console-accent transition-colors">
            ← Campaigns
          </button>
        </Link>
      </div>

      <div>
        <div className={cn(MONO, 'text-[10px] tracking-[0.12em] text-console-muted2')}>NEW CAMPAIGN</div>
        <h1 className={cn(DISPLAY, 'font-semibold text-3xl sm:text-4xl leading-none mt-1')}>Name it and write the first send</h1>
        <div className="text-console-muted mt-1.5 max-w-[60ch]">You can add drip follow-up steps and a recipient segment after creating it.</div>
      </div>

      <div className="border border-console-border bg-white">
        <div className="px-5 py-4 border-b border-console-border">
          <div className={cn(MONO, 'text-[10px] tracking-[0.12em] text-console-muted2')}>STEP 1</div>
          <div className={cn(DISPLAY, 'font-semibold text-xl mt-0.5')}>Content</div>
          <div className="text-console-muted text-[13px] mt-0.5">This becomes step 1 of the sequence.</div>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <FieldLabel>Name</FieldLabel>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. October digest" />
          </div>
          <div>
            <FieldLabel>From</FieldLabel>
            <Select value={fromEmail} onValueChange={setFromEmailChoice}>
              <SelectTrigger><SelectValue placeholder="Select mailbox" /></SelectTrigger>
              <SelectContent>
                {mailboxes.map((m) => (
                  <SelectItem key={m.email_address} value={m.email_address}>{m.email_address}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <TemplatePicker
            templates={templates}
            onApply={(s, b) => { setSubject(s); setBodyHtml(b); }}
          />
          <div>
            <FieldLabel>Subject</FieldLabel>
            <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject line" />
          </div>
          <HtmlBodyField value={bodyHtml} onChange={setBodyHtml} minHeight={180} />
          <button
            type="button"
            disabled={!canCreate || isCreating}
            onClick={() => onCreate({ from_email: fromEmail, name, subject, body_html: bodyHtml })}
            className={cn('relative bg-console-accent text-white border-0 h-9 px-5 hover:bg-console-accent-dark transition-colors disabled:opacity-50', DISPLAY, 'font-semibold text-[15px] tracking-[0.04em] flex items-center gap-2')}
          >
            {isCreating && <Loader2 className="h-4 w-4 animate-spin" />}
            CREATE DRAFT
            <PlusCorners variant="all" />
          </button>
        </div>
      </div>
    </div>
  );
}
