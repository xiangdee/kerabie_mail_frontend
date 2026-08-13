import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { customAxiosGet, customAxiosPost, customAxiosDelete, customAxiosRequest } from '@/lib/utils/CustomAxiosRequest';
import { apiLink } from '@/lib/constants/links';
import type { ApiKey } from '@/lib/types/api.types';

const base = apiLink;

export function useApiKeys(token: string | null) {
  return useQuery({
    queryKey: ['api-keys', token],
    queryFn: async () => {
      const res = await customAxiosGet(`${base}/api-keys`, undefined, token ?? undefined);
      return res.status === true ? (res.response as ApiKey[]) : ([] as ApiKey[]);
    },
    enabled: true,
  });
}

export function useCreateApiKey(token: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; scopes: string[]; expires_at?: string; allowed_ips?: string[] | null }) =>
      customAxiosPost(`${base}/api-keys`, data, '', token ?? ''),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['api-keys'] }),
  });
}

export function useUpdateApiKey(token: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...patch }: { id: number; allowed_ips: string[] | null }) =>
      customAxiosRequest('patch', `${base}/api-keys/${id}`, patch, '', token ?? ''),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['api-keys'] }),
  });
}

export function useDeleteApiKey(token: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      customAxiosDelete(`${base}/api-keys/${id}`, undefined, token ?? ''),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['api-keys'] }),
  });
}
