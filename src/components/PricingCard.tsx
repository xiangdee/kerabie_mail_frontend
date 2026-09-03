import { useState } from "react";
import { Check, Minus, Plus } from "lucide-react";
import { Corners } from "@/components/ui/corners";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/lib/context/auth.context";
import type { ComponentType } from "react";

interface PricingCardProps {
  name: string;
  icon: ComponentType<{ size?: number }>;
  price: number;
  originalPrice: number | null;
  monthlyEquivalent?: string | null;
  description: string;
  features: string[];
  limitations?: string[];
  highlighted: boolean;
  billingCycle: 'monthly' | 'yearly' | 'biennial' | 'triennial';
  currency: 'usd' | 'ngn';
  savings?: {
    yearly?: number;
    biennial?: number;
    triennial?: number;
  };
  /** Per-unit extra-mailbox add-on price, flat per cycle (matches how the
   * backend actually charges it — see CreateSubscriptionRequest.addons). */
  addonPrice?: { usd: number; ngn: number };
}

const PricingCard = ({
  name,
  price,
  originalPrice,
  monthlyEquivalent,
  description,
  features,
  highlighted,
  billingCycle,
  currency,
  savings,
  addonPrice,
}: PricingCardProps) => {
  const [extraMailboxes, setExtraMailboxes] = useState(0);
  const { isAuthenticated } = useAuth();

  const formatPrice = (val: number) => {
    return currency === 'ngn'
      ? `₦${val.toLocaleString()}`
      : `$${val % 1 === 0 ? val : val.toFixed(2)}`;
  };

  const getCycleLabel = () => {
    switch (billingCycle) {
      case 'monthly': return 'mo';
      case 'yearly': return 'yr';
      case 'biennial': return '2 yrs';
      case 'triennial': return '3 yrs';
    }
  };

  const getBillingText = () => {
    switch (billingCycle) {
      case 'monthly': return null;
      case 'yearly': return 'annually';
      case 'biennial': return 'every 2 years';
      case 'triennial': return 'every 3 years';
    }
  };

  const getSavingsPercent = () => {
    if (isFree || !savings) return null;
    return savings[billingCycle as keyof typeof savings];
  };

  const isFree = name.toLowerCase() === 'free' || price === 0 && !originalPrice;
  const currentSavings = getSavingsPercent();

  // Every signup already starts a 3-day Pro trial regardless of which card
  // is clicked (see registerutils.create_trial_subscription) — so "Start
  // for free" and a paid-plan CTA both lead to the same signup form for a
  // logged-out visitor. The difference is what happens next: a paid-plan
  // click carries the chosen plan/cycle/add-ons through so the visitor lands
  // straight on a pre-filled upgrade dialog instead of the inbox — either
  // right after signup (via the existing ?redirect= param) or immediately,
  // if they're already signed in. The real checkout flow only offers
  // monthly/yearly (Flutterwave doesn't sync recurring plans for longer
  // cycles), so 2yr/3yr selections here fall back to yearly at that step.
  const checkoutCycle = billingCycle === 'biennial' || billingCycle === 'triennial' ? 'yearly' : billingCycle;
  const billingTarget = `/app/settings/billing?upgrade=${name.toLowerCase()}&cycle=${checkoutCycle}&mailboxes=${extraMailboxes}`;
  const ctaHref = isFree
    ? '/auth/register'
    : isAuthenticated
    ? billingTarget
    : `/auth/register?redirect=${encodeURIComponent(billingTarget)}`;
  const addonUnit = addonPrice ? (currency === 'ngn' ? addonPrice.ngn : addonPrice.usd) : 0;
  // Flat per-cycle add-on, matching how the backend actually charges it
  // (CreateSubscriptionRequest.addons — added once per cycle, not scaled
  // by the cycle's length).
  const addonCost = addonUnit * extraMailboxes;
  const displayPrice = price + addonCost;
  const kicker = isFree ? 'FREE' : highlighted ? 'MOST POPULAR' : 'SCALE';

  return (
    <div
      className={`blueprint relative flex flex-col p-7 transition-transform duration-200 hover:-translate-y-0.5 ${
        highlighted ? "bg-[#2E4A3F] text-[#E8EDEB]" : "hover:shadow-[0_12px_30px_rgba(26,31,30,.08)]"
      }`}
    >
      <Corners className={highlighted ? "text-white/50" : undefined} />

      <span className={`font-mono text-[11px] tracking-[.12em] ${highlighted ? "text-[#8FB3A6]" : "text-primary"}`}>
        {kicker}
      </span>
      <h3 className={`mt-2.5 mb-1 text-[26px] ${highlighted ? "text-white" : ""}`}>{name}</h3>
      <p className={`mb-[18px] text-[13.5px] ${highlighted ? "text-[#B7CEC5]" : "text-muted-foreground"}`}>{description}</p>

      {isFree ? (
        <span className="mb-5 block text-4xl font-bold leading-none tracking-tight">
          {formatPrice(price)}
        </span>
      ) : (
        <>
          {billingCycle !== 'monthly' && originalPrice && price < originalPrice && (
            <span className={`mb-1 block text-lg line-through ${highlighted ? "text-[#8FB3A6]" : "text-muted-foreground"}`}>
              {formatPrice(originalPrice + addonCost)}
            </span>
          )}
          <span className={`block text-4xl font-bold leading-none tracking-tight ${highlighted ? "text-white" : ""}`}>
            {formatPrice(displayPrice)}
          </span>
          <span className={`mt-1 block text-[12.5px] ${highlighted ? "text-[#8FB3A6]" : "text-muted-foreground"}`}>
            per mailbox / {getCycleLabel()}
          </span>
          {monthlyEquivalent && billingCycle !== 'monthly' && (
            <p className={`mt-1.5 text-xs ${highlighted ? "text-[#8FB3A6]" : "text-muted-foreground"}`}>
              {formatPrice(parseFloat(monthlyEquivalent))}/mo equivalent
            </p>
          )}
          {billingCycle !== 'monthly' && (
            <div className="mt-2.5 flex flex-col gap-1">
              <p className={`text-xs font-semibold ${highlighted ? "text-[#8FB3A6]" : "text-muted-foreground"}`}>
                Billed {formatPrice(displayPrice)} {getBillingText()}
              </p>
              {currentSavings ? (
                <span className="inline-block w-fit border border-[#4CAF80]/40 bg-[#4CAF80]/10 px-2 py-0.5 text-[10px] font-bold text-[#4CAF80]">
                  SAVE {currentSavings}%
                </span>
              ) : null}
            </div>
          )}

          {addonPrice && (
            <div className={`mt-3.5 flex items-center justify-between border-t pt-3 ${highlighted ? "border-white/15" : "border-border"}`}>
              <div>
                <p className={`text-xs font-medium ${highlighted ? "text-[#D8E5E0]" : ""}`}>Extra mailboxes</p>
                <p className={`text-[11px] ${highlighted ? "text-[#8FB3A6]" : "text-muted-foreground"}`}>
                  {formatPrice(addonUnit)}/mo each
                </p>
              </div>
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  aria-label="Remove an extra mailbox"
                  disabled={extraMailboxes <= 0}
                  onClick={() => setExtraMailboxes((n) => Math.max(0, n - 1))}
                  className={`grid h-6 w-6 place-items-center border text-xs disabled:opacity-30 ${highlighted ? "border-white/30 text-white" : "border-border text-foreground"}`}
                >
                  <Minus size={12} />
                </button>
                <span className="w-3 text-center text-sm font-semibold tabular-nums">{extraMailboxes}</span>
                <button
                  type="button"
                  aria-label="Add an extra mailbox"
                  onClick={() => setExtraMailboxes((n) => Math.min(50, n + 1))}
                  className={`grid h-6 w-6 place-items-center border text-xs ${highlighted ? "border-white/30 text-white" : "border-border text-foreground"}`}
                >
                  <Plus size={12} />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      <div className={`mb-6 mt-5 grid gap-2.5 text-[13.5px] ${highlighted ? "text-[#D8E5E0]" : ""}`}>
        {features.map((feature, i) => (
          <span key={i} className="flex gap-2.5">
            <Check size={15} className={highlighted ? "text-[#4CAF80]" : "text-primary"} strokeWidth={2.5} />
            {feature}
          </span>
        ))}
      </div>

      <NavLink
        href={ctaHref}
        className={`mt-auto flex items-center justify-center gap-2 border px-[18px] py-3 text-sm font-semibold transition-colors ${
          highlighted
            ? "border-transparent bg-[#E8EDEB] text-[#1A1F1E] hover:bg-white"
            : "border-border text-foreground hover:bg-muted"
        }`}
      >
        {isFree ? 'Start for free' : `Upgrade to ${name}`}
      </NavLink>
    </div>
  );
};

export default PricingCard;
