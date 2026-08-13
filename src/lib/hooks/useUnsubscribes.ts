import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { customAxiosGet, customAxiosDelete } from '@/lib/utils/CustomAxiosRequest';
import { apiLink } from '@/lib/constants/links';
import type { SenderUnsubscribe } from '@/lib/types/api.types';

const base = apiLink;

interface UnsubscribesResponse {
  total: number;
  page: number;
  per_page: number;
  unsubscribes: SenderUnsubscribe[];
}

export function useUnsubscribes(mailbox: string, token: string | null) {
  return useQuery({
    queryKey: ['unsubscribes', mailbox, token],
    queryFn: async () => {
      if (!mailbox) return { total: 0, page: 1, per_page: 50, unsubscribes: [] } as UnsubscribesResponse;
      const res = await customAxiosGet(`${base}/mail/unsubscribes`, { email: mailbox }, token ?? undefined);
      return res.status === true
        ? (res.response as UnsubscribesResponse)
        : ({ total: 0, page: 1, per_page: 50, unsubscribes: [] } as UnsubscribesResponse);
    },
    enabled: !!mailbox,
  });
}

export function useDeleteUnsubscribe(token: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      customAxiosDelete(`${base}/mail/unsubscribes/${id}`, undefined, token ?? ''),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['unsubscribes'] }),
  });
}
