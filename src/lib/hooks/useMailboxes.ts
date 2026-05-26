import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { customAxiosGet, customAxiosPost, customAxiosDelete, customAxiosRequest } from '@/lib/utils/CustomAxiosRequest';
import { apiLink } from '@/lib/constants/links';
import type { Mailbox } from '@/lib/types/api.types';

const base = apiLink;

export function useMailboxes(token: string | null) {
  return useQuery({
    queryKey: ['mailboxes', token],
    queryFn: async () => {
      if (!token) return [] as Mailbox[];
      const res = await customAxiosGet(`${base}/mail/mailboxes`, undefined, token);
      return res.status === true ? (res.response as Mailbox[]) : ([] as Mailbox[]);
    },
    enabled: !!token,
  });
}

export function useCreateMailbox(token: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { email: string; display_name: string; password: string; quota?: number }) =>
      customAxiosPost(`${base}/mail/mailboxes`, data, '', token ?? ''),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['mailboxes'] }),
  });
}

export function useDeleteMailbox(token: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (email: string) =>
      customAxiosDelete(`${base}/mail/mailboxes/${encodeURIComponent(email)}`, undefined, token ?? ''),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['mailboxes'] }),
  });
}

export function useUpdateMailbox(token: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ email, data }: { email: string; data: Record<string, unknown> }) =>
      customAxiosRequest('patch', `${base}/mail/mailboxes/${encodeURIComponent(email)}`, data, '', token ?? ''),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['mailboxes'] }),
  });
}
