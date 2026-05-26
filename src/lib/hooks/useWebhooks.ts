import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { customAxiosGet, customAxiosPost, customAxiosDelete, customAxiosRequest } from '@/lib/utils/CustomAxiosRequest';
import { apiLink } from '@/lib/constants/links';
import type { WebhookEndpoint } from '@/lib/types/api.types';

const base = apiLink;

export function useWebhooks(token: string | null) {
  return useQuery({
    queryKey: ['webhooks', token],
    queryFn: async () => {
      if (!token) return [] as WebhookEndpoint[];
      const res = await customAxiosGet(`${base}/webhooks`, undefined, token);
      return res.status === true ? (res.response as WebhookEndpoint[]) : ([] as WebhookEndpoint[]);
    },
    enabled: !!token,
  });
}

export function useCreateWebhook(token: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { url: string; events: string[]; allowed_ips?: string[] | null }) =>
      customAxiosPost(`${base}/webhooks`, data, '', token ?? ''),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['webhooks'] }),
  });
}

export function useUpdateWebhook(token: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...patch }: { id: number; is_active?: boolean; allowed_ips?: string[] | null }) =>
      customAxiosRequest('patch', `${base}/webhooks/${id}`, patch, '', token ?? ''),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['webhooks'] }),
  });
}

export function useDeleteWebhook(token: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      customAxiosDelete(`${base}/webhooks/${id}`, undefined, token ?? ''),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['webhooks'] }),
  });
}

/** Convenience wrapper — only toggles is_active */
export function useToggleWebhook(token: string | null) {
  const update = useUpdateWebhook(token);
  return {
    ...update,
    mutate: (args: { id: number; is_active: boolean }, options?: Parameters<typeof update.mutate>[1]) =>
      update.mutate(args, options),
    mutateAsync: (args: { id: number; is_active: boolean }) => update.mutateAsync(args),
  };
}
