'use client';
import { useState } from 'react';
import { useAuth } from '@/lib/context/auth.context';
import { useDomains, useAddDomain, useDeleteDomain, useVerifyDomain, useSendDnsInstructions, useSetDomainNoReply, useDomainUsage } from '@/lib/hooks/useDomains';
import { useAppToast } from '@/components/ui/app-toast';
import { ConfirmDialog } from '@/components/ui/app-toast';
import { DomainsView } from '@/components/app/settings/DomainsView';

export default function DomainsPage() {
  const { token } = useAuth();
  const { success, error: toastError } = useAppToast();
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [togglingNoReplyId, setTogglingNoReplyId] = useState<number | null>(null);

  const { data: domains = [], isLoading } = useDomains(token);
  const { data: usage } = useDomainUsage(token);
  const addMutation = useAddDomain(token);
  const deleteMutation = useDeleteDomain(token);
  const verifyMutation = useVerifyDomain(token);
  const sendInstructionsMutation = useSendDnsInstructions(token);
  const noReplyMutation = useSetDomainNoReply(token);

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
    // The check is synchronous (app/routes/domains.py's check_domain_verification
    // runs the DNS lookups and returns the real pass/fail in this same response)
    // -- there's no background job to wait on, so a 200 here means "here's the
    // result," not "check started." Read the actual outcome instead of treating
    // any successful HTTP call as a pending verification.
    if (res.status === true) {
      const domain = (res.response as { domain?: { is_verified?: boolean }; message?: string })?.domain;
      const message = (res.response as { message?: string })?.message;
      if (domain?.is_verified) {
        success('Domain verified!', { description: message ?? 'DNS records are correctly configured.' });
      } else {
        toastError('Not verified yet', { description: message ?? 'DNS records don\'t match yet — double-check them and try again.' });
      }
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

  const handleToggleNoReply = async (id: number, noReplyDomain: boolean) => {
    setTogglingNoReplyId(id);
    const res = await noReplyMutation.mutateAsync({ id, no_reply_domain: noReplyDomain });
    setTogglingNoReplyId(null);
    if (res.status === true) {
      success(noReplyDomain ? 'Domain now rejects all incoming mail' : 'Domain now accepts incoming mail');
    } else {
      toastError('Failed to update', { description: res.response as string });
    }
  };

  const handleDeleteConfirmed = async () => {
    if (confirmDeleteId == null) return;
    const res = await deleteMutation.mutateAsync(confirmDeleteId);
    if (res.status === true) {
      success('Domain removed');
    } else {
      toastError('Failed to remove domain', { description: res.response as string });
    }
    setConfirmDeleteId(null);
  };

  return (
    <>
      <DomainsView
        domains={domains}
        usage={usage ?? null}
        isLoading={isLoading}
        isAdding={addMutation.isPending}
        isVerifying={verifyMutation.isPending}
        isDeleting={deleteMutation.isPending}
        isSendingInstructions={sendInstructionsMutation.isPending}
        onAdd={handleAdd}
        onVerify={handleVerify}
        onDelete={(id) => setConfirmDeleteId(id)}
        onSendInstructions={handleSendInstructions}
        onToggleNoReply={handleToggleNoReply}
        togglingNoReplyId={togglingNoReplyId}
      />
      <ConfirmDialog
        open={confirmDeleteId != null}
        title="Remove domain?"
        description="This only works while no mailboxes remain on the domain — remove those first if there are any."
        confirmLabel="Remove domain"
        variant="danger"
        onConfirm={handleDeleteConfirmed}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </>
  );
}
