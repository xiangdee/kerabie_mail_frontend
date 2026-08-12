'use client';
import { useState } from 'react';
import { Loader2, ShieldQuestion } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAppToast } from '@/components/ui/app-toast';
import { mailPasswordService } from '@/lib/services/mail-password.service';

interface RecoveryEmailCardProps {
  mailboxEmail: string;
}

// Lets a mailbox owner set an alternate email so they can regain access if
// ever locked out — see kerabie-mail-backend's app/routes/mail_reset.py.
// Whether it's already set/verified isn't surfaced by any GET endpoint on
// the backend today, so this always shows the "set / replace" form rather
// than a status view; submitting again just re-sends a fresh verification
// link, which is enough for the recovery use case.
export function RecoveryEmailCard({ mailboxEmail }: RecoveryEmailCardProps) {
  const { success, error: toastError } = useAppToast();
  const [alternateEmail, setAlternateEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await mailPasswordService.setAlternateEmail(null, mailboxEmail, alternateEmail);
    setLoading(false);
    if (res.status === true) {
      success(`Verification email sent to ${alternateEmail}`);
      setAlternateEmail('');
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
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 sm:items-end">
          <div className="flex-1 space-y-2">
            <Label htmlFor="alternate-email">Alternate email</Label>
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
