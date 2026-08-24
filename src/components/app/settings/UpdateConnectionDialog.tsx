'use client';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/lib/context/auth.context';
import { useAppToast } from '@/components/ui/app-toast';
import { useUpdateMailboxConnection } from '@/lib/hooks/useMailboxes';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  emailAddress: string;
}

/**
 * For an "unreachable" IMAP suspension specifically — the whole server
 * moved or died, so no password on the old host will ever reconnect it
 * (see MailboxesView's password-only reactivate box, which stays for
 * auth_failed/quota_exceeded). Repoints this same mailbox at a new
 * host/port/password; nothing is deleted, unlike ConvertMailboxDialog's
 * "move to another provider" (which is only for currently Kerabie-hosted
 * mailboxes migrating away).
 */
export function UpdateConnectionDialog({ open, onOpenChange, emailAddress }: Props) {
  const { token } = useAuth();
  const { success, error: toastError } = useAppToast();
  const mutation = useUpdateMailboxConnection(token);

  const [imapHost, setImapHost] = useState('');
  const [imapPort, setImapPort] = useState('993');
  const [smtpHost, setSmtpHost] = useState('');
  const [smtpPort, setSmtpPort] = useState('587');
  const [password, setPassword] = useState('');

  const reset = () => {
    setImapHost(''); setImapPort('993'); setSmtpHost(''); setSmtpPort('587'); setPassword('');
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) reset();
    onOpenChange(next);
  };

  const handleSubmit = async () => {
    if (!imapHost || !smtpHost || !password) {
      toastError('Fill in all fields');
      return;
    }
    const res = await mutation.mutateAsync({
      email: emailAddress,
      data: {
        imap_host: imapHost, imap_port: parseInt(imapPort, 10) || 993,
        smtp_host: smtpHost, smtp_port: parseInt(smtpPort, 10) || 587,
        email_password: password,
      },
    });
    if (res.status === true) {
      success(`${emailAddress} reconnected`);
      handleOpenChange(false);
    } else {
      toastError("Couldn't connect with those details", { description: res.response as string });
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update connection</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 pt-1">
          <p className="text-sm text-muted-foreground">
            {emailAddress} moved to a new host, or the old server is gone. Enter its new IMAP and
            SMTP details — we&apos;ll test them before saving anything.
          </p>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-xs">IMAP host</Label>
              <Input value={imapHost} onChange={(e) => setImapHost(e.target.value)} placeholder="imap.example.com" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">IMAP port</Label>
              <Input value={imapPort} onChange={(e) => setImapPort(e.target.value)} placeholder="993" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">SMTP host</Label>
              <Input value={smtpHost} onChange={(e) => setSmtpHost(e.target.value)} placeholder="smtp.example.com" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">SMTP port</Label>
              <Input value={smtpPort} onChange={(e) => setSmtpPort(e.target.value)} placeholder="587" />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Password</Label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password on the new server" />
          </div>

          <Button className="w-full" onClick={handleSubmit} disabled={mutation.isPending}>
            {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Reconnect
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
