'use client';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Palette, Loader2, Globe, Check, X, Trash2 } from 'lucide-react';
import type { Branding } from '@/lib/types/api.types';
import { useAuth } from '@/lib/context/auth.context';
import { ConfirmDialog, useAppToast } from '@/components/ui/app-toast';
import { useWebmailCustomDomain, useCreateWebmailCustomDomain, useDeleteWebmailCustomDomain } from '@/lib/hooks/useWebmailCustomDomain';

interface Props {
  branding: Branding | undefined;
  isLoading: boolean;
  isSaving: boolean;
  isClearing: boolean;
  onSave: (data: { brand_logo_url: string | null; brand_color: string | null; brand_name: string | null }) => void;
  onClear: () => void;
}

export default function BrandingView({ branding, isLoading, isSaving, isClearing, onSave, onClear }: Props) {
  const [logoUrl, setLogoUrl] = useState('');
  const [color, setColor] = useState('#6b7280');
  const [name, setName] = useState('');

  useEffect(() => {
    if (!branding) return;
    setLogoUrl(branding.brand_logo_url ?? '');
    setColor(branding.brand_color ?? '#6b7280');
    setName(branding.brand_name ?? '');
  }, [branding]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Custom Branding</h1>
        <p className="text-muted-foreground mt-1">
          Your own logo and color instead of Kerabie&apos;s, shown in the webmail app and on the footer of emails you send.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Palette className="h-4 w-4" /> Branding
          </CardTitle>
          <CardDescription>Premium feature — upgrade your plan to enable it.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!branding?.enabled ? (
            <div className="text-center py-8 text-muted-foreground">
              <Palette className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>Custom branding is a Premium feature.</p>
            </div>
          ) : (
            <>
              <div className="space-y-1.5">
                <Label>Brand Name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your Company" />
              </div>
              <div className="space-y-1.5">
                <Label>Logo URL</Label>
                <Input value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} placeholder="https://example.com/logo.png" />
              </div>
              <div className="space-y-1.5">
                <Label>Brand Color</Label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="h-10 w-14 rounded-lg border border-border cursor-pointer bg-transparent"
                  />
                  <Input value={color} onChange={(e) => setColor(e.target.value)} placeholder="#6b7280" className="max-w-[140px]" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  disabled={isSaving}
                  onClick={() => onSave({ brand_logo_url: logoUrl || null, brand_color: color || null, brand_name: name || null })}
                >
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save
                </Button>
                <Button variant="outline" disabled={isClearing} onClick={onClear}>
                  Clear
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <CustomDomainCard />
    </div>
  );
}

function CustomDomainCard() {
  const { token } = useAuth();
  const { success, error: toastError } = useAppToast();
  const { data: domain, isLoading } = useWebmailCustomDomain(token);
  const createDomain = useCreateWebmailCustomDomain(token);
  const deleteDomain = useDeleteWebmailCustomDomain(token);
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
    if (res.status === true) success('Custom domain removed');
    else toastError('Failed to remove domain');
  };

  if (isLoading) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Globe className="h-4 w-4" /> Custom webmail domain
        </CardTitle>
        <CardDescription>
          Enterprise feature — host webmail on your own domain (e.g. mail.yourcompany.com) instead of Kerabie&apos;s.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!domain?.enabled ? (
          <div className="text-center py-8 text-muted-foreground">
            <Globe className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>Custom webmail domains are an Enterprise (or hosting-partner) feature.</p>
          </div>
        ) : !domain.hostname ? (
          <div className="flex items-center gap-3">
            <Input value={hostname} onChange={(e) => setHostname(e.target.value)} placeholder="mail.yourcompany.com" className="max-w-xs" />
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
              {domain.status === 'failed' && (
                <span className="inline-flex items-center gap-1 text-xs text-destructive"><X className="h-3.5 w-3.5" /> Misconfigured</span>
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
        title="Remove custom domain?"
        description={`Webmail will stop being reachable at ${domain?.hostname ?? 'this domain'} immediately. It'll still work at the shared kerabie.email address.`}
        variant="warning"
        confirmLabel="Remove"
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </Card>
  );
}
