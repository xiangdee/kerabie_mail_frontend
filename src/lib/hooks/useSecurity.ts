import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { customAxiosGet, customAxiosDelete } from '@/lib/utils/CustomAxiosRequest';
import { apiLink } from '@/lib/constants/links';

const base = apiLink;

export interface Session {
  id: number;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  last_active_at: string | null;
  is_current: boolean;
}

export function useSessions(token: string | null) {
  return useQuery({
    queryKey: ['sessions', token],
    queryFn: async () => {
      const res = await customAxiosGet(`${base}/auth/sessions`, undefined, token ?? undefined);
      return res.status === true ? (res.response as Session[]) : ([] as Session[]);
    },
    enabled: true,
  });
}

export function useRevokeSession(token: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      customAxiosDelete(`${base}/auth/sessions/${id}`, undefined, token ?? ''),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sessions'] }),
  });
}

export function useRevokeAllSessions(token: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () =>
      customAxiosDelete(`${base}/auth/sessions`, undefined, token ?? ''),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sessions'] }),
  });
}
