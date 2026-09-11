'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Trash2, Webhook, Loader2, Shield, Activity, RefreshCw, Send, RotateCw } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { PlusCorners } from '@/components/app/console/PlusCorners';
import { useAuth } from '@/lib/context/auth.context';
import { useAppToast } from '@/components/ui/app-toast';
import { useWebhookDeliveries, useRetryWebhookDelivery, useRotateWebhookSecret, useTestWebhook } from '@/lib/hooks/useWebhooks';
import { RevealSecretBanner, IpListEditor } from './ApiKeysView';
import type { WebhookEndpoint, WebhookDelivery } from '@/lib/types/api.types';

const MONO = "font-[family-name:var(--font-plex-mono)]";
const DISPLAY = "font-[family-name:var(--font-barlow-condensed)]";

interface Props {
  webhooks: WebhookEndpoint[];
  isLoading: boolean;
  isDeleting: boolean;
  isUpdating: boolean;
  onDelete: (id: number) => void;
  onToggle: (id: number, is_active: boolean) => void;
  onUpdateIps: (id: number, allowed_ips: string[] | null) => void;
}

export default function WebhooksView({
  webhooks, isLoading, isDeleting, isUpdating,
  onDelete, onToggle, onUpdateIps,
}: Props) {
  const [accessTarget, setAccessTarget] = useState<WebhookEndpoint | null>(null);
  const [deliveriesTarget, setDeliveriesTarget] = useState<WebhookEndpoint | null>(null);
  const [newSecret, setNewSecret] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64 rounded-none" />
        <Skeleton className="h-40 rounded-none" />
      </div>
    );
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="flex items-end gap-4 flex-wrap">
        <div>
          <h1 className={cn(DISPLAY, 'font-semibold text-3xl sm:text-4xl leading-none')}>Webhooks</h1>
          <div className="text-console-muted mt-1.5 max-w-[70ch]">
            Receive real-time HTTP POST notifications when events occur.
          </div>
        </div>
        <div className="flex-1" />
        <Link
          href="/app/settings/webhooks/new"
          className={cn('relative inline-block bg-console-accent text-white border-0 h-9 px-5 leading-9 hover:bg-console-accent-dark transition-colors', DISPLAY, 'font-semibold text-[15px] tracking-[0.04em]')}
        >
          + ADD WEBHOOK
          <PlusCorners variant="all" />
        </Link>
      </div>

      {newSecret && <RevealSecretBanner label="New signing secret" secret={newSecret} onDismiss={() => setNewSecret(null)} />}

      {webhooks.length === 0 ? (
        <div className="border border-console-border bg-white p-12 text-center">
          <Webhook className="h-10 w-10 mx-auto mb-3 text-console-muted2" />
          <p className="text-sm text-console-muted">No webhooks registered.</p>
        </div>
      ) : (
        <div className="border border-console-border bg-white divide-y divide-console-border-soft">
          {webhooks.map((wh) => (
            <div key={wh.id} className="p-4 space-y-2">
              <div className="flex items-start gap-3">
                <Webhook className="h-4 w-4 mt-1 text-console-muted2 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className={cn(MONO, 'text-sm font-medium truncate')}>{wh.url}</p>
                  <p className={cn(MONO, 'text-[10.5px] text-console-muted2 mt-1 tracking-[0.02em]')}>
                    CREATED {format(new Date(wh.created_at), 'PP').toUpperCase()}
                  </p>
                </div>
                <Switch checked={wh.is_active} onCheckedChange={(v) => onToggle(wh.id, v)} disabled={isUpdating} />
                <Button variant="ghost" size="icon" className="text-destructive h-8 w-8 shrink-0" onClick={() => onDelete(wh.id)} disabled={isDeleting}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-1 pl-7">
                {wh.events.map((e) => <Badge key={e} variant="secondary" className="text-xs">{e}</Badge>)}
              </div>
              <div className="flex items-center gap-3 pl-7 flex-wrap">
                <button onClick={() => setAccessTarget(wh)} className="flex items-center gap-1.5 text-xs text-console-muted hover:text-console-accent transition-colors">
                  <Shield className="h-3 w-3" />
                  {wh.allowed_ips?.length ? 'Access rules set' : 'No IP restrictions'}
                </button>
                <button onClick={() => setDeliveriesTarget(wh)} className="flex items-center gap-1.5 text-xs text-console-muted hover:text-console-accent transition-colors">
                  <Activity className="h-3 w-3" /> Deliveries
                </button>
                <RegenerateSecretButton webhook={wh} onRegenerated={setNewSecret} />
              </div>
            </div>
          ))}
        </div>
      )}

      {accessTarget && (
        <ManageWebhookAccessDialog
          webhook={accessTarget} isUpdating={isUpdating}
          onClose={() => setAccessTarget(null)}
          onSave={(allowed) => { onUpdateIps(accessTarget.id, allowed); setAccessTarget(null); }}
        />
      )}
      {deliveriesTarget && <DeliveriesDialog webhook={deliveriesTarget} onClose={() => setDeliveriesTarget(null)} />}
    </div>
  );
}

