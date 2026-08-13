import { useQuery } from '@tanstack/react-query';
import { customAxiosGet } from '@/lib/utils/CustomAxiosRequest';
import { apiLink } from '@/lib/constants/links';
import type { UsageSummary } from '@/lib/types/api.types';

const base = apiLink;

export function useUsage(token: string | null) {
  return useQuery({
    queryKey: ['usage', token],
    queryFn: async () => {
      const res = await customAxiosGet(`${base}/subscriptions/usage`, undefined, token ?? undefined);
      return res.status === true ? (res.response as UsageSummary) : null;
    },
    enabled: true,
    staleTime: 60_000,
  });
}
