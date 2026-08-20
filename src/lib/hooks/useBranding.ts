import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { customAxiosGet, customAxiosDelete, customAxiosRequest } from '@/lib/utils/CustomAxiosRequest';
import { apiLink } from '@/lib/constants/links';
import type { Branding } from '@/lib/types/api.types';

const base = apiLink;

export function useBranding(token: string | null) {
  return useQuery({
    queryKey: ['branding', token],
    queryFn: async () => {
      const res = await customAxiosGet(`${base}/branding`, undefined, token ?? undefined);
      return res.status === true ? (res.response as Branding) : ({ enabled: false } as Branding);
    },
  });
}

export function useUpdateBranding(token: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { brand_logo_url?: string | null; brand_color?: string | null; brand_name?: string | null }) =>
      customAxiosRequest('put', `${base}/branding`, data, '', token ?? ''),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['branding'] }),
  });
}

export function useClearBranding(token: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => customAxiosDelete(`${base}/branding`, undefined, token ?? ''),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['branding'] }),
  });
}
