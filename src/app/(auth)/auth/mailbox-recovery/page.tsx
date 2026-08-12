'use client';
import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { ArrowLeft, Copy, CopyCheck, Loader2, MailCheck, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { mailPasswordService } from '@/lib/services/mail-password.service';

type Step =
  | 'enter-email'
  | 'sent-to-alternate'
  | 'dns-instructions'
  | 'recovery-email'
  | 'done';

interface DnsRecord {
  type: string;
  host: string;
  value: string;
  ttl: string;
}

export default function MailboxRecoveryPage() {
  return (
    <Suspense>
      <MailboxRecoveryFlow />
    </Suspense>
  );
}

function MailboxRecoveryFlow() {
  const params = useSearchParams();

  const [step, setStep] = useState<Step>('enter-email');
  const [email, setEmail] = useState(params.get('email') ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [maskedEmail, setMaskedEmail] = useState('');
  const [dnsRecord, setDnsRecord] = useState<DnsRecord | null>(null);
  const [dnsToken, setDnsToken] = useState('');
  const [copied, setCopied] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [expiresAt, setExpiresAt] = useState<string | null>(null);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await mailPasswordService.requestReset(email);
    setLoading(false);

    if (res.status !== true) {
      setError(typeof res.response === 'string' ? res.response : 'Something went wrong. Please try again.');
      return;
    }

    const data = res.response;
    if (data.method === 'alternate_email') {
      setMaskedEmail(data.masked_email ?? '');
      setStep('sent-to-alternate');
    } else if (data.method === 'dns_verification') {
      const record = data.dns_record as DnsRecord;
      // value looks like "kerabie-reset=<token>" — the raw token is what
      // set-recovery-email needs later, the full string is what goes in DNS.
      const token = record.value.split('=').slice(1).join('=');
      setDnsRecord(record);
      setDnsToken(token);
      setStep('dns-instructions');
    } else {
      setError('Unexpected response from server. Please try again.');
    }
  };

  const handleVerifyDns = async () => {
    setError(null);
    setLoading(true);
    const res = await mailPasswordService.verifyDnsReset(email);
    setLoading(false);

    if (res.status !== true) {
      setError(typeof res.response === 'string' ? res.response : 'Verification failed. Please try again.');
      return;
    }

    if (res.response.verified) {
      setStep('recovery-email');
    } else {
      toast.error('DNS record not found yet — it can take a few minutes to propagate. Try again shortly.');
    }
  };

  const handleSetRecoveryEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await mailPasswordService.setRecoveryEmail(email, recoveryEmail, dnsToken);
    setLoading(false);

    if (res.status !== true) {
      setError(typeof res.response === 'string' ? res.response : 'Something went wrong. Please try again.');
      return;
    }

    setExpiresAt(res.response.expires_at ?? null);
    setStep('done');
  };

  const copyRecord = () => {
    if (!dnsRecord) return;
    navigator.clipboard.writeText(dnsRecord.value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ── Step: enter email ──────────────────────────────────────────────────
  if (step === 'enter-email') {
    return (
      <div className="space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Recover mailbox access</h1>
          <p className="text-sm text-muted-foreground">
            For custom-domain mailboxes you can&apos;t sign in to and can&apos;t receive mail at.
            We&apos;ll verify you own the domain via a DNS record, or send a link to your
            recovery email if you set one up.
          </p>
        </div>

        <form onSubmit={handleRequestReset} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Mailbox address</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@yourdomain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Continue
          </Button>
        </form>

        <Link href="/auth/forgot-password" className="flex items-center justify-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3 w-3" /> Back to password reset
        </Link>
      </div>
    );
  }

  // ── Step: sent to pre-configured alternate email ───────────────────────
  if (step === 'sent-to-alternate') {
    return (
      <div className="space-y-6 text-center">
        <div className="flex justify-center">
          <div className="rounded-full bg-primary/10 p-4">
            <MailCheck className="h-8 w-8 text-primary" />
          </div>
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Check your alternate email</h1>
          <p className="text-sm text-muted-foreground">
            A reset link was sent to <strong>{maskedEmail}</strong>, the recovery address on file
            for this mailbox. The link expires in 3 hours.
          </p>
        </div>
        <Link href="/auth/login" className="flex items-center justify-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3 w-3" /> Back to sign in
        </Link>
      </div>
    );
  }

  // ── Step: show DNS TXT record to add ────────────────────────────────────
  if (step === 'dns-instructions' && dnsRecord) {
    return (
      <div className="space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Prove domain ownership</h1>
          <p className="text-sm text-muted-foreground">
            No recovery email is on file for <strong>{email}</strong>. Add this TXT record to
            your domain&apos;s DNS to prove you control it.
          </p>
        </div>

        <div className="rounded-lg border bg-muted/40 p-4 space-y-3">
          <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
            <span className="text-muted-foreground">Type</span>
            <span className="font-mono">{dnsRecord.type}</span>
            <span className="text-muted-foreground">Host</span>
            <span className="font-mono">{dnsRecord.host}</span>
            <span className="text-muted-foreground">Value</span>
            <span className="font-mono break-all">{dnsRecord.value}</span>
            <span className="text-muted-foreground">TTL</span>
            <span className="font-mono">{dnsRecord.ttl}</span>
          </div>
          <Button variant="outline" size="sm" onClick={copyRecord} className="gap-2">
            {copied ? <CopyCheck className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? 'Copied' : 'Copy value'}
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          DNS changes can take a few minutes (sometimes longer) to propagate. This record stays
          valid for 72 hours.
        </p>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button onClick={handleVerifyDns} className="w-full" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          I&apos;ve added it — verify now
        </Button>

        <Link href="/auth/mailbox-recovery" className="flex items-center justify-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3 w-3" /> Start over
        </Link>
      </div>
    );
  }

  // ── Step: DNS verified, ask for recovery email ──────────────────────────
  if (step === 'recovery-email') {
    return (
      <div className="space-y-6">
        <div className="flex justify-center">
          <div className="rounded-full bg-green-100 dark:bg-green-950/40 p-4">
            <ShieldCheck className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-bold tracking-tight">Domain ownership verified</h1>
          <p className="text-sm text-muted-foreground">
            Where should we send your password reset link? It expires in 3 hours.
          </p>
        </div>

        <form onSubmit={handleSetRecoveryEmail} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="recovery-email">Recovery email</Label>
            <Input
              id="recovery-email"
              type="email"
              placeholder="you@somewhere-you-can-access.com"
              value={recoveryEmail}
              onChange={(e) => setRecoveryEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Send reset link
          </Button>
        </form>
      </div>
    );
  }

  // ── Step: done ───────────────────────────────────────────────────────────
  if (step === 'done') {
    return (
      <div className="space-y-6 text-center">
        <div className="flex justify-center">
          <div className="rounded-full bg-primary/10 p-4">
            <MailCheck className="h-8 w-8 text-primary" />
          </div>
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Check your inbox</h1>
          <p className="text-sm text-muted-foreground">
            A reset link was sent to <strong>{recoveryEmail}</strong>.
            {expiresAt && ' It expires in 3 hours.'}
          </p>
        </div>
        <Link href="/auth/login" className="flex items-center justify-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3 w-3" /> Back to sign in
        </Link>
      </div>
    );
  }

  return null;
}
