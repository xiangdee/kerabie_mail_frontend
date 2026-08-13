import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { customAxiosGet, customAxiosPost, customAxiosDelete, customAxiosRequest } from '@/lib/utils/CustomAxiosRequest';
import { apiLink } from '@/lib/constants/links';
import type { Domain } from '@/lib/types/api.types';

const base = apiLink;

export function useDomains(token: string | null) {
  return useQuery({
    queryKey: ['domains', token],
    queryFn: async () => {
      const res = await customAxiosGet(`${base}/domains`, undefined, token ?? undefined);
      return res.status === true ? (res.response as Domain[]) : ([] as Domain[]);
    },
    enabled: true,
  });
}

export function useAddDomain(token: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (domain: string) =>
      customAxiosPost(`${base}/domains`, { domain }, '', token ?? ''),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['domains'] }),
  });
}

export function useDeleteDomain(token: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      customAxiosDelete(`${base}/domains/${id}`, undefined, token ?? ''),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['domains'] }),
  });
}

export function useVerifyDomain(token: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      customAxiosPost(`${base}/domains/${id}/verify`, {}, '', token ?? ''),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['domains'] }),
  });
}

export function useSetDomainNoReply(token: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (opts: { id: number; no_reply_domain: boolean }) =>
      customAxiosRequest('patch', `${base}/domains/${opts.id}/no-reply`, { no_reply_domain: opts.no_reply_domain }, '', token ?? ''),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['domains'] }),
  });
}

export function useSendDnsInstructions(token: string | null) {
  return useMutation({
    mutationFn: (opts: { domain: string; developer_email: string; developer_name?: string; message?: string }) =>
      customAxiosPost(
        `${base}/mail/send-dns-instructions`,
        {
          email_address: `admin@${opts.domain}`,
          developer_email: opts.developer_email,
          developer_name: opts.developer_name,
          message: opts.message,
        },
        '',
        token ?? ''
      ),
  });
}
