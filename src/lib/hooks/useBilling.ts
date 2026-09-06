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

export interface Addon {
  type: 'extra_storage' | 'extra_mailbox';
  name: string;
  description: string;
  amount: number;
  currency: string;
  symbol: string;
  quantity_increment: number;
}

export interface PlansResponse {
  currency: string;
  plans: Plan[];
  addons: Addon[];
}

export function usePlans(currency?: string) {
  return useQuery<PlansResponse>({
    queryKey: ['plans', currency],
    queryFn: async () => {
      const url = currency
        ? `${base}/pricing/plans?currency=${currency}`
        : `${base}/pricing/plans`;
      const res = await customAxiosGet(url, undefined, '');
      // On success `status` is the literal boolean true; on failure it's a
      // string like 'FORBIDDEN'/'NOT_FOUND' (see extractErrorMessage) — a
      // non-empty string is truthy, so `!res.status` never caught it and
      // res.response (a plain error string on failure) got returned and
      // cast as PlansResponse instead of throwing.
      if (res.status !== true) throw new Error(typeof res.response === 'string' ? res.response : 'Failed to load plans');
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
  addons?: { type: 'extra_storage' | 'extra_mailbox'; quantity: number }[];
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
      // Same bug as useMailboxes.ts's useDeleteMailbox fix: `status` is a
      // non-empty (truthy) error-code STRING on failure, not boolean false,
      // so `!res.status` never caught a real error here — the error string
      // in res.response got returned and cast as CreateSubscriptionResult
      // instead, so result.authorization_url was undefined and the caller
      // redirected to the literal "/app/settings/undefined".
      if (res.status !== true) throw new Error(typeof res.response === 'string' ? res.response : 'Failed to create subscription');
      return res.response as CreateSubscriptionResult;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['subscription'] }),
  });
}

export interface UpgradeSubscriptionPayload {
  new_plan: 'pro' | 'premium';
  new_billing_cycle: 'monthly' | 'yearly';
  prorate?: boolean;
  addons?: { type: 'extra_storage' | 'extra_mailbox'; quantity: number }[];
}

export interface UpgradeSubscriptionResult {
  subscription_id?: number;
  /** Only present for providers that need re-authorization (Flutterwave) —
   * Paddle/Bachs upgrade in place and return no redirect at all, since the
   * change already took effect. */
  authorization_url?: string | null;
  status?: string;
}

/**
 * POST /subscriptions/upgrade — for an ALREADY-ACTIVE paid subscriber
 * moving to a higher tier. Distinct from useCreateSubscription (no
 * existing subscription, or one that's expired/free) and
 * useUpgradeFromTrial (still on the auto-started trial) — /subscriptions/
 * create 400s as "User already has an active subscription" for anyone
 * who should actually be hitting this endpoint instead.
 */
export function useUpgradeExistingSubscription(token: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: UpgradeSubscriptionPayload) => {
      const res = await customAxiosPost(
        `${base}/subscriptions/upgrade`,
        { prorate: true, ...payload },
        '',
        token ?? '',
      );
      if (res.status !== true) throw new Error(typeof res.response === 'string' ? res.response : 'Failed to upgrade subscription');
      return res.response as UpgradeSubscriptionResult;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['subscription'] }),
  });
}

/**
 * Every signup starts a 3-day Pro trial automatically, and /subscriptions/create
 * rejects outright while a TRIAL/ACTIVE/PENDING_PAYMENT subscription already
 * exists — so a trial user upgrading to a paid plan has to go through this
 * endpoint instead, which cancels the trial and starts the paid one. Note the
 * route's own path really does repeat "subscriptions" (a pre-existing quirk
 * on the backend, not a typo here).
 */
export function useUpgradeFromTrial(token: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateSubscriptionPayload) => {
      const res = await customAxiosPost(
        `${base}/subscriptions/subscriptions/upgrade-from-trial`,
        {
          plan: payload.plan,
          billing_cycle: payload.billing_cycle,
          currency: payload.currency,
          addons: payload.addons,
        },
        '',
        token ?? '',
      );
      // Same bug as useMailboxes.ts's useDeleteMailbox fix — see
      // useCreateSubscription above for the full explanation.
      if (res.status !== true) throw new Error(typeof res.response === 'string' ? res.response : 'Failed to upgrade from trial');
      return res.response as CreateSubscriptionResult;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['subscription'] }),
  });
}

// ─── Add-ons on an already-active subscription ────────────────────────────────
//
// Bachs can't modify an existing subscription's line items at all, so buying
// more mailboxes/storage there starts a brand-new, separate recurring
// subscription just for the add-on (see bachs_service.purchase_addon on the
// backend) — each one shows up as its own entry below and can be cancelled
// independently. Paddle merges add-ons into a single quantity on the main
// subscription instead, so `addons` is empty for those and only the totals
// (extra_mailboxes/extra_storage_gb) are meaningful.

export interface AddonSummary {
  payment_method_id: number;
  addon_type: 'extra_mailbox' | 'extra_storage';
  quantity: number;
  price: number;
  status: 'pending_payment' | 'active' | 'cancelled';
}

export interface MyAddonsResult {
  currency: string;
  extra_mailboxes: number;
  extra_storage_gb: number;
  addon_mailbox_price: number;
  addon_storage_price: number;
  addons: AddonSummary[];
}

export function useMyAddons(token: string | null) {
  return useQuery({
    queryKey: ['my-addons', token],
    queryFn: async () => {
      const res = await customAxiosGet(`${base}/subscriptions/addons`, undefined, token ?? undefined);
      return res.status === true ? (res.response as MyAddonsResult) : null;
    },
    enabled: !!token,
  });
}

export interface PurchaseAddonPayload {
  type: 'extra_mailbox' | 'extra_storage';
  quantity: number;
  return_url: string;
}

export interface PurchaseAddonResult {
  /** Present for Bachs (a new checkout to redirect to); absent for Paddle,
   * which updates the existing subscription in place with no redirect. */
  authorization_url?: string | null;
  status?: string;
}

export function usePurchaseAddon(token: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: PurchaseAddonPayload) => {
      const res = await customAxiosPost(`${base}/subscriptions/addons/purchase`, payload, '', token ?? '');
      if (res.status !== true) throw new Error(typeof res.response === 'string' ? res.response : 'Failed to start add-on purchase');
      return res.response as PurchaseAddonResult;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-addons'] });
      qc.invalidateQueries({ queryKey: ['subscription'] });
    },
  });
}

export function useCancelAddon(token: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (paymentMethodId: number) => {
      const res = await customAxiosPost(`${base}/subscriptions/addons/${paymentMethodId}/cancel`, {}, '', token ?? '');
      if (res.status !== true) throw new Error(typeof res.response === 'string' ? res.response : 'Failed to cancel add-on');
      return res.response;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-addons'] });
      qc.invalidateQueries({ queryKey: ['subscription'] });
    },
  });
}
