'use client';
import { useState } from 'react';
import { useAuth } from '@/lib/context/auth.context';
import { useMailboxes, useCreateMailbox, useSetMailboxNoReply, useUpdateMailbox, useReactivateMailbox } from '@/lib/hooks/useMailboxes';
import { useDomains } from '@/lib/hooks/useDomains';
import { useAppToast } from '@/components/ui/app-toast';
import { MailboxesView } from '@/components/app/settings/MailboxesView';

export default function MailboxesPage() {
  const { token } = useAuth();
  const { success, error: toastError } = useAppToast();
  const [togglingEmail, setTogglingEmail] = useState<string | null>(null);
  const [savingSenderNameId, setSavingSenderNameId] = useState<number | null>(null);
  const [reactivatingEmail, setReactivatingEmail] = useState<string | null>(null);

  const { data: mailboxes = [], isLoading } = useMailboxes(token);
  const { data: domains = [] } = useDomains(token);
  const verifiedDomains = domains.filter((d) => d.status === 'verified');
  const createMutation = useCreateMailbox(token);
  const noReplyMutation = useSetMailboxNoReply(token);
  const updateMutation = useUpdateMailbox(token);
  const reactivateMutation = useReactivateMailbox(token);

  const handleCreate = async (data: { email: string; display_name: string; password: string }) => {
    const res = await createMutation.mutateAsync(data);
    if (res.status === true) {
      success('Mailbox created', { description: data.email });
    } else {
      toastError('Failed to create mailbox', { description: res.response as string });
    }
  };

  const handleToggleNoReply = async (email: string, isNoReply: boolean) => {
    setTogglingEmail(email);
    const res = await noReplyMutation.mutateAsync({ email, isNoReply });
    setTogglingEmail(null);
    if (res.status === true) {
      success(isNoReply ? 'Mailbox now rejects incoming mail' : 'Mailbox now accepts incoming mail');
    } else {
      toastError('Failed to update', { description: res.response as string });
    }
  };

  const handleUpdateSenderName = async (id: number, displayName: string) => {
    setSavingSenderNameId(id);
    const res = await updateMutation.mutateAsync({ id, data: { display_name: displayName } });
    setSavingSenderNameId(null);
    if (res.status === true) {
      success('Sender name updated');
    } else {
      toastError('Failed to update sender name', { description: res.response as string });
    }
  };

  const handleReactivate = async (email: string, password?: string) => {
    setReactivatingEmail(email);
    const res = await reactivateMutation.mutateAsync({ email, password });
    setReactivatingEmail(null);
    if (res.status === true) {
      success('Mailbox reactivated');
    } else {
      toastError('Still can\'t reconnect', { description: res.response as string });
    }
  };

  return (
    <MailboxesView
      mailboxes={mailboxes}
      domains={verifiedDomains}
      isLoading={isLoading}
      isCreating={createMutation.isPending}
      onCreate={handleCreate}
      onToggleNoReply={handleToggleNoReply}
      togglingNoReplyEmail={togglingEmail}
      onUpdateSenderName={handleUpdateSenderName}
      savingSenderNameId={savingSenderNameId}
      onReactivate={handleReactivate}
      reactivatingEmail={reactivatingEmail}
    />
  );
}
