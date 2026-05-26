import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { customAxiosGet, customAxiosPost } from '@/lib/utils/CustomAxiosRequest';
import { apiLink } from '@/lib/constants/links';
import type { Partner, HostingMailbox } from '@/lib/types/api.types';

const base = apiLink;

export function usePartner(token: string | null) {
  return useQuery({
    queryKey: ['partner', token],
    queryFn: async () => {
      if (!token) return null;
      const res = await customAxiosGet(`${base}/partner/me`, undefined, token);
      return res.status === true ? (res.response as Partner) : null;
    },
    enabled: !!token,
  });
}

export function useHostingMailboxes(token: string | null) {
  return useQuery({
    queryKey: ['hosting-mailboxes', token],
    queryFn: async () => {
      if (!token) return [] as HostingMailbox[];
      const res = await customAxiosGet(`${base}/partner/hosting/mailboxes`, undefined, token);
      return res.status === true ? (res.response as HostingMailbox[]) : ([] as HostingMailbox[]);
    },
    enabled: !!token,
  });
}

export function useApplyForPartner(token: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { payout_method: string; payout_details: Record<string, string> }) =>
      customAxiosPost(`${base}/partner/apply`, data, '', token ?? ''),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['partner'] }),
  });
}

export function useRequestHostingTrial(token: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { email_address: string; domain: string; display_name?: string }) =>
      customAxiosPost(`${base}/partner/hosting/trial`, data, '', token ?? ''),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['hosting-mailboxes'] }),
  });
}
