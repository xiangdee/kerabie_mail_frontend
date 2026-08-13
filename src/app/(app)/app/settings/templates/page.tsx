'use client';
import { useAuth } from '@/lib/context/auth.context';
import { useAppToast } from '@/components/ui/app-toast';
import { useTemplates, useCreateTemplate, useUpdateTemplate, useDeleteTemplate, useSendWithTemplate } from '@/lib/hooks/useTemplates';
import { useMailboxes } from '@/lib/hooks/useMailboxes';
import TemplatesView from '@/components/app/settings/TemplatesView';

export default function TemplatesPage() {
  const { token } = useAuth();
  const { success, error: toastError } = useAppToast();

  const { data: templates = [], isLoading } = useTemplates(token);
  const { data: mailboxes = [] } = useMailboxes(token);
  const createTemplate = useCreateTemplate(token);
  const updateTemplate = useUpdateTemplate(token);
  const deleteTemplate = useDeleteTemplate(token);
  const sendTemplate = useSendWithTemplate(token);

  const handleCreate = async (data: { name: string; subject?: string; body_html: string }) => {
    const res = await createTemplate.mutateAsync(data);
    if (res.status === true) {
      success('Template saved');
      return true;
    }
    toastError('Failed to save template', { description: res.response as string });
    return false;
  };

  const handleUpdate = async (id: number, data: { name?: string; subject?: string; body_html?: string }) => {
    const res = await updateTemplate.mutateAsync({ id, ...data });
    if (res.status === true) {
      success('Template updated');
      return true;
    }
    toastError('Failed to update template', { description: res.response as string });
    return false;
  };

  const handleDelete = async (id: number) => {
    const res = await deleteTemplate.mutateAsync(id);
    if (res.status === true) success('Template deleted');
    else toastError('Failed to delete template');
  };

  const handleSend = async (data: { from_email: string; to: string[]; template_id: number; variables: Record<string, string> }) => {
    const res = await sendTemplate.mutateAsync(data);
    if (res.status === true) {
      success('Email sent');
      return true;
    }
    toastError('Failed to send', { description: res.response as string });
    return false;
  };

  return (
    <TemplatesView
      templates={templates}
      mailboxes={mailboxes}
      isLoading={isLoading}
      isSaving={createTemplate.isPending || updateTemplate.isPending}
      isSending={sendTemplate.isPending}
      onCreate={handleCreate}
      onUpdate={handleUpdate}
      onDelete={handleDelete}
      onSend={handleSend}
    />
  );
}
