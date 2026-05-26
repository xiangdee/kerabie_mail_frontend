'use client';
import { useState } from 'react';
import { useAuth } from '@/lib/context/auth.context';
import { useAppToast, ConfirmDialog } from '@/components/ui/app-toast';
import { useWebhooks, useCreateWebhook, useDeleteWebhook, useUpdateWebhook } from '@/lib/hooks/useWebhooks';
import WebhooksView from '@/components/app/settings/WebhooksView';

export default function WebhooksPage() {
  const { token } = useAuth();
  const { success, error: toastError } = useAppToast();
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  const { data: webhooks = [], isLoading } = useWebhooks(token);
  const createWebhook = useCreateWebhook(token);
  const deleteWebhook = useDeleteWebhook(token);
  const updateWebhook = useUpdateWebhook(token);

  const handleCreate = async (data: { url: string; events: string[]; allowed_ips: string[] | null }) => {
    const res = await createWebhook.mutateAsync(data);
    if (res.status === true) {
      success('Webhook registered');
    } else {
      toastError('Failed to register webhook', { description: res.response?.detail });
    }
  };

  const handleDelete = async (id: number) => {
    const res = await deleteWebhook.mutateAsync(id);
    if (res.status === true) {
      success('Webhook removed');
    } else {
      toastError('Failed to remove webhook');
    }
    setConfirmDelete(null);
  };

  const handleToggle = async (id: number, is_active: boolean) => {
    const res = await updateWebhook.mutateAsync({ id, is_active });
    if (res.status !== true) toastError('Failed to update webhook');
  };

  const handleUpdateIps = async (id: number, allowed_ips: string[] | null) => {
    const res = await updateWebhook.mutateAsync({ id, allowed_ips });
    if (res.status === true) {
      success(allowed_ips ? 'IP allowlist updated' : 'IP restrictions removed');
    } else {
      toastError('Failed to update IP allowlist', { description: res.response?.detail });
    }
  };

  return (
    <>
      <WebhooksView
        webhooks={webhooks}
        isLoading={isLoading}
        isCreating={createWebhook.isPending}
        isDeleting={deleteWebhook.isPending}
        isUpdating={updateWebhook.isPending}
        onCreate={handleCreate}
        onDelete={(id) => setConfirmDelete(id)}
        onToggle={handleToggle}
        onUpdateIps={handleUpdateIps}
      />
      <ConfirmDialog
        open={confirmDelete !== null}
        title="Remove webhook?"
        description="This endpoint will stop receiving event notifications."
        variant="danger"
        confirmLabel="Remove"
        onConfirm={() => confirmDelete !== null && handleDelete(confirmDelete)}
        onCancel={() => setConfirmDelete(null)}
      />
    </>
  );
}
