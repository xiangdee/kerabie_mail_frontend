'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/lib/context/auth.context';
import { useAppToast } from '@/components/ui/app-toast';
import { useCreateWebhook, useWebhookEvents } from '@/lib/hooks/useWebhooks';
import { IpListEditor } from '@/components/app/settings/ApiKeysView';
import { cn } from '@/lib/utils';

const MONO = "font-[family-name:var(--font-plex-mono)]";
const DISPLAY = "font-[family-name:var(--font-barlow-condensed)]";

const FALLBACK_EVENTS = ['email.received', 'email.sent', 'email.failed', 'email.opened', 'email.bounced', 'email.spam_reported', 'email.forwarded', 'mailbox.created', 'mailbox.deleted', 'mailbox.quota_reached', 'domain.verified', 'domain.verification_failed'];

export default function NewWebhookPage() {
  const router = useRouter();
  const { token } = useAuth();
  const { success, error: toastError } = useAppToast();
  const createWebhook = useCreateWebhook(token);
  const { data: events = [] } = useWebhookEvents();
  const eventList = events.length ? events : FALLBACK_EVENTS;

  const [url, setUrl] = useState('');
  const [selected, setSelected] = useState<string[]>(['email.received']);
  const [allowedIps, setAllowedIps] = useState<string[]>([]);

  const toggle = (e: string) => setSelected((prev) => prev.includes(e) ? prev.filter((x) => x !== e) : [...prev, e]);

  const handleSubmit = async () => {
    if (!url.trim() || selected.length === 0) return;
    const res = await createWebhook.mutateAsync({ url: url.trim(), events: selected, allowed_ips: allowedIps.length ? allowedIps : null });
    if (res.status === true) {
      success('Webhook registered');
      router.push('/app/settings/webhooks');
    } else {
      toastError('Failed to register webhook', { description: res.response?.detail });
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/app/settings/webhooks" className="text-sm text-console-muted2 hover:text-console-accent">← Webhooks</Link>
      </div>
      <div>
        <div className={cn(MONO, 'text-[10px] tracking-[0.12em] text-console-muted2')}>NEW WEBHOOK</div>
        <h1 className={cn(DISPLAY, 'font-semibold text-3xl sm:text-4xl leading-none mt-1')}>Add webhook</h1>
        <p className="text-console-muted mt-2 max-w-[70ch]">We&apos;ll POST a signed JSON payload to your endpoint for every event you select.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 border-t border-console-border pt-6">
        <div className="space-y-6">
          <div className="space-y-1.5">
            <Label className={cn(MONO, 'text-[10px] tracking-[0.1em] text-console-muted2')}>ENDPOINT URL</Label>
            <Input placeholder="https://your-app.com/webhooks/kerabie" type="url" value={url} onChange={(e) => setUrl(e.target.value)} className="h-11 text-base font-mono text-sm" />
          </div>

          <div className="border border-console-border p-5">
            <IpListEditor label="IP allowlist" hint="optional — restricts which destination IP this endpoint may resolve to" ips={allowedIps} onChange={setAllowedIps} />
          </div>
        </div>

        <div className="space-y-2.5">
          <Label className={cn(MONO, 'text-[10px] tracking-[0.1em] text-console-muted2')}>EVENTS TO LISTEN FOR</Label>
          <div className="border border-console-border divide-y divide-console-border-soft max-h-[420px] overflow-y-auto">
            {eventList.map((id) => (
              <label key={id} className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-console-accent-tint transition-colors">
                <Checkbox checked={selected.includes(id)} onCheckedChange={() => toggle(id)} />
                <span className={cn(MONO, 'text-xs flex-1')}>{id}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-console-border pt-5">
        <button
          type="button" onClick={handleSubmit}
          disabled={createWebhook.isPending || !url.trim() || selected.length === 0}
          className={cn('inline-flex items-center gap-2 bg-console-accent text-white border-0 h-10 px-6 hover:bg-console-accent-dark transition-colors disabled:opacity-50', DISPLAY, 'font-semibold text-[15px] tracking-[0.04em]')}
        >
          {createWebhook.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          ADD WEBHOOK
        </button>
      </div>
    </div>
  );
}
