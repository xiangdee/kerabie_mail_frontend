'use client';
import { useState } from 'react';
import { useAuth } from '@/lib/context/auth.context';
import { useMailboxes, useCreateMailbox, useDeleteMailbox } from '@/lib/hooks/useMailboxes';
import { useAppToast } from '@/components/ui/app-toast';
import { ConfirmDialog } from '@/components/ui/app-toast';
import { MailboxesView } from '@/components/app/settings/MailboxesView';

export default function MailboxesPage() {
  const { token } = useAuth();
  const { success, error: toastError } = useAppToast();
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const { data: mailboxes = [], isLoading } = useMailboxes(token);
  const createMutation = useCreateMailbox(token);
  const deleteMutation = useDeleteMailbox(token);

  const handleCreate = async (data: { email: string; display_name: string; password: string }) => {
    const res = await createMutation.mutateAsync(data);
    if (res.status === true) {
      success('Mailbox created', { description: data.email });
    } else {
      toastError('Failed to create mailbox', { description: res.response as string });
    }
  };

  const handleDeleteConfirmed = async () => {
    if (!confirmDelete) return;
    const res = await deleteMutation.mutateAsync(confirmDelete);
    if (res.status === true) {
      success('Mailbox deleted');
    } else {
      toastError('Failed to delete mailbox');
    }
    setConfirmDelete(null);
  };

  return (
    <>
      <MailboxesView
        mailboxes={mailboxes}
        isLoading={isLoading}
        isCreating={createMutation.isPending}
        isDeleting={deleteMutation.isPending}
        onCreate={handleCreate}
        onDelete={(email) => setConfirmDelete(email)}
      />
      <ConfirmDialog
        open={!!confirmDelete}
        title="Delete mailbox?"
        description={`All emails in ${confirmDelete} will be permanently deleted.`}
        confirmLabel="Delete mailbox"
        variant="danger"
        onConfirm={handleDeleteConfirmed}
        onCancel={() => setConfirmDelete(null)}
      />
    </>
  );
}
