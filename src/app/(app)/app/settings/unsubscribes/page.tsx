'use client';
import { useState } from 'react';
import { useAuth } from '@/lib/context/auth.context';
import { useAppToast, ConfirmDialog } from '@/components/ui/app-toast';
import { useMailboxes } from '@/lib/hooks/useMailboxes';
import { useUnsubscribes, useDeleteUnsubscribe } from '@/lib/hooks/useUnsubscribes';
import UnsubscribesView from '@/components/app/settings/UnsubscribesView';

export default function UnsubscribesPage() {
  const { token } = useAuth();
  const { success, error: toastError } = useAppToast();
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [activeMailbox, setActiveMailbox] = useState('');

  const { data: mailboxes = [] } = useMailboxes(token);
  const mailbox = activeMailbox || mailboxes[0]?.email || '';

  const { data, isLoading } = useUnsubscribes(mailbox, token);
  const deleteUnsubscribe = useDeleteUnsubscribe(token);

  const handleDelete = async (id: number) => {
    const res = await deleteUnsubscribe.mutateAsync(id);
    if (res.status === true) {
      success('Recipient can receive mail again');
    } else {
      toastError('Failed to remove unsubscribe');
    }
    setConfirmDelete(null);
  };

  return (
    <>
      <UnsubscribesView
        unsubscribes={data?.unsubscribes ?? []}
        total={data?.total ?? 0}
        mailboxes={mailboxes}
        activeMailbox={mailbox}
        onMailboxChange={setActiveMailbox}
        isLoading={isLoading}
        isDeleting={deleteUnsubscribe.isPending}
        onDelete={(id) => setConfirmDelete(id)}
      />
      <ConfirmDialog
        open={confirmDelete !== null}
        title="Remove this unsubscribe?"
        description="This recipient will be able to receive mail from this mailbox again."
        variant="warning"
        confirmLabel="Remove"
        onConfirm={() => confirmDelete !== null && handleDelete(confirmDelete)}
        onCancel={() => setConfirmDelete(null)}
      />
    </>
  );
}
