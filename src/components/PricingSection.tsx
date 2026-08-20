'use client';
import { Zap } from "lucide-react";
import { Corners } from "@/components/ui/corners";
import PricingCard from "./PricingCard";
import { usePricingDisplay, PLAN_ICONS } from "@/lib/hooks/usePricingDisplay";

const PricingSection = () => {
  const {
    billingCycle, setBillingCycle, currency, setCurrency,
    plans, usingFallback,
    getCurrentPrice, getOriginalPrice, getMonthlyEquivalent, getSavings,
  } = usePricingDisplay();

  return (
    <section id="pricing" className="pt-[88px] scroll-mt-20">
      <div className="mx-auto mb-[26px] max-w-[620px] text-center">
        <h2 className="mb-2 text-3xl tracking-tight sm:text-4xl">
          Plans for every <span className="text-primary">ambition</span>
        </h2>
        <p className="text-[15px] text-muted-foreground">
          Transparent pricing with no hidden fees. Switch or cancel your plan at any time.
        </p>

        {/* Control bar — currency always has an instant local fallback
            (stored preference or "usd"), so this never needs to wait on
            the /ip lookup the way the price figures below do. */}
        <div className="mt-6 flex flex-col items-center justify-center gap-4 sm:flex-row">
          {/* Billing Cycle Toggle */}
          <div className="flex flex-col items-center border border-border bg-muted p-1 md:flex-row">
            {(['monthly', 'yearly', 'biennial', 'triennial'] as const).map((cycle) => (
              <button
                key={cycle}
                onClick={() => setBillingCycle(cycle)}
                className={`px-4 py-2 text-sm font-semibold transition-colors ${billingCycle === cycle ? 'bg-white text-foreground shadow-sm' : 'text-muted-foreground'}`}
              >
                {cycle === 'monthly' && 'Monthly'}
                {cycle === 'yearly' && 'Yearly'}
                {cycle === 'biennial' && '2 Years'}
                {cycle === 'triennial' && '3 Years'}
              </button>
            ))}
          </div>

          {/* Currency Selector */}
          <div className="flex border border-border bg-muted p-1">
            {(['usd', 'ngn'] as const).map((curr) => (
              <button
                key={curr}
                onClick={() => setCurrency(curr)}
                className={`px-3.5 py-2 text-xs font-bold uppercase transition-colors ${currency === curr ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              >
                {curr}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      {usingFallback && (
        <p className="mb-3 text-center font-mono text-[11px] tracking-wider text-muted-foreground">
          Showing standard pricing — live rates unavailable right now.
        </p>
      )}
      <div className="grid grid-cols-1 items-stretch gap-3.5 sm:grid-cols-3">
        {plans.map((plan) => (
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
        ))}
      </div>

      {/* Add-ons Section */}
      <div className="mt-16">
        <div className="mb-3 flex items-center gap-3.5">
          <span className="font-mono text-[11px] tracking-[.12em] text-muted-foreground">
            SCALE YOUR PLAN WITH ADD-ONS
          </span>
          <span className="h-px flex-1 bg-border" />
        </div>
        {/* Add-on prices are static per currency, and currency already has
            an instant local fallback — no need to gate this on the /ip
            lookup either. */}
        <div className="grid gap-3.5 sm:grid-cols-2">
          <div className="blueprint relative p-5 transition-colors hover:bg-muted">
            <Corners />
            <span className="block text-[14.5px] font-semibold">Extra storage</span>
            <span className="block text-[12.5px] text-muted-foreground">
              {currency === 'usd' ? '$1' : '₦1,000'} /10GB
            </span>
          </div>
          <div className="blueprint relative p-5 transition-colors hover:bg-muted">
            <Corners />
            <span className="block text-[14.5px] font-semibold">Extra mailbox</span>
            <span className="block text-[12.5px] text-muted-foreground">
              {currency === 'usd' ? '$2' : '₦2,000'} /mailbox
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
