import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { customAxiosGet, customAxiosPost, customAxiosDelete, customAxiosRequest } from '@/lib/utils/CustomAxiosRequest';
import { apiLink } from '@/lib/constants/links';
import type { ForwardingRule } from '@/lib/types/api.types';

const base = apiLink;

export function useForwarding(mailbox: string, token: string | null) {
  return useQuery({
    queryKey: ['forwarding', mailbox, token],
    queryFn: async () => {
      if (!mailbox) return [] as ForwardingRule[];
      const res = await customAxiosGet(`${base}/forwarding`, { mailbox }, token ?? undefined);
      return res.status === true ? (res.response as ForwardingRule[]) : ([] as ForwardingRule[]);
    },
    enabled: !!mailbox,
  });
}

export function useCreateForwarding(token: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { mailbox: string; destination: string; keep_copy: boolean }) =>
      customAxiosPost(`${base}/forwarding`, data, '', token ?? ''),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['forwarding'] }),
  });
}

export function useDeleteForwarding(token: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      customAxiosDelete(`${base}/forwarding/${id}`, undefined, token ?? ''),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['forwarding'] }),
  });
}

export function useToggleForwarding(token: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, enabled }: { id: number; enabled: boolean }) =>
      customAxiosRequest('patch', `${base}/forwarding/${id}`, { enabled }, '', token ?? ''),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['forwarding'] }),
  });
}
