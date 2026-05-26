import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { customAxiosGet, customAxiosPost, customAxiosDelete } from '@/lib/utils/CustomAxiosRequest';
import { apiLink } from '@/lib/constants/links';
import type { Domain } from '@/lib/types/api.types';

const base = apiLink;

export function useDomains(token: string | null) {
  return useQuery({
    queryKey: ['domains', token],
    queryFn: async () => {
      if (!token) return [] as Domain[];
      const res = await customAxiosGet(`${base}/domains`, undefined, token);
      return res.status === true ? (res.response as Domain[]) : ([] as Domain[]);
    },
    enabled: !!token,
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
