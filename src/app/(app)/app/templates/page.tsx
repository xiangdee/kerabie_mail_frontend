'use client';
import { useAuth } from '@/lib/context/auth.context';
import { useAppToast } from '@/components/ui/app-toast';
import { useTemplates, useCreateTemplate, useDeleteTemplate, useSendWithTemplate, type EmailTemplate } from '@/lib/hooks/useTemplates';
import { useMailboxes } from '@/lib/hooks/useMailboxes';
import TemplatesView from '@/components/app/settings/TemplatesView';

export default function TemplatesPage() {
  const { token } = useAuth();
  const { success, error: toastError } = useAppToast();

  const { data: templates = [], isLoading } = useTemplates(token);
  const { data: mailboxes = [] } = useMailboxes(token);
  const createTemplate = useCreateTemplate(token);
  const deleteTemplate = useDeleteTemplate(token);
  const sendTemplate = useSendWithTemplate(token);

  const handleDuplicate = async (t: EmailTemplate) => {
    const res = await createTemplate.mutateAsync({
      name: `${t.name} (copy)`,
      subject: t.subject ?? undefined,
      body_html: t.body_html,
      is_shared: false,
    });
    if (res.status === true) success('Template duplicated');
    else toastError('Failed to duplicate template');
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
      isDeleting={deleteTemplate.isPending}
      isSending={sendTemplate.isPending}
      onDuplicate={handleDuplicate}
      onDelete={handleDelete}
      onSend={handleSend}
    />
  );
}