// ── Manage access dialog (allowlist only — see plan notes on why no blocklist) ─
function ManageWebhookAccessDialog({
  webhook, isUpdating, onClose, onSave,
}: {
  webhook: WebhookEndpoint; isUpdating: boolean; onClose: () => void;
  onSave: (allowed: string[] | null) => void;
}) {
  const [allowedIps, setAllowedIps] = useState<string[]>(webhook.allowed_ips ?? []);
  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Manage access</DialogTitle>
          <DialogDescription className="font-mono text-xs">{webhook.url}</DialogDescription>
        </DialogHeader>
        <IpListEditor label="IP allowlist" hint="empty = deliver regardless of resolved destination IP" ips={allowedIps} onChange={setAllowedIps} />
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={() => onSave(allowedIps.length ? allowedIps : null)} disabled={isUpdating}>
            {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Regenerate secret ────────────────────────────────────────────────────────
function RegenerateSecretButton({ webhook, onRegenerated }: { webhook: WebhookEndpoint; onRegenerated: (secret: string) => void }) {
  const { token } = useAuth();
  const { error: toastError } = useAppToast();
  const rotate = useRotateWebhookSecret(token);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleConfirm = async () => {
    const res = await rotate.mutateAsync(webhook.id);
    setConfirmOpen(false);
    if (res.status === true) onRegenerated(res.response.secret);
    else toastError('Failed to regenerate secret');
  };

  return (
    <>
      <button onClick={() => setConfirmOpen(true)} className="flex items-center gap-1.5 text-xs text-console-muted hover:text-console-accent transition-colors">
        <RotateCw className="h-3 w-3" /> Regenerate secret
      </button>
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Regenerate signing secret?</DialogTitle>
            <DialogDescription>
              The old secret stops verifying immediately — any deliveries already in flight, signed with it, will fail signature checks on your end.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setConfirmOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleConfirm} disabled={rotate.isPending}>
              {rotate.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Regenerate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ── Deliveries dialog ────────────────────────────────────────────────────────
const STATUS_COLOR: Record<string, string> = {
  delivered: 'text-emerald-600', pending: 'text-console-muted', dead: 'text-destructive', failed: 'text-destructive',
};

function DeliveriesDialog({ webhook, onClose }: { webhook: WebhookEndpoint; onClose: () => void }) {
  const { token } = useAuth();
  const { success, error: toastError } = useAppToast();
  const { data: deliveries = [], isLoading } = useWebhookDeliveries(token, webhook.id);
  const retry = useRetryWebhookDelivery(token);
  const test = useTestWebhook(token);

  const handleRetry = async (d: WebhookDelivery) => {
    const res = await retry.mutateAsync({ endpointId: webhook.id, deliveryId: d.id });
    if (res.status === true) success('Delivery re-queued');
    else toastError('Failed to retry delivery', { description: res.response?.detail });
  };

  const handleTest = async () => {
    const res = await test.mutateAsync(webhook.id);
    if (res.status === true) success('Test event dispatched');
    else toastError('Failed to send test event');
  };

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Deliveries</DialogTitle>
          <DialogDescription className="font-mono text-xs">{webhook.url}</DialogDescription>
        </DialogHeader>
        <Button variant="outline" size="sm" onClick={handleTest} disabled={test.isPending} className="w-fit">
          {test.isPending ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : <Send className="mr-2 h-3.5 w-3.5" />}
          Send test event
        </Button>
        {isLoading ? (
          <Skeleton className="h-32 rounded-none" />
        ) : deliveries.length === 0 ? (
          <p className="text-sm text-console-muted py-6 text-center">No deliveries yet.</p>
        ) : (
          <div className="border border-console-border divide-y divide-console-border-soft">
            {deliveries.map((d) => (
              <div key={d.id} className="p-3 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={cn(MONO, 'text-xs')}>{d.event}</span>
                    <span className={cn(MONO, 'text-[10px] uppercase tracking-[0.06em]', STATUS_COLOR[d.status] ?? 'text-console-muted')}>{d.status}</span>
                  </div>
                  <p className="text-xs text-console-muted2 mt-0.5">
                    {d.attempts} attempt{d.attempts === 1 ? '' : 's'}
                    {d.response_status != null && ` · HTTP ${d.response_status}`}
                    {' · '}{format(new Date(d.created_at), 'PPp')}
                  </p>
                </div>
                {(d.status === 'dead' || d.status === 'failed') && (
                  <Button variant="outline" size="sm" onClick={() => handleRetry(d)} disabled={retry.isPending}>
                    <RefreshCw className="h-3 w-3 mr-1.5" /> Retry
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
