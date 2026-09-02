'use client';
import { useAuth } from '@/lib/context/auth.context';
import { useUsage } from '@/lib/hooks/useUsage';
import { useDomains } from '@/lib/hooks/useDomains';
import { useMailboxes } from '@/lib/hooks/useMailboxes';
import { DashboardView } from '@/components/app/DashboardView';

export default function DashboardPage() {
  const { token } = useAuth();
  const { data: usage, isLoading: loadingUsage } = useUsage(token);
  const { data: domains = [], isLoading: loadingDomains } = useDomains(token);
  const { data: mailboxes = [], isLoading: loadingMailboxes } = useMailboxes(token);

  return (
    <div className="px-4 py-4 sm:px-8 sm:py-7">
      <DashboardView
        usage={usage ?? null}
        domains={domains}
        mailboxes={mailboxes}
        isLoading={loadingUsage || loadingDomains || loadingMailboxes}
      />
    </div>
  );
}
