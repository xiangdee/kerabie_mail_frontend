'use client';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Trash2, Webhook, Loader2, Copy, Shield, X } from 'lucide-react';
import { format } from 'date-fns';
import type { WebhookEndpoint } from '@/lib/types/api.types';

// These match WEBHOOK_EVENTS in app/models/webhook.py exactly
const ALL_EVENTS = [
  { id: 'email.received',       label: 'Email received' },
  { id: 'email.sent',           label: 'Email sent' },
  { id: 'email.failed',         label: 'Email failed' },
  { id: 'email.opened',         label: 'Email opened' },
  { id: 'email.bounced',        label: 'Email bounced' },
  { id: 'email.spam_reported',  label: 'Spam reported' },
  { id: 'email.forwarded',      label: 'Email forwarded' },
  { id: 'mailbox.created',      label: 'Mailbox created' },
  { id: 'mailbox.deleted',      label: 'Mailbox deleted' },
  { id: 'mailbox.quota_reached',label: 'Quota reached' },
  { id: 'domain.verified',      label: 'Domain verified' },
  { id: 'domain.verification_failed', label: 'Domain verification failed' },
];

interface Props {
  webhooks: WebhookEndpoint[];
  isLoading: boolean;
  isCreating: boolean;
  isDeleting: boolean;
  isUpdating: boolean;
  onCreate: (data: { url: string; events: string[]; allowed_ips: string[] | null }) => void;
  onDelete: (id: number) => void;
  onToggle: (id: number, is_active: boolean) => void;
  onUpdateIps: (id: number, allowed_ips: string[] | null) => void;
}

