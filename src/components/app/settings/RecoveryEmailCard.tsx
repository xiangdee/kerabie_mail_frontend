'use client';
import { useState } from 'react';
import { Loader2, ShieldQuestion, CheckCircle2, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAppToast } from '@/components/ui/app-toast';
import { mailPasswordService } from '@/lib/services/mail-password.service';
import { useMailboxes } from '@/lib/hooks/useMailboxes';

interface RecoveryEmailCardProps {
  mailboxEmail: string;
  token: string | null;
}

// Lets a mailbox owner set an alternate email so they can regain access if
// ever locked out — see kerabie-mail-backend's app/routes/mail_reset.py.
// GET /mail/user-emails (useMailboxes) already returns alternate_email/
// alternate_email_verified per mailbox, so this shows real status rather
// than a blind "set" form — same data the mobile app's equivalent screen
// already surfaces.
export function RecoveryEmailCard({ mailboxEmail, token }: RecoveryEmailCardProps) {
  const { success, error: toastError } = useAppToast();
  const { data: mailboxes, refetch } = useMailboxes(token);
  const mailbox = mailboxes?.find((m) => m.email_address === mailboxEmail);
  const [alternateEmail, setAlternateEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await mailPasswordService.setAlternateEmail(token, mailboxEmail, alternateEmail);
    setLoading(false);
    if (res.status === true) {
      success(`Verification email sent to ${alternateEmail}`);
      setAlternateEmail('');
      refetch();
    } else {
      toastError(typeof res.response === 'string' ? res.response : 'Failed to set recovery email.');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <ShieldQuestion className="h-4 w-4" />
          Recovery email
        </CardTitle>
        <CardDescription>
          Add a backup address for <strong>{mailboxEmail}</strong> so you can reset your
          password if you&apos;re ever locked out and can&apos;t receive mail here. Without
          one, recovery falls back to proving domain ownership via DNS.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {mailbox?.alternate_email && (
          <div className="flex items-center gap-2 text-sm rounded-md border px-3 py-2">
            {mailbox.alternate_email_verified ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />
            )}
            <span className="truncate">{mailbox.alternate_email}</span>
            <span className={mailbox.alternate_email_verified ? 'text-emerald-500' : 'text-amber-500'}>
              {mailbox.alternate_email_verified ? 'Verified' : 'Pending verification'}
            </span>
          </div>
        )}
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 sm:items-end">
          <div className="flex-1 space-y-2">
            <Label htmlFor="alternate-email">
              {mailbox?.alternate_email ? 'Replace alternate email' : 'Alternate email'}
            </Label>
            <Input
              id="alternate-email"
              type="email"
              placeholder="you@somewhere-else.com"
              value={alternateEmail}
              onChange={(e) => setAlternateEmail(e.target.value)}
              required
            />
          </div>
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Send verification
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
