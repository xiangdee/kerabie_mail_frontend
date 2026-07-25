'use client';
import { useState } from 'react';
import { useAuth } from '@/lib/context/auth.context';
import { useDomains, useAddDomain, useDeleteDomain, useVerifyDomain, useSendDnsInstructions } from '@/lib/hooks/useDomains';
import { useAppToast } from '@/components/ui/app-toast';
import { ConfirmDialog } from '@/components/ui/app-toast';
import { DomainsView } from '@/components/app/settings/DomainsView';

export default function DomainsPage() {
  const { token } = useAuth();
  const { success, error: toastError } = useAppToast();
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  const { data: domains = [], isLoading } = useDomains(token);
  const addMutation = useAddDomain(token);
  const deleteMutation = useDeleteDomain(token);
  const verifyMutation = useVerifyDomain(token);
  const sendInstructionsMutation = useSendDnsInstructions(token);

  const handleAdd = async (domain: string) => {
    const res = await addMutation.mutateAsync(domain);
    if (res.status === true) {
      success('Domain added', { description: `Configure the DNS records for ${domain}` });
    } else {
      toastError('Failed to add domain', { description: res.response as string });
    }
  };

  const handleVerify = async (id: number) => {
    const res = await verifyMutation.mutateAsync(id);
    if (res.status === true) {
      success('Verification started', { description: 'DNS checks may take a few minutes' });
    } else {
      toastError('Verification failed', { description: res.response as string });
    }
  };

  const handleSendInstructions = async (domain: string, developerEmail: string) => {
    const res = await sendInstructionsMutation.mutateAsync({ domain, developer_email: developerEmail });
    if (res.status === true) {
      success('Instructions sent', { description: `Sent to ${developerEmail}` });
    } else {
      toastError('Failed to send', { description: res.response as string });
    }
  };

  const handleDeleteConfirmed = async () => {
    if (confirmDeleteId == null) return;
    const res = await deleteMutation.mutateAsync(confirmDeleteId);
    if (res.status === true) {
      success('Domain removed');
    } else {
      toastError('Failed to remove domain');
    }
    setConfirmDeleteId(null);
  };

  return (
    <>
      <DomainsView
        domains={domains}
        isLoading={isLoading}
        isAdding={addMutation.isPending}
        isVerifying={verifyMutation.isPending}
        isDeleting={deleteMutation.isPending}
        isSendingInstructions={sendInstructionsMutation.isPending}
        onAdd={handleAdd}
        onVerify={handleVerify}
        onDelete={(id) => setConfirmDeleteId(id)}
        onSendInstructions={handleSendInstructions}
      />
      <ConfirmDialog
        open={confirmDeleteId != null}
        title="Remove domain?"
        description="All mailboxes on this domain will stop receiving email."
        confirmLabel="Remove domain"
        variant="danger"
        onConfirm={handleDeleteConfirmed}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </>
  );
}
