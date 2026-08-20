import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { customAxiosGet, customAxiosPost, customAxiosDelete, customAxiosRequest } from '@/lib/utils/CustomAxiosRequest';
import { apiLink } from '@/lib/constants/links';
import type {
  Campaign, CampaignStep, CampaignStats, CampaignAnalytics, ContactGroup, SegmentCondition,
} from '@/lib/types/api.types';

const base = apiLink;

export function useContactGroups(token: string | null) {
  return useQuery({
    queryKey: ['contact-groups', token],
    queryFn: async () => {
      const res = await customAxiosGet(`${base}/contacts/groups`, undefined, token ?? undefined);
      return res.status === true ? (res.response as ContactGroup[]) : ([] as ContactGroup[]);
    },
  });
}

export function useCampaigns(token: string | null) {
  return useQuery({
    queryKey: ['campaigns', token],
    queryFn: async () => {
      const res = await customAxiosGet(`${base}/campaigns`, undefined, token ?? undefined);
      return res.status === true ? (res.response as Campaign[]) : ([] as Campaign[]);
    },
  });
}

export function useCampaign(id: number | null, token: string | null) {
  return useQuery({
    queryKey: ['campaign', id, token],
    queryFn: async () => {
      const res = await customAxiosGet(`${base}/campaigns/${id}`, undefined, token ?? undefined);
      return res.status === true ? (res.response as Campaign) : null;
    },
    enabled: id !== null,
  });
}

export interface CampaignCreateInput {
  from_email: string;
  name: string;
  subject: string;
  body_html: string;
  group_id?: number | null;
  segment_filter?: SegmentCondition[] | null;
}

export function useCreateCampaign(token: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CampaignCreateInput) => customAxiosPost(`${base}/campaigns`, data, '', token ?? ''),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['campaigns'] }),
  });
}

export interface CampaignUpdateInput {
  name?: string;
  subject?: string;
  body_html?: string;
  group_id?: number | null;
  segment_filter?: SegmentCondition[] | null;
}

export function useUpdateCampaign(id: number, token: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CampaignUpdateInput) => customAxiosRequest('put', `${base}/campaigns/${id}`, data, '', token ?? ''),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['campaigns'] });
      qc.invalidateQueries({ queryKey: ['campaign', id] });
    },
  });
}

export function useDeleteCampaign(token: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => customAxiosDelete(`${base}/campaigns/${id}`, undefined, token ?? ''),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['campaigns'] }),
  });
}

export function useSendCampaign(id: number, token: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => customAxiosPost(`${base}/campaigns/${id}/send`, undefined, '', token ?? ''),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['campaigns'] });
      qc.invalidateQueries({ queryKey: ['campaign', id] });
    },
  });
}

export function useCampaignStats(id: number | null, token: string | null) {
  return useQuery({
    queryKey: ['campaign-stats', id, token],
    queryFn: async () => {
      const res = await customAxiosGet(`${base}/campaigns/${id}/stats`, undefined, token ?? undefined);
      return res.status === true ? (res.response as CampaignStats) : null;
    },
    enabled: id !== null,
    refetchInterval: 15_000,
  });
}

export function useCampaignAnalytics(id: number | null, token: string | null) {
  return useQuery({
    queryKey: ['campaign-analytics', id, token],
    queryFn: async () => {
      const res = await customAxiosGet(`${base}/campaigns/${id}/analytics`, undefined, token ?? undefined);
      return res.status === true ? (res.response as CampaignAnalytics) : null;
    },
    enabled: id !== null,
    refetchInterval: 15_000,
  });
}

export function useCampaignSteps(id: number | null, token: string | null) {
  return useQuery({
    queryKey: ['campaign-steps', id, token],
    queryFn: async () => {
      const res = await customAxiosGet(`${base}/campaigns/${id}/steps`, undefined, token ?? undefined);
      return res.status === true ? (res.response as CampaignStep[]) : ([] as CampaignStep[]);
    },
    enabled: id !== null,
  });
}

export interface CampaignStepInput {
  delay_hours: number;
  subject: string;
  subject_b?: string | null;
  ab_split_percent: number;
  body_html: string;
}

export function useAddCampaignStep(campaignId: number, token: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CampaignStepInput) => customAxiosPost(`${base}/campaigns/${campaignId}/steps`, data, '', token ?? ''),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['campaign-steps', campaignId] }),
  });
}

export function useDeleteCampaignStep(campaignId: number, token: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (stepId: number) => customAxiosDelete(`${base}/campaigns/${campaignId}/steps/${stepId}`, undefined, token ?? ''),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['campaign-steps', campaignId] }),
  });
}
