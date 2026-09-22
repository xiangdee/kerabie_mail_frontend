import { useEffect, useState } from "react";
import { Zap, Crown, Building2, LucideIcon } from "lucide-react";
import { useCurrency, CURRENCY_SYMBOLS, type Currency as CurrencyCode } from "@/lib/utils/useCurrency";
import { useGetUserIpDetails } from "@/lib/utils/useGetUserIpDetails";
import { usePlans, type Plan } from "@/lib/hooks/useBilling";

export const PLAN_ICONS: Record<string, LucideIcon> = {
  free: Zap,
  pro: Crown,
  premium: Building2,
};

const CYCLE_MONTHS: Record<string, number> = {
  monthly: 1,
  yearly: 12,
  biennial: 24,
  triennial: 36,
};

// Real prices come from GET /pricing/plans (see usePlans in useBilling.ts).
// A successful fetch is persisted to localStorage as a cache, which is
// preferred over the hardcoded buildFallbackPlans() below whenever it's
// available, so numbers are live or a real previously-fetched snapshot
// before ever falling back to the hardcoded catalogue.
const CACHE_KEY = 'kerabie:pricing-cache:v1';
const CACHE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 1 week

function readPlansCache(currency: string): Plan[] | null {
  try {
    const raw = localStorage.getItem(`${CACHE_KEY}:${currency}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { plans: Plan[]; cachedAt: number };
    if (!parsed.plans || Date.now() - parsed.cachedAt > CACHE_MAX_AGE_MS) return null;
    return parsed.plans;
  } catch {
    return null;
  }
}

function writePlansCache(currency: string, plans: Plan[]) {
  try {
    localStorage.setItem(`${CACHE_KEY}:${currency}`, JSON.stringify({ plans, cachedAt: Date.now() }));
  } catch {
    // localStorage unavailable (private browsing, quota) — caching is
    // best-effort, not required for the section to work.
  }
}

// Last-resort tier below the live fetch and the localStorage cache: a
// visitor with neither (first visit, API unreachable) still sees real
// plan structure and current list prices instead of a stuck skeleton or
// an empty section. Mirrors the backend's PLANS catalogue and
// PLAN_PRICES table (kerabie-mail-backend/app/routes/pricing.py,
// app/services/plan_pricing.py) — update both sides together if pricing
// changes, since this is never overwritten by a successful fetch's
// numbers automatically.
// Mirrors kerabie-mail-backend/app/services/plan_pricing.py's PLAN_PRICES
// exactly, including its own comment: EUR/GBP/GHS/XAF/XOF are placeholder
// prices derived from the USD price at a fixed reference rate (EUR ~0.92,
// GBP ~0.79, GHS ~11.5, XAF/XOF ~570 per USD, Sept 2026), not live FX —
// update both sides together if these change.
const PRO_PRICES: Record<CurrencyCode, { monthly: number; yearly: number; biennial: number; triennial: number }> = {
  usd: { monthly: 2.80, yearly: 26.88, biennial: 47.04, triennial: 60.48 },
  ngn: { monthly: 3500.00, yearly: 33600.00, biennial: 58800.00, triennial: 75600.00 },
  eur: { monthly: 2.58, yearly: 24.73, biennial: 43.28, triennial: 55.64 },
  gbp: { monthly: 2.21, yearly: 21.24, biennial: 37.16, triennial: 47.78 },
  ghs: { monthly: 32.20, yearly: 309.12, biennial: 540.96, triennial: 695.52 },
  xaf: { monthly: 1596.00, yearly: 15321.60, biennial: 26812.80, triennial: 34473.60 },
  xof: { monthly: 1596.00, yearly: 15321.60, biennial: 26812.80, triennial: 34473.60 },
};

const PREMIUM_PRICES: Record<CurrencyCode, { monthly: number; yearly: number; biennial: number; triennial: number }> = {
  usd: { monthly: 7.50, yearly: 72.00, biennial: 126.00, triennial: 162.00 },
  ngn: { monthly: 7500.00, yearly: 96000.00, biennial: 126000.00, triennial: 162000.00 },
  eur: { monthly: 6.90, yearly: 66.24, biennial: 115.92, triennial: 149.04 },
  gbp: { monthly: 5.93, yearly: 56.88, biennial: 99.54, triennial: 127.98 },
  ghs: { monthly: 86.25, yearly: 828.00, biennial: 1449.00, triennial: 1863.00 },
  xaf: { monthly: 4275.00, yearly: 41040.00, biennial: 71820.00, triennial: 92340.00 },
  xof: { monthly: 4275.00, yearly: 41040.00, biennial: 71820.00, triennial: 92340.00 },
};

function buildFallbackPlans(currency: CurrencyCode): Plan[] {
  const cur = currency.toUpperCase();
  const symbol = CURRENCY_SYMBOLS[currency];
  const cycle = (amount: number) => ({ amount, currency: cur, symbol });

  return [
    {
      id: 'free',
      name: 'Free',
      description: 'Get started with one mailbox',
      billing_cycles: { forever: cycle(0) },
      features: ['1 mailbox', '500 MB storage', '50 emails/day', 'Basic spam filter', 'API access'],
      limits: { mailboxes: 1, storage_gb: 0.5, emails_per_day: 50 },
      highlighted: false,
    },
    {
      id: 'pro',
      name: 'Pro',
      description: 'For professionals and small teams',
      billing_cycles: {
        monthly: cycle(PRO_PRICES[currency].monthly),
        yearly: cycle(PRO_PRICES[currency].yearly),
        biennial: cycle(PRO_PRICES[currency].biennial),
        triennial: cycle(PRO_PRICES[currency].triennial),
      },
      features: [
        '3 mailboxes', '10 GB per mailbox', 'AI compose', 'Calendar & contacts',
        'Read receipts', 'Unsend', 'Custom domain', 'API access',
      ],
      limits: { mailboxes: 3, storage_gb: 10, emails_per_day: -1 },
      highlighted: true,
    },
    {
      id: 'premium',
      name: 'Premium',
      description: 'For businesses that need full control',
      billing_cycles: {
        monthly: cycle(PREMIUM_PRICES[currency].monthly),
        yearly: cycle(PREMIUM_PRICES[currency].yearly),
        biennial: cycle(PREMIUM_PRICES[currency].biennial),
        triennial: cycle(PREMIUM_PRICES[currency].triennial),
      },
      features: [
        '10 mailboxes', '50 GB per mailbox', 'Everything in Pro', 'Shared inboxes',
        'API access', 'Unlimited AI', 'Audit logs', 'Priority support',
      ],
      limits: { mailboxes: 10, storage_gb: 50, emails_per_day: -1 },
      highlighted: false,
    },
  ];
}

export type BillingCycle = 'monthly' | 'yearly' | 'biennial' | 'triennial';

export function usePricingDisplay() {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
  const { userIpDetails, isFetchingUserIp, hasRealIpData } = useGetUserIpDetails();
  const { currency, setCurrency } = useCurrency({ userIpDetails, isFetchingUserIp, hasRealIpData });

  const plansQuery = usePlans(currency.toUpperCase());
  const [cachedPlans, setCachedPlans] = useState<Plan[] | null>(null);

  // Load whatever's cached for this currency as soon as it's selected —
  // gives an instant paint even before the live fetch resolves.
  useEffect(() => {
    setCachedPlans(readPlansCache(currency));
  }, [currency]);

  // A successful live fetch becomes the new cache and immediately supersedes it.
  useEffect(() => {
    if (plansQuery.data?.plans?.length) {
      writePlansCache(currency, plansQuery.data.plans);
      setCachedPlans(plansQuery.data.plans);
    }
  }, [plansQuery.data, currency]);

  // Three tiers, each an instant fallback for the one before it: live fetch
  // → last cached snapshot → hardcoded catalogue. `plans` is therefore never
  // null, not even on the very first render — so a slow or failing /ip or
  // /pricing/plans request can never leave the section stuck on a loading
  // skeleton.
  const plans = plansQuery.data?.plans ?? cachedPlans ?? buildFallbackPlans(currency);
  const usingFallback = !plansQuery.data && !cachedPlans;

  const getBillingCycles = (plan: Plan) => plan.billing_cycles;

  const getCurrentPrice = (plan: Plan) => {
    if (plan.id === 'free') return getBillingCycles(plan).forever?.amount ?? 0;
    return getBillingCycles(plan)[billingCycle]?.amount ?? 0;
  };

  const getOriginalPrice = (plan: Plan) => {
    if (plan.id === 'free' || billingCycle === 'monthly') return null;
    const monthlyAmount = getBillingCycles(plan).monthly?.amount ?? 0;
    return monthlyAmount * (CYCLE_MONTHS[billingCycle] ?? 1);
  };

  const getMonthlyEquivalent = (plan: Plan) => {
    if (plan.id === 'free') return null;
    const total = getCurrentPrice(plan);
    return (total / (CYCLE_MONTHS[billingCycle] ?? 1)).toFixed(2);
  };

  const getSavings = (plan: Plan) => {
    if (plan.id === 'free') return undefined;
    const savings: Partial<Record<'yearly' | 'biennial' | 'triennial', number>> = {};
    const monthlyAmount = getBillingCycles(plan).monthly?.amount ?? 0;
    if (!monthlyAmount) return undefined;
    (['yearly', 'biennial', 'triennial'] as const).forEach((cycle) => {
      const cycleAmount = getBillingCycles(plan)[cycle]?.amount;
      if (cycleAmount == null) return;
      const fullPrice = monthlyAmount * CYCLE_MONTHS[cycle];
      savings[cycle] = Math.round((1 - cycleAmount / fullPrice) * 100);
    });
    return savings;
  };

  return {
    billingCycle,
    setBillingCycle,
    currency,
    setCurrency,
    plans,
    usingFallback,
    getCurrentPrice,
    getOriginalPrice,
    getMonthlyEquivalent,
    getSavings,
  };
}
