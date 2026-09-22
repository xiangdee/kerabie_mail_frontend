import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { customAxiosGet, customAxiosPost, customAxiosDelete, customAxiosRequest } from '@/lib/utils/CustomAxiosRequest';
import { apiLink } from '@/lib/constants/links';
import type { HostingMailbox, HostingPlan, LapseAction, Partner, PartnerClient, PartnerDomain } from '@/lib/types/api.types';

const base = apiLink;

// Backend router is mounted at /partners (plural) — app/routes/partner.py's
// `router = APIRouter(prefix="/partners", ...)`. Every hook below used to
// call `/partner/...` (singular), 404ing against every single one of these
// endpoints — the whole Partner Programme page was unreachable.

export function usePartner(token: string | null) {
  return useQuery({
    queryKey: ['partner', token],
    queryFn: async () => {
      const res = await customAxiosGet(`${base}/partners/me`, undefined, token ?? undefined);
      return res.status === true ? (res.response as Partner) : null;
    },
    enabled: true,
  });
}

export function useHostingMailboxes(token: string | null) {
  return useQuery({
    queryKey: ['hosting-mailboxes', token],
    queryFn: async () => {
      const res = await customAxiosGet(`${base}/partners/hosting/mailboxes`, undefined, token ?? undefined);
      return res.status === true ? (res.response as HostingMailbox[]) : ([] as HostingMailbox[]);
    },
    enabled: true,
  });
}

export function useApplyForPartner(token: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { payout_method: string; payout_details: Record<string, string> }) =>
      customAxiosPost(`${base}/partners/apply`, data, '', token ?? ''),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['partner'] }),
  });
}

// ── Hosting: clients ─────────────────────────────────────────────────────────

export function useHostingClients(token: string | null) {
  return useQuery({
    queryKey: ['hosting-clients', token],
    queryFn: async () => {
      const res = await customAxiosGet(`${base}/partners/hosting/clients`, undefined, token ?? undefined);
      return res.status === true ? (res.response as PartnerClient[]) : ([] as PartnerClient[]);
    },
    enabled: true,
  });
}

export function useCreateHostingClient(token: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (name: string) =>
      customAxiosPost(`${base}/partners/hosting/clients`, { name }, '', token ?? ''),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['hosting-clients'] }),
  });
}

export function useUpdateHostingClient(token: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (opts: { id: number; name?: string; lapse_action_override?: LapseAction | null }) =>
      customAxiosRequest('patch', `${base}/partners/hosting/clients/${opts.id}`, {
        name: opts.name, lapse_action_override: opts.lapse_action_override,
      }, '', token ?? ''),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['hosting-clients'] }),
  });
}

export function useDeleteHostingClient(token: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      customAxiosDelete(`${base}/partners/hosting/clients/${id}`, undefined, token ?? ''),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['hosting-clients'] }),
  });
}

// ── Hosting: domains ──────────────────────────────────────────────────────────

export function useHostingDomains(token: string | null) {
  return useQuery({
    queryKey: ['hosting-domains', token],
    queryFn: async () => {
      const res = await customAxiosGet(`${base}/partners/hosting/domains`, undefined, token ?? undefined);
      return res.status === true ? (res.response as PartnerDomain[]) : ([] as PartnerDomain[]);
    },
    enabled: true,
  });
}

export function useAddHostingDomain(token: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (opts: { domain_name: string; client_id?: number }) =>
      customAxiosPost(`${base}/partners/hosting/domains`, opts, '', token ?? ''),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['hosting-domains'] });
      qc.invalidateQueries({ queryKey: ['hosting-clients'] });
    },
  });
}

// ── Hosting: settings ─────────────────────────────────────────────────────────

export function useUpdateHostingSettings(token: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (default_client_lapse_action: LapseAction) =>
      customAxiosRequest('patch', `${base}/partners/hosting/settings`, { default_client_lapse_action }, '', token ?? ''),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['partner'] }),
  });
}

// ── Hosting: plans + mailbox provisioning ─────────────────────────────────────

export function useHostingPlans(token: string | null) {
  return useQuery({
    queryKey: ['hosting-plans', token],
    queryFn: async () => {
      const res = await customAxiosGet(`${base}/partners/hosting/plans`, undefined, token ?? undefined);
      return res.status === true ? (res.response.plans as HostingPlan[]) : ([] as HostingPlan[]);
    },
    enabled: true,
  });
}

export interface ProvisionHostingMailboxInput {
  domain_id: number;
  local_part: string;
  display_name?: string;
  password: string;
  plan_id: string;
}

export function useProvisionHostingMailbox(token: string | null) {
  const qc = useQueryClient();
  return useMutation({
    // funding_mode is intentionally left at the backend's default ("slot" —
    // draws from the partner's trial/prepaid pool). "pay_as_you_go" needs a
    // retail-price map + checkout-redirect flow that's a separate feature.
    mutationFn: (data: ProvisionHostingMailboxInput) =>
      customAxiosPost(`${base}/partners/hosting/mailboxes`, data, '', token ?? ''),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['hosting-mailboxes'] });
      qc.invalidateQueries({ queryKey: ['hosting-clients'] });
      qc.invalidateQueries({ queryKey: ['partner'] });
    },
  });
}
