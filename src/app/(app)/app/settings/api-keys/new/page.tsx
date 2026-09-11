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
import { useCreateApiKey } from '@/lib/hooks/useApiKeys';
import { ALL_SCOPES, IpListEditor, RevealSecretBanner } from '@/components/app/settings/ApiKeysView';
import { cn } from '@/lib/utils';

const MONO = "font-[family-name:var(--font-plex-mono)]";
const DISPLAY = "font-[family-name:var(--font-barlow-condensed)]";

export default function NewApiKeyPage() {
  const router = useRouter();
  const { token } = useAuth();
  const { success, error: toastError } = useAppToast();
  const createKey = useCreateApiKey(token);

  const [name, setName] = useState('');
  const [scopes, setScopes] = useState<string[]>(['send', 'mailboxes:read']);
  const [allowedIps, setAllowedIps] = useState<string[]>([]);
  const [blockedIps, setBlockedIps] = useState<string[]>([]);
  const [createdSecret, setCreatedSecret] = useState<string | null>(null);

  const toggleScope = (s: string) => setScopes((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);

  const handleSubmit = async () => {
    if (!name.trim() || scopes.length === 0) return;
    const res = await createKey.mutateAsync({
      name: name.trim(), scopes,
      allowed_ips: allowedIps.length ? allowedIps : null,
      blocked_ips: blockedIps.length ? blockedIps : null,
    });
    if (res.status === true) {
      const secret: string = res.response?.key ?? res.response?.api_key ?? '';
      setCreatedSecret(secret);
      success('API key created — copy it now');
    } else {
      toastError('Failed to create API key', { description: res.response?.detail });
    }
  };

  if (createdSecret) {
    return (
      <div className="max-w-2xl space-y-5">
        <div>
          <div className={cn(MONO, 'text-[10px] tracking-[0.12em] text-console-muted2')}>API KEYS</div>
          <h1 className={cn(DISPLAY, 'font-semibold text-3xl sm:text-4xl leading-none mt-1')}>Key created</h1>
        </div>
        <RevealSecretBanner label="Key" secret={createdSecret} onDismiss={() => router.push('/app/settings/api-keys')} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/app/settings/api-keys" className="text-sm text-console-muted2 hover:text-console-accent">← API keys</Link>
      </div>
      <div>
        <div className={cn(MONO, 'text-[10px] tracking-[0.12em] text-console-muted2')}>NEW API KEY</div>
        <h1 className={cn(DISPLAY, 'font-semibold text-3xl sm:text-4xl leading-none mt-1')}>Create API key</h1>
        <p className="text-console-muted mt-2 max-w-[70ch]">Select the scopes this key will have access to, and optionally restrict which IPs may use it.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 border-t border-console-border pt-6">
        <div className="space-y-6">
          <div className="space-y-1.5">
            <Label className={cn(MONO, 'text-[10px] tracking-[0.1em] text-console-muted2')}>KEY NAME</Label>
            <Input placeholder="e.g., Production, CI/CD" value={name} onChange={(e) => setName(e.target.value)} className="h-11 text-base" />
          </div>

          <div className="space-y-2.5">
            <Label className={cn(MONO, 'text-[10px] tracking-[0.1em] text-console-muted2')}>SCOPES</Label>
            <div className="border border-console-border divide-y divide-console-border-soft">
              {ALL_SCOPES.map(({ id, label }) => (
                <label key={id} className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-console-accent-tint transition-colors">
                  <Checkbox checked={scopes.includes(id)} onCheckedChange={() => toggleScope(id)} />
                  <span className="text-sm flex-1">{label}</span>
                  <span className={cn(MONO, 'text-[10px] text-console-muted3')}>{id}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="border border-console-border p-5 space-y-5">
            <IpListEditor label="IP allowlist" hint="optional — leave empty to allow all" ips={allowedIps} onChange={setAllowedIps} />
            <div className="border-t border-console-border-soft" />
            <IpListEditor label="IP blocklist" hint="optional — blocked even if also allowlisted" ips={blockedIps} onChange={setBlockedIps} />
          </div>
        </div>
      </div>

      <div className="border-t border-console-border pt-5">
        <button
          type="button" onClick={handleSubmit}
          disabled={createKey.isPending || !name.trim() || scopes.length === 0}
          className={cn('inline-flex items-center gap-2 bg-console-accent text-white border-0 h-10 px-6 hover:bg-console-accent-dark transition-colors disabled:opacity-50', DISPLAY, 'font-semibold text-[15px] tracking-[0.04em]')}
        >
          {createKey.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          GENERATE KEY
        </button>
      </div>
    </div>
  );
}
