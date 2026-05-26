import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { customAxiosGet, customAxiosPost, customAxiosDelete } from '@/lib/utils/CustomAxiosRequest';
import { apiLink } from '@/lib/constants/links';
import type { EmailAlias } from '@/lib/types/api.types';

const base = apiLink;

export function useAliases(token: string | null) {
  return useQuery({
    queryKey: ['aliases', token],
    queryFn: async () => {
      if (!token) return [] as EmailAlias[];
      const res = await customAxiosGet(`${base}/mail/aliases`, undefined, token);
      return res.status === true ? (res.response as EmailAlias[]) : ([] as EmailAlias[]);
    },
    enabled: !!token,
  });
}

export function useCreateAlias(token: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { mailbox: string; alias_address: string }) =>
      customAxiosPost(`${base}/mail/aliases`, data, '', token ?? ''),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['aliases'] }),
  });
}

export function useDeleteAlias(token: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      customAxiosDelete(`${base}/mail/aliases/${id}`, undefined, token ?? ''),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['aliases'] }),
  });
}
