'use client';
import { useState } from 'react';
import { useAuth } from '@/lib/context/auth.context';
import { useSubscription, useCancelSubscription, useReactivateSubscription } from '@/lib/hooks/useBilling';
import { useAppToast } from '@/components/ui/app-toast';
import { ConfirmDialog } from '@/components/ui/app-toast';
import { BillingView } from '@/components/app/settings/BillingView';
import UsageSummaryView from '@/components/app/settings/UsageSummaryView';
import { useUsage } from '@/lib/hooks/useUsage';

export default function BillingPage() {
  const { token, user } = useAuth();
  const { success, error: toastError } = useAppToast();
  const [confirmCancel, setConfirmCancel] = useState(false);

  const { data: subscription, isLoading } = useSubscription(token);
  const { data: usage, isLoading: usageLoading } = useUsage(token);
  const cancelMutation = useCancelSubscription(token);
  const reactivateMutation = useReactivateSubscription(token);

  const handleCancel = async () => {
    const res = await cancelMutation.mutateAsync();
    if (res.status === true) {
      success('Subscription cancelled', { description: 'Your plan remains active until the end of the billing period.' });
    } else {
      toastError('Could not cancel subscription');
    }
    setConfirmCancel(false);
  };

  const handleReactivate = async () => {
    const res = await reactivateMutation.mutateAsync();
    if (res.status === true) {
      success('Subscription reactivated!');
    } else {
      toastError('Could not reactivate subscription');
    }
  };

  return (
    <>
      <div className="space-y-6">
        <BillingView
          subscription={subscription}
          isLoading={isLoading}
          isCancelling={cancelMutation.isPending}
          isReactivating={reactivateMutation.isPending}
          planType={user?.plan_type}
          onCancel={() => setConfirmCancel(true)}
          onReactivate={handleReactivate}
        />
        <UsageSummaryView usage={usage} isLoading={usageLoading} />
      </div>
      <ConfirmDialog
        open={confirmCancel}
        title="Cancel subscription?"
        description="You'll lose access to paid features at the end of your billing period. You can reactivate any time."
        confirmLabel="Cancel subscription"
        cancelLabel="Keep plan"
        variant="warning"
        onConfirm={handleCancel}
        onCancel={() => setConfirmCancel(false)}
      />
    </>
  );
}
