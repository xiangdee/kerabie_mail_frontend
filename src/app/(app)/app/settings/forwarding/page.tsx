'use client';
import { useState } from 'react';
import { useAuth } from '@/lib/context/auth.context';
import { useAppToast, ConfirmDialog } from '@/components/ui/app-toast';
import { useMailboxes } from '@/lib/hooks/useMailboxes';
import { useForwarding, useCreateForwarding, useDeleteForwarding, useToggleForwarding } from '@/lib/hooks/useForwarding';
import ForwardingView from '@/components/app/settings/ForwardingView';

export default function ForwardingPage() {
  const { token } = useAuth();
  const { success, error: toastError } = useAppToast();
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [activeMailbox, setActiveMailbox] = useState('');

  const { data: mailboxes = [] } = useMailboxes(token);
  const mailbox = activeMailbox || mailboxes[0]?.email_address || '';

  const { data: rules = [], isLoading } = useForwarding(mailbox, token);
  const createRule = useCreateForwarding(token);
  const deleteRule = useDeleteForwarding(token);
  const toggleRule = useToggleForwarding(token);

  const handleCreate = async (data: { mailbox: string; destination: string; keep_copy: boolean }) => {
    setActiveMailbox(data.mailbox);
    const res = await createRule.mutateAsync(data);
    if (res.status === true) {
      success('Forwarding rule added');
    } else {
      toastError('Failed to add rule', { description: res.response?.detail });
    }
  };

  const handleDelete = async (id: number) => {
    const res = await deleteRule.mutateAsync(id);
    if (res.status === true) {
      success('Rule removed');
    } else {
      toastError('Failed to remove rule');
    }
    setConfirmDelete(null);
  };

  const handleToggle = async (id: number, enabled: boolean) => {
    const res = await toggleRule.mutateAsync({ id, enabled });
    if (res.status !== true) toastError('Failed to update rule');
  };

  return (
    <>
      <ForwardingView
        rules={rules}
        mailboxes={mailboxes}
        isLoading={isLoading}
        isCreating={createRule.isPending}
        isDeleting={deleteRule.isPending}
        isToggling={toggleRule.isPending}
        onCreate={handleCreate}
        onDelete={(id) => setConfirmDelete(id)}
        onToggle={handleToggle}
      />
      <ConfirmDialog
        open={confirmDelete !== null}
        title="Remove forwarding rule?"
        description="Mail will no longer be forwarded to this address."
        variant="danger"
        confirmLabel="Remove"
        onConfirm={() => confirmDelete !== null && handleDelete(confirmDelete)}
        onCancel={() => setConfirmDelete(null)}
      />
    </>
  );
}
