import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { customAxiosGet, customAxiosPost } from '@/lib/utils/CustomAxiosRequest';
import { apiLink } from '@/lib/constants/links';
import type { Subscription } from '@/lib/types/api.types';

const base = apiLink;

export function useSubscription(token: string | null) {
  return useQuery({
    queryKey: ['subscription', token],
    queryFn: async () => {
      if (!token) return null;
      const res = await customAxiosGet(`${base}/subscriptions/current`, undefined, token);
      return res.status === true ? (res.response as Subscription) : null;
    },
    enabled: !!token,
  });
}

export function useCancelSubscription(token: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () =>
      customAxiosPost(`${base}/subscriptions/cancel`, {}, '', token ?? ''),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['subscription'] }),
  });
}

export function useReactivateSubscription(token: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () =>
      customAxiosPost(`${base}/subscriptions/reactivate`, {}, '', token ?? ''),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['subscription'] }),
  });
}
