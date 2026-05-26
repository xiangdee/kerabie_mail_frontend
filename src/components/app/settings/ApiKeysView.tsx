'use client';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Trash2, Key, Copy, Eye, EyeOff, Loader2, Shield, X } from 'lucide-react';
import { format } from 'date-fns';
import type { ApiKey } from '@/lib/types/api.types';

// These match VALID_SCOPES in app/routes/api_keys.py exactly
const ALL_SCOPES = [
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
  isCreating: boolean;
  isDeleting: boolean;
  isUpdating: boolean;
  newKeySecret?: string;
  onCreate: (data: { name: string; scopes: string[]; allowed_ips: string[] | null }) => void;
  onDelete: (id: number) => void;
  onUpdateIps: (id: number, allowed_ips: string[] | null) => void;
  onClearSecret: () => void;
}

export default function ApiKeysView({
  keys, isLoading, isCreating, isDeleting, isUpdating,
  newKeySecret, onCreate, onDelete, onUpdateIps, onClearSecret,
}: Props) {
  const [name, setName] = useState('');
  const [scopes, setScopes] = useState<string[]>(['send', 'mailboxes:read']);
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);

  // IP allowlist for new key
  const [newIp, setNewIp] = useState('');
  const [allowedIps, setAllowedIps] = useState<string[]>([]);

  // Per-key IP editing state
  const [editingIpsFor, setEditingIpsFor] = useState<number | null>(null);
  const [editIpInput, setEditIpInput] = useState('');
  const [editIpList, setEditIpList] = useState<string[]>([]);

  const toggleScope = (scope: string) =>
    setScopes((prev) => prev.includes(scope) ? prev.filter((s) => s !== scope) : [...prev, scope]);

  const addNewIp = () => {
    const trimmed = newIp.trim();
    if (trimmed && !allowedIps.includes(trimmed)) setAllowedIps((p) => [...p, trimmed]);
    setNewIp('');
  };

  const handleCreate = () => {
    if (!name.trim() || scopes.length === 0) return;
    onCreate({ name: name.trim(), scopes, allowed_ips: allowedIps.length > 0 ? allowedIps : null });
    setName('');
    setScopes(['send', 'mailboxes:read']);
    setAllowedIps([]);
  };

  const handleCopy = () => {
    if (!newKeySecret) return;
    navigator.clipboard.writeText(newKeySecret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const startEditIps = (k: ApiKey) => {
    setEditingIpsFor(k.id);
    setEditIpList(k.allowed_ips ?? []);
    setEditIpInput('');
  };

  const addEditIp = () => {
    const trimmed = editIpInput.trim();
    if (trimmed && !editIpList.includes(trimmed)) setEditIpList((p) => [...p, trimmed]);
    setEditIpInput('');
  };

  const saveEditIps = (id: number) => {
    onUpdateIps(id, editIpList.length > 0 ? editIpList : null);
    setEditingIpsFor(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">API Keys</h1>
        <p className="text-muted-foreground mt-1">
          Generate keys to access the Kerabie Mail API programmatically.
        </p>
      </div>

      {/* New Key Banner */}
      {newKeySecret && (
        <Card className="border-emerald-500/40 bg-emerald-50 dark:bg-emerald-950/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-emerald-700 dark:text-emerald-400">
              Key created — copy it now
            </CardTitle>
            <CardDescription>
              This key will not be shown again after you close this banner.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2 font-mono text-sm bg-background border border-border rounded-lg px-3 py-2">
              <span className="flex-1 truncate">
                {revealed ? newKeySecret : '•'.repeat(Math.min(newKeySecret.length, 40))}
              </span>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setRevealed(!revealed)}>
                {revealed ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleCopy}>
                <Copy className="h-3.5 w-3.5" />
              </Button>
            </div>
            {copied && <p className="text-xs text-emerald-600">Copied to clipboard!</p>}
            <Button variant="outline" size="sm" onClick={onClearSecret}>
              I've saved it, dismiss
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Create Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Create API Key</CardTitle>
          <CardDescription>Select the scopes this key will have access to.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Key name</Label>
            <Input
              placeholder="e.g., Production, CI/CD"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Scopes</Label>
            <div className="grid grid-cols-2 gap-2">
              {ALL_SCOPES.map(({ id, label }) => (
                <label key={id} className="flex items-center gap-2 cursor-pointer">
                  <Checkbox checked={scopes.includes(id)} onCheckedChange={() => toggleScope(id)} />
                  <span className="text-sm">{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* IP allowlist for new key */}
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5" />
              IP Allowlist <span className="text-xs text-muted-foreground font-normal">(optional — IPs or CIDRs)</span>
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
            {allowedIps.length > 0 ? (
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
            ) : (
              <p className="text-xs text-muted-foreground">No restrictions — all IPs accepted.</p>
            )}
          </div>

          <Button onClick={handleCreate} disabled={isCreating || !name.trim() || scopes.length === 0}>
            {isCreating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
            Generate Key
          </Button>
        </CardContent>
      </Card>

      {/* Keys List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Your API Keys</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
            </div>
          ) : keys.length === 0 ? (
            <div className="py-10 text-center text-muted-foreground">
              <Key className="h-10 w-10 mx-auto mb-3 opacity-20" />
              <p className="text-sm">No API keys yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {keys.map((k) => (
                <div key={k.id} className="p-3 border border-border rounded-xl space-y-2">
                  <div className="flex items-start gap-3">
                    <Key className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium">{k.name}</span>
                        <span className="font-mono text-xs text-muted-foreground">{k.key_prefix}…</span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {k.scopes.map((s) => (
                          <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1.5">
                        Created {format(new Date(k.created_at), 'PP')}
                        {k.last_used_at && ` · Last used ${format(new Date(k.last_used_at), 'PP')}`}
                        {k.expires_at && ` · Expires ${format(new Date(k.expires_at), 'PP')}`}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive h-8 w-8 shrink-0"
                      onClick={() => onDelete(k.id)}
                      disabled={isDeleting}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* IP Allowlist display / edit */}
                  {editingIpsFor === k.id ? (
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
                        <Button size="sm" onClick={() => saveEditIps(k.id)} disabled={isUpdating}>
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
                      onClick={() => startEditIps(k)}
                    >
                      <Shield className="h-3 w-3" />
                      {k.allowed_ips && k.allowed_ips.length > 0
                        ? `IP allowlist: ${k.allowed_ips.join(', ')}`
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
