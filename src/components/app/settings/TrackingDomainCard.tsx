'use client';
import { useState } from 'react';
import { Globe, Check, X, Loader2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useAuth } from '@/lib/context/auth.context';
import { useAppToast, ConfirmDialog } from '@/components/ui/app-toast';
import { useTrackingDomain, useCreateTrackingDomain, useDeleteTrackingDomain } from '@/lib/hooks/useTrackingDomain';

// Mirrors BrandingView.tsx's CustomDomainCard (the webmail custom-domain
// equivalent) — same DNS-verification shape, same "verified means Caddy
// will issue the real cert lazily on first use" backend behavior.
export default function TrackingDomainCard() {
  const { token } = useAuth();
  const { success, error: toastError } = useAppToast();
  const { data: domain, isLoading } = useTrackingDomain(token);
  const createDomain = useCreateTrackingDomain(token);
  const deleteDomain = useDeleteTrackingDomain(token);
  const [hostname, setHostname] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  const records: Array<{ type: string; name?: string; domain?: string; value: string }> = (() => {
    if (!domain?.verification_records) return [];
    try { return JSON.parse(domain.verification_records); } catch { return []; }
  })();

  const handleCreate = async () => {
    if (!hostname.trim()) return;
    const res = await createDomain.mutateAsync(hostname.trim());
    if (res.status === true) {
      success('Domain added — add the DNS record below to verify it');
      setHostname('');
    } else {
      toastError('Failed to add domain', { description: typeof res.response === 'string' ? res.response : (res.response as { detail?: string })?.detail });
    }
  };

  const handleDelete = async () => {
    setConfirmDelete(false);
    const res = await deleteDomain.mutateAsync();
    if (res.status === true) success('Tracking domain removed');
    else toastError('Failed to remove domain');
  };

  if (isLoading) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Globe className="h-4 w-4" /> Branded tracking domain
        </CardTitle>
        <CardDescription>
          Enterprise feature — serve open/click tracking from your own domain (e.g. track.yourcompany.com) instead of Kerabie&apos;s, so recipients and link previews see your brand.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!domain?.enabled ? (
          <div className="text-center py-8 text-muted-foreground">
            <Globe className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>Branded tracking domains are an Enterprise feature.</p>
          </div>
        ) : !domain.hostname ? (
          <div className="flex items-center gap-3">
            <Input value={hostname} onChange={(e) => setHostname(e.target.value)} placeholder="track.yourcompany.com" className="max-w-xs" />
            <Button disabled={createDomain.isPending || !hostname.trim()} onClick={handleCreate}>
              {createDomain.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add domain
            </Button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm">{domain.hostname}</span>
              {domain.status === 'verified' && (
                <span className="inline-flex items-center gap-1 text-xs text-green-600"><Check className="h-3.5 w-3.5" /> Verified</span>
              )}
              {domain.status === 'pending' && (
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><Loader2 className="h-3.5 w-3.5 animate-spin" /> Waiting for DNS…</span>
              )}
            </div>

            {domain.status !== 'verified' && records.length > 0 && (
              <div className="rounded-lg border border-border bg-muted/50 p-3 space-y-2">
                <p className="text-xs text-muted-foreground">Add this DNS record at your domain registrar, then wait a few minutes:</p>
                {records.map((r, i) => (
                  <div key={i} className="font-mono text-xs grid grid-cols-[60px_1fr] gap-x-2">
                    <span className="text-muted-foreground">{r.type}</span>
                    <span className="break-all">{r.name ?? r.domain} → {r.value}</span>
                  </div>
                ))}
              </div>
            )}

            <Button variant="outline" size="sm" disabled={deleteDomain.isPending} onClick={() => setConfirmDelete(true)}>
              {deleteDomain.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
              Remove domain
            </Button>
          </>
        )}
      </CardContent>

      <ConfirmDialog
        open={confirmDelete}
        title="Remove tracking domain?"
        description={`Tracking links will fall back to Kerabie's shared domain immediately.`}
        variant="warning"
        confirmLabel="Remove"
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </Card>
  );
}
