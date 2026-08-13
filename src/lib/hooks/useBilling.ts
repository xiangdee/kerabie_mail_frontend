import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { customAxiosGet, customAxiosPost } from '@/lib/utils/CustomAxiosRequest';
import { apiLink } from '@/lib/constants/links';
import type { Subscription } from '@/lib/types/api.types';

const base = apiLink;

// ─── Pricing ──────────────────────────────────────────────────────────────────

export interface PlanCycle {
  amount: number;
  currency: string;
  symbol: string;
}

export interface Plan {
  id: 'free' | 'pro' | 'premium';
  name: string;
  description: string;
  billing_cycles: Record<string, PlanCycle>;
  features: string[];
  limits: { mailboxes: number; storage_gb: number; emails_per_day: number };
  highlighted: boolean;
}

export interface PlansResponse {
  currency: string;
  plans: Plan[];
}

export function usePlans(currency?: string) {
  return useQuery<PlansResponse>({
    queryKey: ['plans', currency],
    queryFn: async () => {
      const url = currency
        ? `${base}/pricing/plans?currency=${currency}`
        : `${base}/pricing/plans`;
      const res = await customAxiosGet(url, undefined, '');
      if (!res.status) throw new Error('Failed to load plans');
      return res.response as PlansResponse;
    },
    staleTime: 1000 * 60 * 60, // 1 hour — prices don't change often
  });
}

export function useSubscription(token: string | null) {
  return useQuery({
    queryKey: ['subscription', token],
    queryFn: async () => {
      const res = await customAxiosGet(`${base}/subscriptions/me`, undefined, token ?? undefined);
      return res.status === true ? (res.response as Subscription) : null;
    },
    enabled: true,
  });
}

export function useCancelSubscription(token: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () =>
      customAxiosPost(`${base}/subscriptions/cancel`, {}, '', token ?? ''),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['subscription'] }),
  });
}

export function useReactivateSubscription(token: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () =>
      customAxiosPost(`${base}/subscriptions/reactivate`, {}, '', token ?? ''),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['subscription'] }),
  });
}

export type RefundReason =
  | 'cancellation'
  | 'duplicate_charge'
  | 'service_not_received'
  | 'technical_issue'
  | 'other';

export interface RefundRequestPayload {
  transaction_id: number;
  reason: RefundReason;
  reason_detail?: string;
}

export interface RefundRequest {
  id: number;
  status: string;
  reason: string;
  amount_requested: number;
  currency: string;
  requested_at: string;
  provider: string;
  admin_note?: string;
}

export function useRequestRefund(token: string | null) {
  return useMutation({
    mutationFn: (payload: RefundRequestPayload) =>
      customAxiosPost(`${base}/refunds/request`, payload, '', token ?? ''),
  });
}

export function useMyRefunds(token: string | null) {
  return useQuery({
    queryKey: ['my-refunds', token],
    queryFn: async () => {
      const res = await customAxiosGet(`${base}/refunds/my`, undefined, token ?? undefined);
      return res.status === true ? (res.response as RefundRequest[]) : [];
    },
    enabled: true,
  });
}

export interface CreateSubscriptionPayload {
  plan: 'pro' | 'premium';
  billing_cycle: 'monthly' | 'yearly';
  currency: 'ngn' | 'usd';
  /** Flutterwave redirects here after payment */
  return_url: string;
  country_code?: string;
}

export interface CreateSubscriptionResult {
  subscription_id: number;
  reference: string;
  /** Flutterwave-hosted payment page — redirect the user here */
  authorization_url: string;
  status: string;
}

export function useCreateSubscription(token: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateSubscriptionPayload) => {
      const res = await customAxiosPost(
        `${base}/subscriptions/create`,
        payload,
        '',
        token ?? '',
      );
      if (!res.status) throw new Error((res as any)?.message ?? 'Failed to create subscription');
      return res.response as CreateSubscriptionResult;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['subscription'] }),
  });
}
