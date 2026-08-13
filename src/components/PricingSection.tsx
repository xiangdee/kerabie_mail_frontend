'use client';
import { Zap, Crown, Building2, LucideIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Card } from "./ui/card";
import PricingCard from "./PricingCard";
import { useCurrency } from "@/lib/utils/useCurrency";
import { useGetUserIpDetails } from "@/lib/utils/useGetUserIpDetails";
import { usePlans, type Plan } from "@/lib/hooks/useBilling";

// Skeleton Components
const PricingCardSkeleton = () => (
  <Card className="p-8 animate-pulse">
    <div className="space-y-6">
      {/* Icon & Title */}
      <div className="space-y-3">
        <div className="w-12 h-12 bg-muted rounded-lg"></div>
        <div className="h-8 bg-muted rounded w-24"></div>
        <div className="h-4 bg-muted rounded w-full"></div>
      </div>

      {/* Price */}
      <div className="space-y-2">
        <div className="h-12 bg-muted rounded w-32"></div>
        <div className="h-4 bg-muted rounded w-20"></div>
      </div>

      {/* Features */}
      <div className="space-y-3 pt-6 border-t">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex gap-2">
            <div className="w-5 h-5 bg-muted rounded-full flex-shrink-0"></div>
            <div className="h-4 bg-muted rounded flex-1"></div>
          </div>
        ))}
      </div>

      {/* Button */}
      <div className="h-11 bg-muted rounded-lg w-full"></div>
    </div>
  </Card>
);

const ControlsSkeleton = () => (
  <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
    <div className="w-64 h-12 bg-muted rounded-xl animate-pulse"></div>
    <div className="w-32 h-12 bg-muted rounded-xl animate-pulse"></div>
  </div>
);

const PLAN_ICONS: Record<string, LucideIcon> = {
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

// Real prices come from GET /pricing/plans (see usePlans in useBilling.ts) —
// this used to be a hand-maintained array here that silently drifted from
// what checkout actually charges. Kept as a client-side cache instead, not
// a second source of truth: a successful fetch is persisted to
// localStorage, and that cache (not a hardcoded fallback) is what's shown
// if the API is unreachable, so numbers displayed are always either live
// or a real previously-fetched snapshot — never invented.
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

const PricingSection = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly' | 'biennial' | 'triennial'>('monthly');
  const { userIpDetails, isFetchingUserIp } = useGetUserIpDetails();
  const { currency, setCurrency } = useCurrency({ userIpDetails, isFetchingUserIp });

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

  const plans = plansQuery.data?.plans ?? cachedPlans;
  const showSkeleton = isFetchingUserIp || (plansQuery.isLoading && !plans);

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

  return (
    <section id="pricing" className="relative py-24 overflow-hidden scroll-mt-20">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10">
        <div className="absolute top-24 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-24 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            Plans for every <span className="text-primary">ambition</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-10">
            Transparent pricing with no hidden fees. Switch or cancel your plan at any time.
          </p>

          {/* Enhanced Control Bar */}
          {isFetchingUserIp ? (
            <ControlsSkeleton />
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              {/* Billing Cycle Toggle */}
              <div className="bg-muted p-1 rounded-xl flex flex-col md:flex-row items-center shadow-inner">
                <button
                  onClick={() => setBillingCycle('monthly')}
                  className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${billingCycle === 'monthly' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'}`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBillingCycle('yearly')}
                  className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${billingCycle === 'yearly' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'}`}
                >
                  Yearly
                </button>
                <button
                  onClick={() => setBillingCycle('biennial')}
                  className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${billingCycle === 'biennial' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'}`}
                >
                  2 Years
                </button>
                <button
                  onClick={() => setBillingCycle('triennial')}
                  className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${billingCycle === 'triennial' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'}`}
                >
                  3 Years
                </button>
              </div>

              {/* Currency Selector */}
              <div className="flex gap-2 bg-muted p-1 rounded-xl">
                {['usd', 'ngn'].map((curr) => (
                  <button
                    key={curr}
                    onClick={() => setCurrency(curr as 'usd' | 'ngn')}
                    className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all ${currency === curr ? 'bg-primary text-primary-foreground shadow-md' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    {curr}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center max-w-7xl mx-auto">
          {showSkeleton || !plans ? (
            <>
              <PricingCardSkeleton />
              <PricingCardSkeleton />
              <PricingCardSkeleton />
            </>
          ) : (
            plans.map((plan) => (
              <PricingCard
                key={plan.id}
                name={plan.name}
                icon={PLAN_ICONS[plan.id] ?? Zap}
                description={plan.description}
                features={plan.features}
                highlighted={plan.highlighted}
                originalPrice={getOriginalPrice(plan)}
                price={getCurrentPrice(plan)}
                monthlyEquivalent={getMonthlyEquivalent(plan)}
                savings={getSavings(plan)}
                currency={currency}
                billingCycle={billingCycle}
              />
            ))
          )}
        </div>

        {/* Add-ons Section */}
        <div className="mt-24 pt-16 border-t border-border">
          <h3 className="text-2xl font-bold text-center mb-10">Scale your plan with Add-ons</h3>
          <div className="grid sm:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {isFetchingUserIp ? (
              <>
                <Card className="p-8 animate-pulse">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2 flex-1">
                      <div className="h-6 bg-muted rounded w-32"></div>
                      <div className="h-4 bg-muted rounded w-48"></div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-8 bg-muted rounded w-16"></div>
                      <div className="h-3 bg-muted rounded w-12"></div>
                    </div>
                  </div>
                </Card>
                <Card className="p-8 animate-pulse">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2 flex-1">
                      <div className="h-6 bg-muted rounded w-32"></div>
                      <div className="h-4 bg-muted rounded w-48"></div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-8 bg-muted rounded w-16"></div>
                      <div className="h-3 bg-muted rounded w-12"></div>
                    </div>
                  </div>
                </Card>
              </>
            ) : (
              <>
                <Card className="group p-8 hover:border-primary/50 transition-colors bg-linear-to-br from-background to-muted/30">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="text-xl font-bold">Extra Storage</h4>
                      <p className="text-muted-foreground text-sm">Scale easily as your business grows. Use it all for one mailbox or share across several.</p>
                    </div>
                    <span className="text-primary font-bold text-xl">
                      {currency === 'usd' ? '$1' : '₦1,000'}
                      <span className="text-xs text-muted-foreground block text-right">/10GB</span>
                    </span>
                  </div>
                </Card>
                <Card className="group p-8 hover:border-primary/50 transition-colors bg-linear-to-br from-background to-muted/30">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="text-xl font-bold">Extra Mailbox</h4>
                      <p className="text-muted-foreground text-sm">Add more mailboxes to your plan as your team grows.</p>
                    </div>
                    <span className="text-primary font-bold text-xl">
                      {currency === 'usd' ? '$2' : '₦2,000'}
                      <span className="text-xs text-muted-foreground block text-right">/mailbox</span>
                    </span>
                  </div>
                </Card>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
