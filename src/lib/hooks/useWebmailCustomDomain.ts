import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { customAxiosGet, customAxiosPost, customAxiosDelete } from '@/lib/utils/CustomAxiosRequest';
import { apiLink } from '@/lib/constants/links';

const base = apiLink;

export interface WebmailCustomDomain {
  enabled: boolean; // whether the account's plan/partner status allows this at all
  hostname?: string | null;
  status?: 'pending' | 'verified' | 'failed' | 'removed' | null;
  verification_records?: string | null; // JSON-encoded list of {type, name, value}
  verified_at?: string | null;
}

export function useWebmailCustomDomain(token: string | null) {
  return useQuery({
    queryKey: ['webmail-custom-domain', token],
    queryFn: async () => {
      const res = await customAxiosGet(`${base}/webmail/custom-domain`, undefined, token ?? undefined);
      return res.status === true ? (res.response as WebmailCustomDomain) : ({ enabled: false } as WebmailCustomDomain);
    },
    // Poll while a domain is pending verification, matching the same "poll
    // on read" the backend does rather than push status. Stops once
    // verified/failed/absent.
    refetchInterval: (query) => (query.state.data?.status === 'pending' ? 5000 : false),
  });
}

export function useCreateWebmailCustomDomain(token: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (hostname: string) => customAxiosPost(`${base}/webmail/custom-domain`, { hostname }, '', token ?? ''),
    onSuccess: (res) => { if (res.status === true) qc.invalidateQueries({ queryKey: ['webmail-custom-domain'] }); },
  });
}

export function useDeleteWebmailCustomDomain(token: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => customAxiosDelete(`${base}/webmail/custom-domain`, undefined, token ?? ''),
    onSuccess: (res) => { if (res.status === true) qc.invalidateQueries({ queryKey: ['webmail-custom-domain'] }); },
  });
}
