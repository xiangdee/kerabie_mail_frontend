import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Corners } from "@/components/ui/corners";
import { NavLink } from "@/components/NavLink";
import Image from "next/image";
import {
  Check, ArrowRight, Layers, ArrowLeftRight, ShieldCheck,
  LayoutDashboard, Workflow, Zap, Users,
} from "lucide-react";

const badges = [
  "Wholesale per-mailbox pricing",
  "You set the retail price",
  "Provisioning API for your panel",
  "Co-branded onboarding",
];

const pillars = [
  {
    icon: Layers,
    title: "Resell at your margin",
    description: "Buy mailboxes at a wholesale rate that drops as volume grows, and set whatever retail price your market supports. One consolidated invoice to you — we never bill your customers directly.",
    tint: false,
  },
  {
    icon: ArrowLeftRight,
    title: "Provision from your panel",
    description: "Create domains, mailboxes, aliases and quotas through one API. Provisioning fires on order, suspension on non-payment — your customer never leaves your checkout to get email.",
    tint: true,
  },
  {
    icon: ShieldCheck,
    title: "We carry the deliverability",
    description: "No mail servers to run, no IP reputation to earn, no abuse desk to staff. Kerabie handles authentication, filtering and inbox placement across every domain you sell.",
    tint: false,
  },
];

const steps = [
  { number: "01", title: "Agree your rates", description: "Tell us your expected mailbox volume and we quote a wholesale tier and contract term." },
  { number: "02", title: "Wire up provisioning", description: "Connect the API to your panel or billing system — our engineers sit with yours until it's done." },
  { number: "03", title: "Co-brand the handoff", description: "Your logo sits beside ours through signup, onboarding emails and the help centre." },
  { number: "04", title: "Start selling", description: "Mail appears as a product in your catalogue. Migration of existing customers is included.", tint: true },
];

const rateTiers = [
  { label: "TIER 1", value: "100+", detail: "mailboxes — entry wholesale" },
  { label: "TIER 2", value: "2,500+", detail: "mailboxes — volume rate" },
  { label: "BILLING", value: "Monthly", detail: "one invoice, active seats only" },
  { label: "SETUP", value: "$0", detail: "no onboarding fee, no minimum" },
];

const partnerGets = [
  "Reseller dashboard across all customer domains",
  "REST provisioning API with sandbox keys",
  "Webhooks for suspend, resume and quota events",
  "Multi-domain and sub-reseller hierarchy",
  "Co-branded signup, onboarding and help pages",
  "Free migration for customers you bring over",
  "Tier-2 support escalation path for your agents",
  "Named partner manager above Tier 2 volume",
];

const partnerFeatures = [
  { icon: LayoutDashboard, title: "Reseller dashboard", description: "Every customer domain, mailbox count and invoice in one panel." },
  { icon: Workflow, title: "Provisioning API", description: "Create a domain and its first mailbox in a single call." },
  { icon: Zap, title: "Instant mailbox activation", description: "Customers are sending within minutes of checkout." },
  { icon: Users, title: "Escalation path for your agents", description: "Your support desk stays first line; ours takes the mail internals." },
];

const faqs = [
  { q: "Whose brand do customers see?", a: "The mail platform is Kerabie-branded, co-branded with your logo through signup, onboarding and support. You own the billing relationship and remain the customer's provider of record — we don't upsell or market to them." },
  { q: "How is it priced?", a: "Wholesale, per active mailbox per month, on a tier set by volume. You choose the retail price. One consolidated monthly invoice, no setup fee and no minimum commitment." },
  { q: "Can I integrate with my existing panel?", a: "Yes. The REST API and webhooks cover domains, mailboxes, aliases, quotas, suspension and resumption, so mail can be a line item in whatever billing system you already run. Sandbox keys are issued on day one." },
  { q: "Who handles end-customer support?", a: "You stay first line — that keeps the relationship yours. Anything touching mail internals, deliverability or DNS escalates to our engineers, with a two-hour first response." },
  { q: "Can you migrate my existing mail customers?", a: "Yes, at no charge. We run bulk IMAP migration in batches you schedule, with per-domain cutover so nothing goes dark during the switch." },
  { q: "Do you support sub-resellers?", a: "Yes. Agencies and downstream resellers can sit under your account with their own scoped dashboards, while volume and invoicing stay consolidated with you." },
];

