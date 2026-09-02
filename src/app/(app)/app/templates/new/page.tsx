'use client';
import { Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/context/auth.context';
import { useAppToast } from '@/components/ui/app-toast';
import { useCreateTemplate } from '@/lib/hooks/useTemplates';
import { TemplateEditor } from '@/components/app/settings/TemplateEditor';
import { TEMPLATE_DESIGN_LIST, DEFAULT_SAMPLE_VALUES, fillTemplateVariables, type DesignKey } from '@/lib/constants/templateDesigns';

const MONO = "font-[family-name:var(--font-plex-mono)]";
const DISPLAY = "font-[family-name:var(--font-barlow-condensed)]";

function NewTemplateContent() {
  const router = useRouter();
  const params = useSearchParams();
  const design = params.get('design') as DesignKey | null;
  const { token } = useAuth();
  const { success, error: toastError } = useAppToast();
  const createTemplate = useCreateTemplate(token);

  if (design) {
    return (
      <TemplateEditor
        backHref="/app/templates/new"
        initialDesign={design}
        isSaving={createTemplate.isPending}
        onSave={async (data) => {
          const res = await createTemplate.mutateAsync(data);
          if (res.status === true) {
            success('Template created');
            router.push('/app/templates');
          } else {
            toastError('Failed to create template', { description: res.response as string });
          }
        }}
      />
    );
  }

  return (
    <div className="space-y-6 py-5 sm:py-7">
      <div className="flex items-center gap-4">
        <Link href="/app/templates" className="text-sm text-console-muted2 hover:text-console-accent">← Templates</Link>
      </div>
      <div>
        <div className={cn(MONO, 'text-[10px] tracking-[0.12em] text-console-muted2')}>NEW TEMPLATE</div>
        <h1 className={cn(DISPLAY, 'font-semibold text-3xl sm:text-4xl leading-tight mt-1')}>Start from a design</h1>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {TEMPLATE_DESIGN_LIST.map((d) => {
          const rawHtml = d.build({ accent: '#1c6b47', font: 'Barlow', width: 560, dark: false, gradient: false });
          const html = fillTemplateVariables(rawHtml, DEFAULT_SAMPLE_VALUES);
          return (
            <Link
              key={d.key}
              href={`/app/templates/new?design=${d.key}`}
              className="border border-console-border bg-white hover:border-console-accent transition-colors flex flex-col"
            >
              <div className="relative h-[170px] overflow-hidden bg-[#eceee8] border-b border-console-border-soft">
                <iframe title={d.label} srcDoc={html} scrolling="no" className="w-full pointer-events-none" style={{ height: 230 }} />
              </div>
              <div className="p-3.5 text-left">
                <div className={cn(DISPLAY, 'font-semibold text-lg')}>{d.label}</div>
                <div className="text-xs text-console-muted mt-0.5">{d.blurb}</div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default function NewTemplatePage() {
  return (
    <Suspense>
      <NewTemplateContent />
    </Suspense>
  );
}
