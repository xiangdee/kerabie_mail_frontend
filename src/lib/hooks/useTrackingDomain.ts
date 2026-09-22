import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { customAxiosGet, customAxiosPost, customAxiosDelete } from '@/lib/utils/CustomAxiosRequest';
import { apiLink } from '@/lib/constants/links';

const base = apiLink;

export interface TrackingDomain {
  enabled: boolean; // whether the account's plan allows this at all
  hostname?: string | null;
  status?: 'pending' | 'verified' | 'removed' | null;
  verification_records?: string | null; // JSON-encoded list of {type, name, value}
  verified_at?: string | null;
}

export function useTrackingDomain(token: string | null) {
  return useQuery({
    queryKey: ['tracking-domain', token],
    queryFn: async () => {
      const res = await customAxiosGet(`${base}/mail/tracking-domain`, undefined, token ?? undefined);
      return res.status === true ? (res.response as TrackingDomain) : ({ enabled: false } as TrackingDomain);
    },
    // Poll while pending, matching the backend's own "poll on read" —
    // mirrors useWebmailCustomDomain's identical reasoning.
    refetchInterval: (query) => (query.state.data?.status === 'pending' ? 5000 : false),
  });
}

export function useCreateTrackingDomain(token: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (hostname: string) => customAxiosPost(`${base}/mail/tracking-domain`, { hostname }, '', token ?? ''),
    onSuccess: (res) => { if (res.status === true) qc.invalidateQueries({ queryKey: ['tracking-domain'] }); },
  });
}

export function useDeleteTrackingDomain(token: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => customAxiosDelete(`${base}/mail/tracking-domain`, undefined, token ?? ''),
    onSuccess: (res) => { if (res.status === true) qc.invalidateQueries({ queryKey: ['tracking-domain'] }); },
  });
}
