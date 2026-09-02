'use client';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useAppToast } from '@/components/ui/app-toast';
import { mailPasswordService } from '@/lib/services/mail-password.service';
import { useMailboxes } from '@/lib/hooks/useMailboxes';
import { PlusCorners } from '@/components/app/console/PlusCorners';
import { cn } from '@/lib/utils';

const MONO = "font-[family-name:var(--font-plex-mono)]";
const DISPLAY = "font-[family-name:var(--font-barlow-condensed)]";

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <div className={cn(MONO, 'text-[10px] tracking-[0.12em] text-console-muted2 mb-1.5')}>{children}</div>;
}

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

  const verified = !!mailbox?.alternate_email_verified;

  return (
    <div className="border border-console-border bg-white flex flex-col">
      <div className="px-5 py-4 border-b border-console-border flex items-center gap-3 flex-wrap">
        <div className={cn(DISPLAY, 'font-semibold text-xl')}>Recovery email</div>
        <div className="flex-1" />
        {mailbox?.alternate_email && (
          <span
            className={cn(MONO, 'text-[9.5px] tracking-[0.08em] uppercase px-1.5 py-0.5 border')}
            style={{ borderColor: verified ? 'var(--color-console-accent)' : 'var(--color-console-amber)', color: verified ? 'var(--color-console-accent)' : 'var(--color-console-amber)' }}
          >
            {verified ? 'Verified' : 'Pending'}
          </span>
        )}
      </div>
      <div className="p-5 flex flex-col gap-3.5">
        <p className="text-[13.5px] text-console-muted text-wrap-pretty">
          Kerabie cannot email a reset link to an address hosted on the account it&apos;s locking you out of. Without a recovery address, resets fall back to proving domain ownership over DNS — that takes hours.
        </p>
        {mailbox?.alternate_email && (
          <div className="border border-console-border-soft bg-console-hover px-4 py-3 text-[13.5px] truncate">
            {mailbox.alternate_email}
          </div>
        )}
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 sm:items-end">
          <div className="flex-1 min-w-[200px]">
            <FieldLabel>{mailbox?.alternate_email ? 'Replace alternate email' : 'Alternate email'}</FieldLabel>
            <Input
              type="email"
              placeholder="you@somewhere-else.com"
              value={alternateEmail}
              onChange={(e) => setAlternateEmail(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className={cn('relative bg-console-accent text-white border-0 h-9 px-5 hover:bg-console-accent-dark transition-colors disabled:opacity-40 flex items-center gap-2 shrink-0', DISPLAY, 'font-semibold text-[15px] tracking-[0.04em]')}
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            SEND VERIFICATION
            <PlusCorners variant="all" />
          </button>
        </form>
      </div>
    </div>
  );
}