export default function PartnerPage() {
  return (
    <div className="min-h-screen max-w-full overflow-x-hidden bg-background">
      <Header />

      <main className="mx-auto max-w-[1240px] px-4">
        {/* Hero */}
        <section className="pt-14 text-center">
          <span className="inline-flex items-center gap-2.5">
            <span className="grid h-[38px] w-[38px] place-items-center border border-border bg-muted">
              <Image src="/k-leaf-icon.png" width={18} height={18} alt="Kerabie" />
            </span>
            <span className="border border-border bg-muted px-5 py-2.5 text-xs font-semibold tracking-widest text-primary-hover">
              HOSTING PARTNER PROGRAM
            </span>
          </span>

          <h1 className="mx-auto mt-5 mb-3.5 max-w-[22ch] text-4xl leading-[1.1] tracking-tight sm:text-[54px]">
            Sell Kerabie email <span className="text-primary">alongside every domain</span>
          </h1>
          <p className="mx-auto mb-6 max-w-[60ch] text-[16px] leading-relaxed text-muted-foreground">
            Kerabie is built for hosting providers, registrars and web agencies. Add professional
            mailboxes to your catalogue at wholesale rates, provision them from your own panel, and
            keep the margin — we run the mail platform, you own the customer.
          </p>
          <div className="mb-6 flex flex-wrap justify-center gap-2.5">
            {badges.map((badge) => (
              <span key={badge} className="inline-flex items-center gap-2 border border-border px-3.5 py-2 text-[12.5px]">
                <Check size={14} className="text-primary" strokeWidth={2} />
                {badge}
              </span>
            ))}
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <NavLink
              href="/contact"
              className="blueprint relative inline-flex items-center gap-2 border border-primary bg-primary px-[22px] py-3.5 text-[15px] font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-primary-hover"
            >
              <Corners className="text-white/50" />
              Become a hosting partner
              <ArrowRight size={15} />
            </NavLink>
            <NavLink
              href="/contact"
              className="inline-flex items-center gap-2 border border-border px-[22px] py-3.5 text-[15px] font-semibold text-foreground transition-colors hover:bg-muted"
            >
              Request wholesale rates
            </NavLink>
          </div>
        </section>

        {/* Built for the way hosts sell */}
        <section className="pt-[72px]">
          <div className="mx-auto mb-[26px] max-w-[620px] text-center">
            <h2 className="mb-2 text-[34px] tracking-tight">Built for the way hosts sell</h2>
            <p className="text-[15px] text-muted-foreground">
              Attach mail to your existing catalogue — as a paid upsell, a bundled perk, or the free
              mailbox that closes the domain sale.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
            {pillars.map((pillar) => (
              <div
                key={pillar.title}
                className={`blueprint relative p-[30px] transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(26,31,30,.08)] ${pillar.tint ? "bg-muted" : ""}`}
              >
                <Corners />
                <span className="grid h-10 w-10 place-items-center border border-border bg-primary-muted">
                  <pillar.icon size={19} className="text-primary" strokeWidth={1.5} />
                </span>
                <h3 className="mb-2 mt-4 text-[21px]">{pillar.title}</h3>
                <p className="text-[13.5px] leading-relaxed text-muted-foreground">{pillar.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Live in a week */}
        <section className="pt-[72px]">
          <div className="mx-auto mb-[26px] max-w-[560px] text-center">
            <h2 className="mb-2 text-[34px] tracking-tight">Live in a week, not a quarter</h2>
            <p className="text-[15px] text-muted-foreground">Four steps from first call to mail appearing in your catalogue.</p>
          </div>
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step) => (
              <div key={step.number} className={`blueprint relative p-[26px] ${step.tint ? "bg-muted" : ""}`}>
                <Corners />
                <span className="grid h-9 w-9 place-items-center bg-primary font-mono text-[13px] text-white">
                  {step.number}
                </span>
                <h3 className="mb-1.5 mt-3.5 text-[19px]">{step.title}</h3>
                <p className="text-[13px] leading-relaxed text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Wholesale rates */}
      <section className="relative mt-18 overflow-hidden bg-[#1A1F1E] text-[#E8EDEB]">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(232,237,235,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(232,237,235,.05) 1px,transparent 1px)",
            backgroundSize: "52px 52px",
          }}
        />
        <div
          className="pointer-events-none absolute inset-y-0 w-[30%] animate-[k-sweep_9s_ease-in-out_infinite]"
          style={{ background: "linear-gradient(90deg,transparent,rgba(90,138,120,.22),transparent)" }}
        />
        <div className="relative mx-auto grid max-w-[1240px] grid-cols-1 items-center gap-6 px-4 py-16 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <h2 className="mb-3.5 text-[34px] leading-[1.15] tracking-tight text-white">
              Wholesale rates that fall as you grow
            </h2>
            <p className="mb-[22px] max-w-[46ch] text-[15px] leading-relaxed text-[#B7CEC5]">
              Pricing is per active mailbox per month, billed to you in one consolidated invoice.
              Attach a free mailbox to every domain to win the sale, then upsell storage, archiving
              and extra seats at your own price.
            </p>
            <NavLink
              href="/contact"
              className="inline-flex items-center gap-2 bg-primary px-5 py-3.5 text-[14.5px] font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-[#5A8A78]"
            >
              Request wholesale rates
              <ArrowRight size={15} />
            </NavLink>
          </div>
          <div className="grid grid-cols-2 gap-3.5 lg:col-span-6">
            {rateTiers.map((tier) => (
              <div key={tier.label} className="blueprint relative border-white/25 p-[22px]">
                <Corners className="text-white/45" />
                <span className="block font-mono text-[10.5px] tracking-[.1em] text-[#8FB3A6]">{tier.label}</span>
                <span className="mt-1 block text-[26px] font-bold tracking-tight text-white">{tier.value}</span>
                <span className="block text-[12.5px] text-[#8FB3A6]">{tier.detail}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-[1240px] px-4">
        {/* What partners get */}
        <section className="pt-[72px]">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <h2 className="mb-2.5 text-[32px] tracking-tight">What partners get</h2>
              <p className="mb-[22px] text-[14.5px] leading-relaxed text-muted-foreground">
                Everything needed to run mail as a product line, without running mail servers.
              </p>
              <div className="grid gap-2.5 text-sm">
                {partnerGets.map((item) => (
                  <span key={item} className="flex items-start gap-2.5">
                    <Check size={16} className="mt-0.5 shrink-0 text-primary" strokeWidth={1.8} />
                    {item}
                  </span>
                ))}
              </div>
            </div>
            <div className="grid content-start gap-3.5 lg:col-span-7">
              {partnerFeatures.map((feature) => (
                <div key={feature.title} className="blueprint relative grid grid-cols-[auto_1fr] items-start gap-4 px-[22px] py-5 transition-colors hover:bg-muted">
                  <Corners />
                  <span className="grid h-9 w-9 place-items-center border border-border bg-primary-muted">
                    <feature.icon size={17} className="text-primary" strokeWidth={1.5} />
                  </span>
                  <span>
                    <span className="block text-[15px] font-semibold">{feature.title}</span>
                    <span className="block text-[13px] leading-relaxed text-muted-foreground">{feature.description}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="pt-[72px]">
          <div className="mx-auto mb-6 max-w-[560px] text-center">
            <h2 className="mb-2 text-[34px] tracking-tight">Frequently asked questions</h2>
            <p className="text-[15px] text-muted-foreground">Everything hosts ask before signing.</p>
          </div>
          <div className="blueprint relative mx-auto max-w-[820px] p-[26px] sm:p-[30px]">
            <Corners />
            <div className="grid gap-3.5">
              {faqs.map((faq) => (
                <details key={faq.q} className="border-b border-border pb-3.5 last:border-b-0 last:pb-0">
                  <summary className="cursor-pointer text-[15px] font-semibold">{faq.q}</summary>
                  <p className="mt-2.5 text-[13.5px] leading-relaxed text-muted-foreground">{faq.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="pb-[84px] pt-[72px]">
          <div className="blueprint relative mx-auto max-w-[820px] bg-muted px-6 py-12 text-center sm:px-10">
            <Corners />
            <span className="mx-auto grid h-12 w-12 place-items-center border border-border bg-white">
              <Layers size={22} className="text-primary" strokeWidth={1.5} />
            </span>
            <h2 className="mb-2.5 mt-[18px] text-[34px] tracking-tight">Add mail to your catalogue</h2>
            <p className="mx-auto mb-6 max-w-[50ch] text-[15px] text-muted-foreground">
              Tell us your mailbox volume and panel, and we&apos;ll come back with a wholesale tier
              and an integration plan.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <NavLink
                href="/contact"
                className="inline-flex items-center gap-2 border border-primary bg-primary px-[22px] py-3.5 text-[15px] font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-primary-hover"
              >
                Become a hosting partner
                <ArrowRight size={15} />
              </NavLink>
              <NavLink
                href="/auth/register"
                className="inline-flex items-center gap-2 border border-border bg-white px-[22px] py-3.5 text-[15px] font-semibold text-foreground transition-colors hover:bg-primary-muted"
              >
                Try a free mailbox first
              </NavLink>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