export default function WebhooksView({
  webhooks, isLoading, isCreating, isDeleting, isUpdating,
  onCreate, onDelete, onToggle, onUpdateIps,
}: Props) {
  const [url, setUrl] = useState('');
  const [events, setEvents] = useState<string[]>(['email.received']);
  const [newIp, setNewIp] = useState('');
  const [allowedIps, setAllowedIps] = useState<string[]>([]);

  // Per-webhook IP editing state
  const [editingIpsFor, setEditingIpsFor] = useState<number | null>(null);
  const [editIpInput, setEditIpInput] = useState('');
  const [editIpList, setEditIpList] = useState<string[]>([]);

  const toggleEvent = (e: string) =>
    setEvents((prev) => prev.includes(e) ? prev.filter((x) => x !== e) : [...prev, e]);

  const addNewIp = () => {
    const trimmed = newIp.trim();
    if (trimmed && !allowedIps.includes(trimmed)) {
      setAllowedIps((prev) => [...prev, trimmed]);
    }
    setNewIp('');
  };

  const handleCreate = () => {
    if (!url.trim() || events.length === 0) return;
    onCreate({
      url: url.trim(),
      events,
      allowed_ips: allowedIps.length > 0 ? allowedIps : null,
    });
    setUrl('');
    setEvents(['email.received']);
    setAllowedIps([]);
  };

  const startEditIps = (wh: WebhookEndpoint) => {
    setEditingIpsFor(wh.id);
    setEditIpList(wh.allowed_ips ?? []);
    setEditIpInput('');
  };

  const addEditIp = () => {
    const trimmed = editIpInput.trim();
    if (trimmed && !editIpList.includes(trimmed)) {
      setEditIpList((prev) => [...prev, trimmed]);
    }
    setEditIpInput('');
  };

  const saveEditIps = (id: number) => {
    onUpdateIps(id, editIpList.length > 0 ? editIpList : null);
    setEditingIpsFor(null);
  };

  const copySecret = (secret: string) => navigator.clipboard.writeText(secret);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Webhooks</h1>
        <p className="text-muted-foreground mt-1">
          Receive real-time HTTP POST notifications when events occur.
        </p>
      </div>

      {/* Create */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Add Webhook</CardTitle>
          <CardDescription>We'll POST a signed JSON payload to your endpoint.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Endpoint URL</Label>
            <Input
              placeholder="https://your-app.com/webhooks/kerabie"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Events to listen for</Label>
            <div className="grid grid-cols-2 gap-2">
              {ALL_EVENTS.map(({ id, label }) => (
                <label key={id} className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={events.includes(id)}
                    onCheckedChange={() => toggleEvent(id)}
                  />
                  <span className="text-sm">{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* IP allowlist for new webhook */}
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5" />
              IP Allowlist <span className="text-xs text-muted-foreground font-normal">(optional — IPs or CIDRs, e.g. 1.2.3.4 or 10.0.0.0/8)</span>
            </Label>
            <div className="flex gap-2">
              <Input
                placeholder="203.0.113.0/24"
                value={newIp}
                onChange={(e) => setNewIp(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addNewIp())}
                className="flex-1"
              />
              <Button variant="outline" size="sm" onClick={addNewIp} disabled={!newIp.trim()}>
                Add
              </Button>
            </div>
            {allowedIps.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {allowedIps.map((ip) => (
                  <Badge key={ip} variant="secondary" className="gap-1 font-mono text-xs">
                    {ip}
                    <button onClick={() => setAllowedIps((p) => p.filter((x) => x !== ip))}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
            {allowedIps.length === 0 && (
              <p className="text-xs text-muted-foreground">No restrictions — all IPs accepted.</p>
            )}
          </div>

          <Button
            onClick={handleCreate}
            disabled={isCreating || !url.trim() || events.length === 0}
          >
            {isCreating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
            Add Webhook
          </Button>
        </CardContent>
      </Card>

      {/* List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Registered Endpoints</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
            </div>
          ) : webhooks.length === 0 ? (
            <div className="py-10 text-center text-muted-foreground">
              <Webhook className="h-10 w-10 mx-auto mb-3 opacity-20" />
              <p className="text-sm">No webhooks registered</p>
            </div>
          ) : (
            <div className="space-y-3">
              {webhooks.map((wh) => (
                <div key={wh.id} className="p-3 border border-border rounded-xl space-y-2">
                  <div className="flex items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium font-mono truncate">{wh.url}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Created {format(new Date(wh.created_at), 'PP')}
                      </p>
                    </div>
                    <Switch
                      checked={wh.is_active}
                      onCheckedChange={(v) => onToggle(wh.id, v)}
                      disabled={isUpdating}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive h-8 w-8 shrink-0"
                      onClick={() => onDelete(wh.id)}
                      disabled={isDeleting}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {wh.events.map((e) => (
                      <Badge key={e} variant="secondary" className="text-xs">{e}</Badge>
                    ))}
                  </div>

                  {wh.secret && (
                    <div className="flex items-center gap-2 bg-muted/50 rounded-lg px-2 py-1.5">
                      <span className="text-xs text-muted-foreground flex-1">
                        Signing secret: <span className="font-mono">{wh.secret.slice(0, 8)}…</span>
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => copySecret(wh.secret)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  )}

                  {/* IP Allowlist display / edit */}
                  {editingIpsFor === wh.id ? (
                    <div className="border border-border rounded-lg p-3 space-y-2 bg-muted/20">
                      <p className="text-xs font-medium flex items-center gap-1">
                        <Shield className="h-3 w-3" /> Edit IP Allowlist
                      </p>
                      <div className="flex gap-2">
                        <Input
                          placeholder="203.0.113.0/24"
                          value={editIpInput}
                          onChange={(e) => setEditIpInput(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addEditIp())}
                          className="flex-1 h-8 text-xs"
                        />
                        <Button variant="outline" size="sm" onClick={addEditIp} disabled={!editIpInput.trim()}>
                          Add
                        </Button>
                      </div>
                      {editIpList.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {editIpList.map((ip) => (
                            <Badge key={ip} variant="secondary" className="gap-1 font-mono text-xs">
                              {ip}
                              <button onClick={() => setEditIpList((p) => p.filter((x) => x !== ip))}>
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground">Empty — all IPs will be allowed.</p>
                      )}
                      <div className="flex gap-2 pt-1">
                        <Button size="sm" onClick={() => saveEditIps(wh.id)} disabled={isUpdating}>
                          {isUpdating && <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />}
                          Save
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditingIpsFor(null)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <button
                      className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                      onClick={() => startEditIps(wh)}
                    >
                      <Shield className="h-3 w-3" />
                      {wh.allowed_ips && wh.allowed_ips.length > 0
                        ? `IP allowlist: ${wh.allowed_ips.join(', ')}`
                        : 'No IP restrictions — click to add'}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
