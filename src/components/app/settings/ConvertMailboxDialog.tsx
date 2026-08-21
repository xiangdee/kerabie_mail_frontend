'use client';
import { useState } from 'react';
import { Copy, CopyCheck, Loader2, CloudUpload, ArrowLeftRight, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/lib/context/auth.context';
import { useAppToast } from '@/components/ui/app-toast';
import {
  useStartConvertToDns, useVerifyConvertToDns, useConvertToImap, useMigrationStatus,
} from '@/lib/hooks/useMailMigration';
import type { DnsSetupInfo, DnsRecord } from '@/lib/services/mail-connect.service';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  emailAddress: string;
}

type Mode = 'menu' | 'to-dns' | 'to-imap';

function RecordRow({ record }: { record: DnsRecord }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(record.value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button type="button" onClick={copy} className="w-full text-left flex items-start gap-2 border rounded-lg p-2.5 hover:bg-muted/50 transition-colors">
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-medium text-muted-foreground">{record.type} · {record.name}</p>
        <p className="text-xs font-mono break-all">{record.value}</p>
      </div>
      {copied ? <CopyCheck className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" /> : <Copy className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />}
    </button>
  );
}

function DnsInstructions({ config }: { config: DnsSetupInfo }) {
  const all = [...config.mx_records, ...config.txt_records, ...config.dkim_record, config.dmarc_record];
  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground">
        Add these records at your domain registrar, then verify. Propagation can take a while.
      </p>
      {all.map((r, i) => <RecordRow key={i} record={r} />)}
    </div>
  );
}

