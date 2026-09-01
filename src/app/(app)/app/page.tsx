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
    <div className="max-w-5xl mx-auto px-6 py-8">
      <DashboardView
        usage={usage ?? null}
        domains={domains}
        mailboxes={mailboxes}
        isLoading={loadingUsage || loadingDomains || loadingMailboxes}
      />
    </div>
  );
}
