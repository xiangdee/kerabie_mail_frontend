'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Trash2, Key, Copy, Eye, EyeOff, Loader2, Shield, X, BarChart3 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { PlusCorners } from '@/components/app/console/PlusCorners';
import { useAuth } from '@/lib/context/auth.context';
import { useApiKeyUsage } from '@/lib/hooks/useApiKeys';
import type { ApiKey } from '@/lib/types/api.types';

const MONO = "font-[family-name:var(--font-plex-mono)]";
const DISPLAY = "font-[family-name:var(--font-barlow-condensed)]";

export const ALL_SCOPES = [
  { id: 'send',             label: 'Send email' },
  { id: 'mailboxes:read',   label: 'Read mailboxes' },
  { id: 'mailboxes:write',  label: 'Write mailboxes' },
  { id: 'domains:read',     label: 'Read domains' },
  { id: 'domains:write',    label: 'Write domains' },
  { id: 'webhooks',         label: 'Manage webhooks' },
  { id: 'contacts:read',    label: 'Read contacts' },
  { id: 'contacts:write',   label: 'Write contacts' },
];

interface Props {
  keys: ApiKey[];
  isLoading: boolean;
  isDeleting: boolean;
  isUpdating: boolean;
  onDelete: (id: number) => void;
  onUpdateIps: (id: number, allowed_ips: string[] | null, blocked_ips: string[] | null) => void;
}

