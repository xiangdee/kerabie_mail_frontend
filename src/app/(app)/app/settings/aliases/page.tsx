'use client';
import { useState } from 'react';
import { useAuth } from '@/lib/context/auth.context';
import { useAppToast, ConfirmDialog } from '@/components/ui/app-toast';
import { useMailboxes } from '@/lib/hooks/useMailboxes';
import { useAliases, useCreateAlias, useDeleteAlias } from '@/lib/hooks/useAliases';
import AliasesView from '@/components/app/settings/AliasesView';

export default function AliasesPage() {
  const { token } = useAuth();
  const { success, error: toastError } = useAppToast();
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  const { data: mailboxes = [] } = useMailboxes(token);
  const { data: aliases = [], isLoading } = useAliases(token);
  const createAlias = useCreateAlias(token);
  const deleteAlias = useDeleteAlias(token);

  const handleCreate = async (data: { mailbox: string; alias_address: string }) => {
    const res = await createAlias.mutateAsync(data);
    if (res.status === true) {
      success('Alias created');
    } else {
      toastError('Failed to create alias', { description: res.response?.detail });
    }
  };

  const handleDelete = async (id: number) => {
    const res = await deleteAlias.mutateAsync(id);
    if (res.status === true) {
      success('Alias removed');
    } else {
      toastError('Failed to remove alias');
    }
    setConfirmDelete(null);
  };

  return (
    <>
      <AliasesView
        aliases={aliases}
        mailboxes={mailboxes}
        isLoading={isLoading}
        isCreating={createAlias.isPending}
        isDeleting={deleteAlias.isPending}
        onCreate={handleCreate}
        onDelete={(id) => setConfirmDelete(id)}
      />
      <ConfirmDialog
        open={confirmDelete !== null}
        title="Remove alias?"
        description="Mail addressed to this alias will no longer be delivered."
        variant="danger"
        confirmLabel="Remove"
        onConfirm={() => confirmDelete !== null && handleDelete(confirmDelete)}
        onCancel={() => setConfirmDelete(null)}
      />
    </>
  );
}
