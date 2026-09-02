import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { customAxiosGet, customAxiosPost, customAxiosDelete, customAxiosRequest } from '@/lib/utils/CustomAxiosRequest';
import { apiLink } from '@/lib/constants/links';
import type { ForwardingRule } from '@/lib/types/api.types';

const base = apiLink;

// Backend's ForwardingOut shape ({email, forward_to, is_active, is_confirmed})
// doesn't match this hook's caller-facing ForwardingRule shape
// ({mailbox, destination, enabled}) — map it here rather than in the view.
interface ForwardingOut {
  id: number;
  email: string;
  forward_to: string;
  keep_copy: boolean;
  is_active: boolean;
  is_confirmed: boolean;
}

export function useForwarding(mailbox: string, token: string | null) {
  return useQuery({
    queryKey: ['forwarding', mailbox, token],
    queryFn: async () => {
      if (!mailbox) return [] as ForwardingRule[];
      const res = await customAxiosGet(`${base}/mail/forwarding`, { mailbox }, token ?? undefined);
      if (res.status !== true) return [] as ForwardingRule[];
      return (res.response as ForwardingOut[])
        .filter((r) => r.email === mailbox)
        .map((r): ForwardingRule => ({
          id: r.id,
          mailbox: r.email,
          destination: r.forward_to,
          keep_copy: r.keep_copy,
          enabled: r.is_active,
        }));
    },
    enabled: !!mailbox,
  });
}

export function useCreateForwarding(token: string | null) {
  const qc = useQueryClient();
  return useMutation({
    // Backend's ForwardingCreate expects {email, forward_to, keep_copy} —
    // translate from this hook's caller-facing {mailbox, destination} names.
    mutationFn: (data: { mailbox: string; destination: string; keep_copy: boolean }) =>
      customAxiosPost(`${base}/mail/forwarding`, {
        email: data.mailbox,
        forward_to: data.destination,
        keep_copy: data.keep_copy,
      }, '', token ?? ''),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['forwarding'] }),
  });
}

export function useDeleteForwarding(token: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      customAxiosDelete(`${base}/mail/forwarding/${id}`, undefined, token ?? ''),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['forwarding'] }),
  });
}

export function useToggleForwarding(token: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, enabled }: { id: number; enabled: boolean }) =>
      customAxiosRequest('patch', `${base}/mail/forwarding/${id}`, { enabled }, '', token ?? ''),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['forwarding'] }),
  });
}
