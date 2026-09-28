import { useQuery } from '@tanstack/react-query';
import { customAxiosGet } from '@/lib/utils/CustomAxiosRequest';
import { apiLink } from '@/lib/constants/links';
import type { Integration } from '@/lib/types/api.types';

const base = apiLink;

export function useIntegrations(token: string | null) {
  return useQuery({
    queryKey: ['integrations', token],
    queryFn: async () => {
      const res = await customAxiosGet(`${base}/integrations`, undefined, token ?? undefined);
      return res.status === true ? ((res.response as { integrations: Integration[] }).integrations) : ([] as Integration[]);
    },
    enabled: true,
    staleTime: 5 * 60_000,
  });
}
