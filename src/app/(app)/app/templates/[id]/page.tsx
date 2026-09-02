'use client';
import { useParams, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/context/auth.context';
import { useAppToast } from '@/components/ui/app-toast';
import { useTemplate, useUpdateTemplate } from '@/lib/hooks/useTemplates';
import { TemplateEditor } from '@/components/app/settings/TemplateEditor';

export default function EditTemplatePage() {
  const router = useRouter();
  const params = useParams();
  const id = Number(params.id);
  const { token } = useAuth();
  const { success, error: toastError } = useAppToast();

  const { data: template, isLoading } = useTemplate(token, Number.isFinite(id) ? id : null);
  const updateTemplate = useUpdateTemplate(token);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-6 w-6 animate-spin text-console-muted" />
      </div>
    );
  }

  if (!template) {
    return (
      <div className="py-16 text-center text-sm text-console-muted">
        Template not found.
      </div>
    );
  }

  return (
    <TemplateEditor
      backHref="/app/templates"
      initialTemplate={template}
      isSaving={updateTemplate.isPending}
      onSave={async (data) => {
        const res = await updateTemplate.mutateAsync({ id, ...data });
        if (res.status === true) {
          success('Template saved');
          router.push('/app/templates');
        } else {
          toastError('Failed to save template', { description: res.response as string });
        }
      }}
    />
  );
}
