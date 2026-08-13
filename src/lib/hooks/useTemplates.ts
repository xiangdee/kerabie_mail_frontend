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

export function useCreateTemplate(token: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; subject?: string; body_html: string; is_shared?: boolean }) =>
      customAxiosPost(`${base}/mail/templates`, data, '', token ?? ''),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['templates'] }),
  });
}

export function useUpdateTemplate(token: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...patch }: { id: number; name?: string; subject?: string; body_html?: string; is_shared?: boolean }) =>
      customAxiosRequest('patch', `${base}/mail/templates/${id}`, patch, '', token ?? ''),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['templates'] }),
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