export default function ApiKeysView({
  keys, isLoading, isDeleting, isUpdating, onDelete, onUpdateIps,
}: Props) {
  const [accessTarget, setAccessTarget] = useState<ApiKey | null>(null);
  const [usageTarget, setUsageTarget] = useState<ApiKey | null>(null);

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
          <h1 className={cn(DISPLAY, 'font-semibold text-3xl sm:text-4xl leading-none')}>API keys</h1>
          <div className="text-console-muted mt-1.5 max-w-[70ch]">
            Generate keys to access the Kerabie Mail API programmatically.
          </div>
        </div>
        <div className="flex-1" />
        <Link
          href="/app/settings/api-keys/new"
          className={cn('relative inline-block bg-console-accent text-white border-0 h-9 px-5 leading-9 hover:bg-console-accent-dark transition-colors', DISPLAY, 'font-semibold text-[15px] tracking-[0.04em]')}
        >
          + NEW KEY
          <PlusCorners variant="all" />
        </Link>
      </div>

      {keys.length === 0 ? (
        <div className="border border-console-border bg-white p-12 text-center">
          <Key className="h-10 w-10 mx-auto mb-3 text-console-muted2" />
          <p className="text-sm text-console-muted">No API keys yet.</p>
        </div>
      ) : (
        <div className="border border-console-border bg-white divide-y divide-console-border-soft">
          {keys.map((k) => (
            <div key={k.id} className="p-4 flex items-start gap-3">
              <Key className="h-4 w-4 mt-1 text-console-muted2 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium">{k.name}</span>
                  <span className={cn(MONO, 'text-xs text-console-muted2')}>{k.key_prefix}…</span>
                  {!k.is_active && <Badge variant="secondary" className="text-xs">Revoked</Badge>}
                </div>
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {k.scopes.map((s) => <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>)}
                </div>
                <p className={cn(MONO, 'text-[10.5px] text-console-muted2 mt-1.5 tracking-[0.02em]')}>
                  CREATED {format(new Date(k.created_at), 'PP').toUpperCase()}
                  {k.last_used_at && ` · LAST USED ${format(new Date(k.last_used_at), 'PP').toUpperCase()}`}
                  {k.expires_at && ` · EXPIRES ${format(new Date(k.expires_at), 'PP').toUpperCase()}`}
                </p>
                <div className="flex items-center gap-3 mt-2">
                  <button onClick={() => setAccessTarget(k)} className="flex items-center gap-1.5 text-xs text-console-muted hover:text-console-accent transition-colors">
                    <Shield className="h-3 w-3" />
                    {(k.allowed_ips?.length || k.blocked_ips?.length) ? 'Access rules set' : 'No IP restrictions'}
                  </button>
                  <button onClick={() => setUsageTarget(k)} className="flex items-center gap-1.5 text-xs text-console-muted hover:text-console-accent transition-colors">
                    <BarChart3 className="h-3 w-3" /> Usage
                  </button>
                </div>
              </div>
              {k.is_active && (
                <Button variant="ghost" size="icon" className="text-destructive h-8 w-8 shrink-0" onClick={() => onDelete(k.id)} disabled={isDeleting}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      {accessTarget && (
        <ManageAccessDialog
          apiKey={accessTarget} isUpdating={isUpdating}
          onClose={() => setAccessTarget(null)}
          onSave={(allowed, blocked) => { onUpdateIps(accessTarget.id, allowed, blocked); setAccessTarget(null); }}
        />
      )}
      {usageTarget && <UsageDialog apiKey={usageTarget} onClose={() => setUsageTarget(null)} />}
    </div>
  );
}

// ── Reveal-once secret banner (shared shape for keys + webhook secrets) ────────
export function RevealSecretBanner({ label, secret, onDismiss }: { label: string; secret: string; onDismiss: () => void }) {
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="border border-emerald-500/40 bg-emerald-50 dark:bg-emerald-950/20 p-4 space-y-3">
      <div>
        <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">{label} — copy it now</p>
        <p className="text-xs text-emerald-700/80 dark:text-emerald-400/80 mt-0.5">This will not be shown again after you close this.</p>
      </div>
      <div className={cn(MONO, 'flex items-center gap-2 text-sm bg-white border border-console-border px-3 py-2')}>
        <span className="flex-1 truncate">{revealed ? secret : '•'.repeat(Math.min(secret.length, 40))}</span>
        <button onClick={() => setRevealed(!revealed)} className="text-console-muted2 hover:text-console-accent">
          {revealed ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
        </button>
        <button onClick={handleCopy} className="text-console-muted2 hover:text-console-accent">
          <Copy className="h-3.5 w-3.5" />
        </button>
      </div>
      {copied && <p className="text-xs text-emerald-600">Copied to clipboard!</p>}
      <Button variant="outline" size="sm" onClick={onDismiss}>I've saved it, dismiss</Button>
    </div>
  );
}

// ── Manage access (allow + block) dialog ────────────────────────────────────
function ManageAccessDialog({
  apiKey, isUpdating, onClose, onSave,
}: {
  apiKey: ApiKey; isUpdating: boolean; onClose: () => void;
  onSave: (allowed: string[] | null, blocked: string[] | null) => void;
}) {
  const [allowedIps, setAllowedIps] = useState<string[]>(apiKey.allowed_ips ?? []);
  const [blockedIps, setBlockedIps] = useState<string[]>(apiKey.blocked_ips ?? []);

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Manage access — {apiKey.name}</DialogTitle>
          <DialogDescription>Restrict which IPs can use this key.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <IpListEditor label="IP allowlist" hint="empty = all IPs allowed" ips={allowedIps} onChange={setAllowedIps} />
          <IpListEditor label="IP blocklist" hint="checked first — wins over the allowlist" ips={blockedIps} onChange={setBlockedIps} />
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={() => onSave(allowedIps.length ? allowedIps : null, blockedIps.length ? blockedIps : null)} disabled={isUpdating}>
            {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Shared IP list editor (used by both dialogs, and by WebhooksView) ──────────
export function IpListEditor({ label, hint, ips, onChange }: { label: string; hint: string; ips: string[]; onChange: (ips: string[]) => void }) {
  const [input, setInput] = useState('');
  const add = () => {
    const trimmed = input.trim();
    if (trimmed && !ips.includes(trimmed)) onChange([...ips, trimmed]);
    setInput('');
  };
  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-1.5">
        <Shield className="h-3.5 w-3.5" />
        {label} <span className="text-xs text-console-muted2 font-normal">({hint})</span>
      </Label>
      <div className="flex gap-2">
        <Input
          placeholder="203.0.113.0/24" value={input} onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), add())} className="flex-1"
        />
        <Button variant="outline" size="sm" onClick={add} disabled={!input.trim()}>Add</Button>
      </div>
      {ips.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {ips.map((ip) => (
            <Badge key={ip} variant="secondary" className="gap-1 font-mono text-xs">
              {ip}
              <button onClick={() => onChange(ips.filter((x) => x !== ip))}><X className="h-3 w-3" /></button>
            </Badge>
          ))}
        </div>
      ) : (
        <p className="text-xs text-console-muted2">None set.</p>
      )}
    </div>
  );
}

// ── Usage dialog ─────────────────────────────────────────────────────────────
function UsageDialog({ apiKey, onClose }: { apiKey: ApiKey; onClose: () => void }) {
  const { token } = useAuth();
  const { data: usage, isLoading } = useApiKeyUsage(token, apiKey.id);

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Usage — {apiKey.name}</DialogTitle>
          <DialogDescription>Requests made with this key.</DialogDescription>
        </DialogHeader>
        {isLoading ? (
          <Skeleton className="h-24 rounded-none" />
        ) : !usage ? (
          <p className="text-sm text-console-muted">No usage data yet.</p>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'TODAY', value: usage.today },
              { label: 'LAST 7 DAYS', value: usage.last_7_days },
              { label: 'LAST 30 DAYS', value: usage.last_30_days },
            ].map(({ label, value }) => (
              <div key={label} className="border border-console-border p-3 text-center">
                <div className={cn(DISPLAY, 'text-2xl font-semibold')}>{value.toLocaleString()}</div>
                <div className={cn(MONO, 'text-[9.5px] text-console-muted2 tracking-[0.08em] mt-1')}>{label}</div>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
