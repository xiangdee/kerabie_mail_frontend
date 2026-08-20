'use client';
import Image from "next/image";
import { Zap } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Corners } from "@/components/ui/corners";
import { NavLink } from "@/components/NavLink";
import PricingCard from "@/components/PricingCard";
import { usePricingDisplay, PLAN_ICONS } from "@/lib/hooks/usePricingDisplay";

const addOns = [
  { title: "Extra storage", detail: "+10 GB per mailbox", usd: "$1 / mo", ngn: "₦1,000 / mo" },
  { title: "Extra mailbox", detail: "Additional seat, same plan", usd: "$2 / mo", ngn: "₦2,000 / mo" },
  { title: "Additional domains", detail: "Per domain, per month", usd: "$2 / mo", ngn: "₦2,000 / mo" },
  { title: "Dedicated IP", detail: "For high-volume senders", usd: "From $29", ngn: "From ₦29,000" },
];

const comparisonRows = [
  { feature: "Mailboxes", free: "1", pro: "Unlimited", premium: "Unlimited" },
  { feature: "Storage per mailbox", free: "500 MB", pro: "10 GB", premium: "50 GB" },
  { feature: "Custom domains", free: "—", pro: "1 included", premium: "Unlimited" },
  { feature: "AI Compose", free: "Trial", pro: "Included", premium: "Included" },
  { feature: "Shared inboxes", free: "—", pro: "—", premium: "Included" },
  { feature: "API access", free: "—", pro: "—", premium: "Included" },
  { feature: "Audit logs", free: "—", pro: "—", premium: "Included" },
];

const billingFaqs = [
  { q: "Can I switch plans mid-month?", a: "Yes — changes are prorated to the day, up or down, with no fee." },
  { q: "Do you charge for migration?", a: "No. Import from any IMAP provider is included on every plan, including the free one." },
  { q: "What happens if I cancel?", a: "Sending stops at the end of the period and you can export everything as standard mbox files for 30 days." },
];

const PricingPage = () => {
  const {
    billingCycle, setBillingCycle, currency, setCurrency,
    plans, usingFallback,
    getCurrentPrice, getOriginalPrice, getMonthlyEquivalent, getSavings,
  } = usePricingDisplay();

  return (
    <div className="min-h-screen max-w-full overflow-x-hidden bg-background">
      <Header />

      <main className="mx-auto max-w-[1240px] px-4">
        {/* Hero */}
        <section className="pt-16 text-center">
          <span className="inline-flex items-center gap-2.5">
            <span className="grid h-[38px] w-[38px] place-items-center border border-border bg-muted">
              <Image src="/k-leaf-icon.png" width={18} height={18} alt="Kerabie" />
            </span>
            <span className="border border-border bg-muted px-5 py-2.5 text-xs font-semibold tracking-widest text-primary-hover">
              PRICING
            </span>
          </span>

          <h1 className="mx-auto mt-5 mb-3 max-w-[22ch] text-4xl leading-[1.08] tracking-tight sm:text-[54px]">
            Plans for every <span className="text-primary">ambition</span>
          </h1>
          <p className="mx-auto max-w-[56ch] text-base text-muted-foreground">
            Transparent pricing with no hidden fees. Switch or cancel your plan at any time.
          </p>
        </section>

        {/* Controls */}
        <div className="mx-auto mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
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

        {/* Plan cards */}
        <section className="pt-9">
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
        </section>

        {/* Add-ons */}
        <section className="pt-14">
          <div className="mb-3.5 flex items-center gap-3.5">
            <span className="font-mono text-[11px] tracking-[.12em] text-muted-foreground">SCALE YOUR PLAN WITH ADD-ONS</span>
            <span className="h-px flex-1 bg-border" />
          </div>
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
            {addOns.map((addOn) => (
              <div key={addOn.title} className="blueprint relative p-5 transition-colors hover:bg-muted">
                <Corners />
                <span className="block text-[14.5px] font-semibold">{addOn.title}</span>
                <span className="block text-[12.5px] text-muted-foreground">{addOn.detail}</span>
                <span className="mt-2 block font-mono text-xs text-primary">
                  {currency === 'usd' ? addOn.usd : addOn.ngn}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Comparison table */}
        <section className="pt-14">
          <div className="mb-3.5 flex items-center gap-3.5">
            <span className="font-mono text-[11px] tracking-[.12em] text-muted-foreground">PLAN COMPARISON</span>
            <span className="h-px flex-1 bg-border" />
          </div>
          <div className="blueprint relative overflow-x-auto p-[22px]">
            <Corners />
            <table className="w-full min-w-[560px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="pb-2.5 font-semibold">Feature</th>
                  <th className="pb-2.5 font-semibold">Free</th>
                  <th className="pb-2.5 font-semibold">Pro</th>
                  <th className="pb-2.5 font-semibold">Premium</th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row) => (
                  <tr key={row.feature} className="border-b border-border last:border-b-0">
                    <td className="py-2.5">{row.feature}</td>
                    <td className="py-2.5 text-muted-foreground">{row.free}</td>
                    <td className="py-2.5 text-muted-foreground">{row.pro}</td>
                    <td className="py-2.5 text-muted-foreground">{row.premium}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Billing FAQ + CTA */}
        <section className="grid grid-cols-1 gap-3.5 pb-[72px] pt-14 lg:grid-cols-12">
          <div className="blueprint relative col-span-1 bg-muted p-8 lg:col-span-7">
            <Corners />
            <h2 className="mb-4 text-2xl">Billing questions</h2>
            <div className="grid gap-3">
              {billingFaqs.map((faq) => (
                <details key={faq.q} className="border-b border-border pb-3 last:border-b-0 last:pb-0">
                  <summary className="cursor-pointer text-[14.5px] font-semibold">{faq.q}</summary>
                  <p className="mt-2 text-[13.5px] text-muted-foreground">{faq.a}</p>
                </details>
              ))}
            </div>
          </div>
          <div className="blueprint relative col-span-1 flex flex-col justify-center overflow-hidden bg-[#1A1F1E] p-8 text-[#E8EDEB] lg:col-span-5">
            <Corners className="text-white/50" />
            <h2 className="mb-2.5 text-[26px] text-white">Start on the free plan.</h2>
            <p className="mb-5 text-sm text-[#8A9E98]">
              No card required. Upgrade the day your second mailbox is needed.
            </p>
            <div className="flex flex-wrap gap-2.5">
              <NavLink
                href="/auth/register"
                className="inline-flex items-center gap-2 bg-primary px-5 py-3.5 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-[#5A8A78]"
              >
                Get free mailbox
              </NavLink>
              <NavLink
                href="/contact"
                className="inline-flex items-center gap-2 border border-white/30 px-5 py-3.5 text-sm font-semibold text-[#E8EDEB] transition-colors hover:bg-white/10"
              >
                Talk to sales
              </NavLink>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default PricingPage;
