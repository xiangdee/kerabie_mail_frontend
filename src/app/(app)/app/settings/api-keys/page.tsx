'use client';
import { useState } from 'react';
import { useAuth } from '@/lib/context/auth.context';
import { useAppToast, ConfirmDialog } from '@/components/ui/app-toast';
import { useApiKeys, useCreateApiKey, useDeleteApiKey, useUpdateApiKey } from '@/lib/hooks/useApiKeys';
import ApiKeysView from '@/components/app/settings/ApiKeysView';

export default function ApiKeysPage() {
  const { token } = useAuth();
  const { success, error: toastError } = useAppToast();
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [newKeySecret, setNewKeySecret] = useState<string | undefined>();

  const { data: keys = [], isLoading } = useApiKeys(token);
  const createKey = useCreateApiKey(token);
  const updateKey = useUpdateApiKey(token);
  const deleteKey = useDeleteApiKey(token);

  const handleCreate = async (data: { name: string; scopes: string[]; allowed_ips: string[] | null }) => {
    const res = await createKey.mutateAsync(data);
    if (res.status === true) {
      const secret: string = res.response?.key ?? res.response?.api_key ?? '';
      setNewKeySecret(secret);
      success('API key created — copy it now');
    } else {
      toastError('Failed to create API key', { description: res.response?.detail });
    }
  };

  const handleDelete = async (id: number) => {
    const res = await deleteKey.mutateAsync(id);
    if (res.status === true) {
      success('API key revoked');
    } else {
      toastError('Failed to revoke key');
    }
    setConfirmDelete(null);
  };

  const handleUpdateIps = async (id: number, allowed_ips: string[] | null) => {
    const res = await updateKey.mutateAsync({ id, allowed_ips });
    if (res.status === true) {
      success(allowed_ips ? 'IP allowlist updated' : 'IP restrictions removed');
    } else {
      toastError('Failed to update IP allowlist', { description: res.response?.detail });
    }
  };

  return (
    <>
      <ApiKeysView
        keys={keys}
        isLoading={isLoading}
        isCreating={createKey.isPending}
        isDeleting={deleteKey.isPending}
        isUpdating={updateKey.isPending}
        newKeySecret={newKeySecret}
        onCreate={handleCreate}
        onDelete={(id) => setConfirmDelete(id)}
        onUpdateIps={handleUpdateIps}
        onClearSecret={() => setNewKeySecret(undefined)}
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
