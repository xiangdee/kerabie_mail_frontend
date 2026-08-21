'use client';
import { useRouter } from 'next/navigation';
import { AlertTriangle } from 'lucide-react';
import { useAuth } from '@/lib/context/auth.context';
import { useMailboxes } from '@/lib/hooks/useMailboxes';
import { useDomains } from '@/lib/hooks/useDomains';

/**
 * App-wide top ribbon for connection problems the backend already detects
 * (poll_new_mail's grace-window mailbox suspension, check_expiring_domains'
 * DNS revalidation) but had no page-independent signal for — a suspended
 * mailbox or expired domain was previously only visible if you happened to
 * open Settings > Mailboxes/Domains. Mirrors apps/kerabie_mail's
 * ConnectionRibbon.
 */
export function ConnectionRibbon() {
  const { token } = useAuth();
  const router = useRouter();
  const { data: mailboxes } = useMailboxes(token);
  const { data: domains } = useDomains(token);

  const suspended = (mailboxes ?? []).filter((m) => m.is_active === false);
  const expired = (domains ?? []).filter((d) => d.status === 'expired');
  const total = suspended.length + expired.length;
  if (total === 0) return null;

  const label = total === 1
    ? (suspended[0] ? `Can't connect to ${suspended[0].email_address}` : `${expired[0].domain} needs attention`)
    : `${total} mailboxes need attention`;

  return (
    <button
      type="button"
      onClick={() => router.push('/app/settings/mailboxes')}
      className="flex items-center gap-2 w-full px-4 py-2 bg-destructive text-destructive-foreground text-sm font-medium hover:opacity-90 transition-opacity shrink-0"
    >
      <AlertTriangle className="h-4 w-4 shrink-0" />
      <span className="truncate">{label}</span>
      <span className="ml-auto text-xs underline underline-offset-2 shrink-0">Fix now</span>
    </button>
  );
}
