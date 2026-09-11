'use client';
import { useState } from 'react';
import { useAuth } from '@/lib/context/auth.context';
import { useAppToast, ConfirmDialog } from '@/components/ui/app-toast';
import { useApiKeys, useDeleteApiKey, useUpdateApiKey } from '@/lib/hooks/useApiKeys';
import ApiKeysView from '@/components/app/settings/ApiKeysView';

export default function ApiKeysPage() {
  const { token } = useAuth();
  const { success, error: toastError } = useAppToast();
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  const { data: keys = [], isLoading } = useApiKeys(token);
  const updateKey = useUpdateApiKey(token);
  const deleteKey = useDeleteApiKey(token);

  const handleDelete = async (id: number) => {
    const res = await deleteKey.mutateAsync(id);
    if (res.status === true) {
      success('API key revoked');
    } else {
      toastError('Failed to revoke key');
    }
    setConfirmDelete(null);
  };

  const handleUpdateIps = async (id: number, allowed_ips: string[] | null, blocked_ips: string[] | null) => {
    const res = await updateKey.mutateAsync({ id, allowed_ips, blocked_ips });
    if (res.status === true) {
      success('Access rules updated');
    } else {
      toastError('Failed to update access rules', { description: res.response?.detail });
    }
  };

  return (
    <>
      <ApiKeysView
        keys={keys}
        isLoading={isLoading}
        isDeleting={deleteKey.isPending}
        isUpdating={updateKey.isPending}
        onDelete={(id) => setConfirmDelete(id)}
        onUpdateIps={handleUpdateIps}
      />
      <ConfirmDialog
        open={confirmDelete !== null}
        title="Revoke API key?"
        description="Any app using this key will lose access immediately."
        variant="danger"
        confirmLabel="Revoke"
        onConfirm={() => confirmDelete !== null && handleDelete(confirmDelete)}
        onCancel={() => setConfirmDelete(null)}
      />
    </>
  );
}
