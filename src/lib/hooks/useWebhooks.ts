import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { customAxiosGet, customAxiosPost, customAxiosDelete, customAxiosRequest } from '@/lib/utils/CustomAxiosRequest';
import { apiLink } from '@/lib/constants/links';
import type { WebhookEndpoint, WebhookDelivery } from '@/lib/types/api.types';

const base = apiLink;

export function useWebhookEvents() {
  return useQuery({
    queryKey: ['webhook-events'],
    queryFn: async () => {
      const res = await customAxiosGet(`${base}/webhooks/events`, undefined, undefined);
      return res.status === true ? ((res.response as { events: string[] }).events) : ([] as string[]);
    },
    staleTime: 60 * 60_000, // essentially static — a fresh list per session is plenty
  });
}

export function useWebhooks(token: string | null) {
  return useQuery({
    queryKey: ['webhooks', token],
    queryFn: async () => {
      const res = await customAxiosGet(`${base}/webhooks`, undefined, token ?? undefined);
      return res.status === true ? (res.response as WebhookEndpoint[]) : ([] as WebhookEndpoint[]);
    },
    enabled: true,
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

export function useRotateWebhookSecret(token: string | null) {
  return useMutation({
    mutationFn: (id: number) =>
      customAxiosPost(`${base}/webhooks/${id}/rotate-secret`, {}, '', token ?? ''),
  });
}

export function useTestWebhook(token: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      customAxiosPost(`${base}/webhooks/${id}/test`, {}, '', token ?? ''),
    onSuccess: (_res, id) => qc.invalidateQueries({ queryKey: ['webhook-deliveries', id] }),
  });
}

export function useWebhookDeliveries(token: string | null, id: number | null) {
  return useQuery({
    queryKey: ['webhook-deliveries', id, token],
    queryFn: async () => {
      const res = await customAxiosGet(`${base}/webhooks/${id}/deliveries`, undefined, token ?? undefined);
      return res.status === true ? (res.response as WebhookDelivery[]) : ([] as WebhookDelivery[]);
    },
    enabled: id != null,
    refetchInterval: (query) => (query.state.data?.some((d) => d.status === 'pending') ? 3000 : false),
  });
}

export function useRetryWebhookDelivery(token: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ endpointId, deliveryId }: { endpointId: number; deliveryId: number }) =>
      customAxiosPost(`${base}/webhooks/${endpointId}/deliveries/${deliveryId}/retry`, {}, '', token ?? ''),
    onSuccess: (_res, { endpointId }) => qc.invalidateQueries({ queryKey: ['webhook-deliveries', endpointId] }),
  });
}