export function ConvertMailboxDialog({ open, onOpenChange, emailAddress }: Props) {
  const { token } = useAuth();
  const { success, error: toastError } = useAppToast();
  const [mode, setMode] = useState<Mode>('menu');
  const [dnsConfig, setDnsConfig] = useState<DnsSetupInfo | null>(null);
  const [connected, setConnected] = useState(false);

  const [imapHost, setImapHost] = useState('');
  const [imapPort, setImapPort] = useState('993');
  const [smtpHost, setSmtpHost] = useState('');
  const [smtpPort, setSmtpPort] = useState('587');
  const [imapPassword, setImapPassword] = useState('');
  const [confirmDataLoss, setConfirmDataLoss] = useState(false);

  const startMutation = useStartConvertToDns(token);
  const verifyMutation = useVerifyConvertToDns(token);
  const convertToImapMutation = useConvertToImap(token);
  const { data: migration } = useMigrationStatus(token, emailAddress, connected);

  const reset = () => {
    setMode('menu'); setDnsConfig(null); setConnected(false);
    setImapHost(''); setImapPort('993'); setSmtpHost(''); setSmtpPort('587');
    setImapPassword(''); setConfirmDataLoss(false);
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) reset();
    onOpenChange(next);
  };

  const handleStart = async () => {
    const res = await startMutation.mutateAsync(emailAddress);
    if (res.status === true) {
      const data = res.response as any;
      setDnsConfig(data.dns_config ?? null);
      setMode('to-dns');
    } else {
      toastError('Could not start the conversion', { description: res.response as string });
    }
  };

  const handleVerify = async () => {
    const res = await verifyMutation.mutateAsync(emailAddress);
    if (res.status === true) {
      const data = res.response as any;
      if (data.connection?.is_connected) {
        setConnected(true);
        success('Connected to Kerabie hosting');
      } else {
        setDnsConfig(data.dns_config ?? dnsConfig);
        toastError("DNS records don't verify yet", { description: data.message });
      }
    } else {
      toastError('Verification failed', { description: res.response as string });
    }
  };

  const handleConvertToImap = async () => {
    if (!imapHost || !smtpHost || !imapPassword) {
      toastError('Fill in all fields');
      return;
    }
    if (!confirmDataLoss) {
      toastError('Confirm you understand this deletes the Kerabie-hosted mailbox');
      return;
    }
    const res = await convertToImapMutation.mutateAsync({
      email: emailAddress,
      data: {
        imap_host: imapHost, imap_port: parseInt(imapPort, 10) || 993,
        smtp_host: smtpHost, smtp_port: parseInt(smtpPort, 10) || 587,
        email_password: imapPassword, confirm_data_loss: true,
      },
    });
    if (res.status === true) {
      success('Switched to your external provider');
      handleOpenChange(false);
    } else {
      toastError('Could not switch providers', { description: res.response as string });
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === 'menu' ? 'Mailbox hosting' : mode === 'to-dns' ? 'Connect to Kerabie' : 'Move to another provider'}
          </DialogTitle>
        </DialogHeader>

        {mode === 'menu' && (
          <div className="space-y-3 pt-1">
            <p className="text-sm text-muted-foreground">
              {emailAddress} is connected via an external provider. Move it to Kerabie hosting to unlock
              premium features, or switch to a different external provider.
            </p>
            <button
              type="button"
              onClick={handleStart}
              disabled={startMutation.isPending}
              className="w-full flex items-center gap-3 border rounded-xl p-3.5 text-left hover:bg-muted/50 transition-colors disabled:opacity-60"
            >
              <CloudUpload className="h-5 w-5 text-primary shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-semibold">Connect to Kerabie hosting</p>
                <p className="text-xs text-muted-foreground mt-0.5">Prove you own the domain, then we import your existing mail automatically.</p>
              </div>
              {startMutation.isPending && <Loader2 className="h-4 w-4 animate-spin shrink-0" />}
            </button>
            <button
              type="button"
              onClick={() => setMode('to-imap')}
              className="w-full flex items-center gap-3 border rounded-xl p-3.5 text-left hover:bg-muted/50 transition-colors"
            >
              <ArrowLeftRight className="h-5 w-5 shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-semibold">Move to another provider</p>
                <p className="text-xs text-muted-foreground mt-0.5">Only relevant if this mailbox is already Kerabie-hosted.</p>
              </div>
            </button>
          </div>
        )}

        {mode === 'to-dns' && !connected && (
          <div className="space-y-3 pt-1">
            {dnsConfig ? <DnsInstructions config={dnsConfig} /> : <Loader2 className="h-5 w-5 animate-spin mx-auto" />}
            <Button className="w-full" onClick={handleVerify} disabled={verifyMutation.isPending}>
              {verifyMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              I've added these — Verify
            </Button>
          </div>
        )}

        {mode === 'to-dns' && connected && (
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <CheckCircle2 className="h-10 w-10 text-emerald-500" />
            <p className="text-sm">Your Kerabie mailbox is ready. We're importing your existing mail in the background.</p>
            {migration && migration.status === 'running' && (
              <p className="text-xs text-muted-foreground">
                Importing {migration.current_folder ?? '…'} — {migration.messages_done}/{migration.messages_total || '?'} messages
              </p>
            )}
            <Button className="w-full" onClick={() => handleOpenChange(false)}>Done</Button>
          </div>
        )}

        {mode === 'to-imap' && (
          <div className="space-y-3 pt-1">
            <p className="text-sm text-muted-foreground">
              Enter your new provider's connection details. We'll test them before switching anything over.
            </p>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs">IMAP host</Label>
                <Input value={imapHost} onChange={(e) => setImapHost(e.target.value)} placeholder="imap.provider.com" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">IMAP port</Label>
                <Input value={imapPort} onChange={(e) => setImapPort(e.target.value)} placeholder="993" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">SMTP host</Label>
                <Input value={smtpHost} onChange={(e) => setSmtpHost(e.target.value)} placeholder="smtp.provider.com" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">SMTP port</Label>
                <Input value={smtpPort} onChange={(e) => setSmtpPort(e.target.value)} placeholder="587" />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Password</Label>
              <Input type="password" value={imapPassword} onChange={(e) => setImapPassword(e.target.value)} />
            </div>

            <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3">
              <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
              <p className="text-xs text-destructive">
                This permanently deletes the Kerabie-hosted mailbox and releases the domain claim. Back up anything you need first.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox checked={confirmDataLoss} onCheckedChange={(v) => setConfirmDataLoss(v === true)} id="confirm-data-loss" />
              <Label htmlFor="confirm-data-loss" className="text-xs font-normal">I understand this can't be undone</Label>
            </div>

            <Button
              variant="destructive"
              className="w-full"
              onClick={handleConvertToImap}
              disabled={convertToImapMutation.isPending || !confirmDataLoss}
            >
              {convertToImapMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Switch provider
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
