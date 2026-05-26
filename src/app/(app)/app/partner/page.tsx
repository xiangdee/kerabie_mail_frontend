'use client';
import { useAuth } from '@/lib/context/auth.context';
import { useAppToast } from '@/components/ui/app-toast';
import { usePartner, useHostingMailboxes, useApplyForPartner, useRequestHostingTrial } from '@/lib/hooks/usePartner';
import PartnerView from '@/components/app/PartnerView';

export default function PartnerPage() {
  const { token } = useAuth();
  const { success, error: toastError } = useAppToast();

  const { data: partner, isLoading: loadingPartner } = usePartner(token);
  const { data: mailboxes = [], isLoading: loadingMailboxes } = useHostingMailboxes(token);
  const applyForPartner = useApplyForPartner(token);
  const requestTrial = useRequestHostingTrial(token);

  const handleApply = async (data: { payout_method: string; payout_details: Record<string, string> }) => {
    const res = await applyForPartner.mutateAsync(data);
    if (res.status === true) {
      success('Application submitted — we\'ll review it shortly');
    } else {
      toastError('Failed to submit application', { description: res.response?.detail });
    }
  };

  const handleRequestTrial = async (data: { email_address: string; domain: string; display_name?: string }) => {
    const res = await requestTrial.mutateAsync(data);
    if (res.status === true) {
      success('Trial mailbox provisioned');
    } else {
      toastError('Failed to provision trial', { description: res.response?.detail });
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <PartnerView
        partner={partner ?? null}
        mailboxes={mailboxes}
        isLoading={loadingPartner || loadingMailboxes}
        isApplying={applyForPartner.isPending}
        isRequestingTrial={requestTrial.isPending}
        onApply={handleApply}
        onRequestTrial={handleRequestTrial}
      />
    </div>
  );
}
