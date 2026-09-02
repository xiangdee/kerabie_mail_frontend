import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { customAxiosGet, customAxiosPost, customAxiosDelete, customAxiosRequest } from '@/lib/utils/CustomAxiosRequest';
import { apiLink } from '@/lib/constants/links';

const base = apiLink;

export interface EmailTemplate {
  id: number;
  name: string;
  subject: string | null;
  body_html: string;
  is_shared: boolean;
  // Opaque JSON-encoded block/section document — null for templates saved
  // before the block editor existed (those open in legacy raw-HTML mode).
  content_json?: string | null;
}

interface TemplatePage {
  items: EmailTemplate[];
  total: number;
  has_more: boolean;
}

export function useTemplates(token: string | null) {
  return useQuery({
    queryKey: ['templates', token],
    queryFn: async () => {
      const res = await customAxiosGet(`${base}/mail/templates`, { page_size: 100 }, token ?? undefined);
      return res.status === true ? ((res.response as TemplatePage).items ?? []) : ([] as EmailTemplate[]);
    },
    enabled: true,
  });
}

export function useTemplate(token: string | null, id: number | null) {
  return useQuery({
    queryKey: ['template', id, token],
    queryFn: async () => {
      const res = await customAxiosGet(`${base}/mail/templates/${id}`, undefined, token ?? undefined);
      return res.status === true ? (res.response as EmailTemplate) : null;
    },
    enabled: id != null,
  });
}

export function useCreateTemplate(token: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; subject?: string; body_html: string; is_shared?: boolean; content_json?: string }) =>
      customAxiosPost(`${base}/mail/templates`, data, '', token ?? ''),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['templates'] }),
  });
}

export function useUpdateTemplate(token: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...patch }: { id: number; name?: string; subject?: string; body_html?: string; is_shared?: boolean; content_json?: string }) =>
      customAxiosRequest('patch', `${base}/mail/templates/${id}`, patch, '', token ?? ''),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['templates'] }),
  });
}

export interface TemplateAsset {
  id: number;
  url: string;
  content_type: string;
  size_bytes: number;
  created_at: string;
}

export function useTemplateImageGallery(token: string | null) {
  return useQuery({
    queryKey: ['template-image-gallery', token],
    queryFn: async () => {
      const res = await customAxiosGet(`${base}/mail/templates/images`, undefined, token ?? undefined);
      return res.status === true ? (res.response as TemplateAsset[]) : ([] as TemplateAsset[]);
    },
    // NOT gated on !!token — this app is httpOnly-cookie authenticated
    // (useAuth().token is always null by design, see auth.context.tsx),
    // so an `enabled: !!token` guard here would never run at all. Matches
    // useTemplates() above, which is unconditionally enabled for the same
    // reason.
    enabled: true,
    // The gallery only changes via upload/delete, both of which already
    // invalidate this key explicitly — no need to refetch on every editor
    // mount or window refocus in between.
    staleTime: 60_000,
  });
}

export function useDeleteTemplateImage(token: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => customAxiosDelete(`${base}/mail/templates/images/${id}`, undefined, token ?? ''),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['template-image-gallery'] }),
  });
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Uploads go through a Celery queue (job_id back immediately, then polled)
// rather than blocking the request on the B2 PUT — the caller shows the
// picked file right away via a local blob preview and swaps in this real
// URL once the job finishes.
export function useUploadTemplateImage(token: string | null) {
  const qc = useQueryClient();
  return useMutation({
    onSuccess: (res) => { if (res.status === true) qc.invalidateQueries({ queryKey: ['template-image-gallery'] }); },
    mutationFn: async (file: File) => {
      const queued = await customAxiosPost(`${base}/mail/templates/upload-image`, { file }, 'upload', token ?? '');
      if (queued.status !== true) return queued;
      const jobId = (queued.response as { job_id: string }).job_id;

      for (let attempt = 0; attempt < 40; attempt++) {
        await sleep(1000);
        const poll = await customAxiosGet(`${base}/mail/templates/upload-image/${jobId}`, undefined, token ?? undefined);
        if (poll.status !== true) return poll;
        const body = poll.response as { status: 'pending' | 'done' | 'failed'; url?: string; error?: string };
        if (body.status === 'done') {
          return { status: true, response: { url: body.url }, statusCode: 200 };
        }
        if (body.status === 'failed') {
          return { status: false, response: body.error ?? 'Upload failed.', statusCode: 500 };
        }
      }
      return { status: false, response: 'Upload timed out.', statusCode: 504 };
    },
  });
}

export function useDeleteTemplate(token: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      customAxiosDelete(`${base}/mail/templates/${id}`, undefined, token ?? ''),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['templates'] }),
  });
}

// Matches the real POST /mail/send request shape (app/schemas/send.py) —
// not the stale, unused SendEmailRequest in api.types.ts (mailbox/body_text
// field names don't match anything the backend actually accepts).
export function useSendWithTemplate(token: string | null) {
  return useMutation({
    mutationFn: (data: {
      from_email: string;
      to: string[];
      template_id: number;
      variables?: Record<string, string>;
    }) => customAxiosPost(`${base}/mail/send`, data, '', token ?? ''),
  });
}
