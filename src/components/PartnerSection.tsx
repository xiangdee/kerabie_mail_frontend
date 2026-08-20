import { NavLink } from "@/components/NavLink";
import { Corners } from "@/components/ui/corners";

const BENEFITS = [
  { title: "Easy provisioning", detail: "First mailbox live in minutes" },
  { title: "High deliverability", detail: "Managed sending infrastructure" },
  { title: "White-label options", detail: "Co-branding at every touchpoint" },
  { title: "Admin & billing tools", detail: "Powerful consolidated control" },
  { title: "Multi-domain & reseller", detail: "Support for every account shape" },
  { title: "Built to scale", detail: "Large customer bases welcome" },
];

function PartnerSection() {
  return (
    <section id="partner" className="pt-[88px]">
      <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-12">
        <div className="blueprint relative bg-muted p-8 lg:col-span-5">
          <Corners />
          <span className="font-mono text-[11px] tracking-[.12em] text-primary">PARTNER PROGRAM</span>
          <h2 className="mb-3 mt-3.5 text-3xl tracking-tight sm:text-[34px]">Partner with Kerabie</h2>
          <p className="mb-[22px] text-[14.5px] leading-relaxed text-[#3A4240]">
            Offer your customers a premium business email platform built for guaranteed
            deliverability, reliability and scale. Kerabie brings enterprise-only value to
            niche verticals and elevates your service offering instantly.
          </p>
          <div className="flex flex-wrap gap-2.5">
            <NavLink
              href="/partner"
              className="inline-flex items-center gap-2 border border-primary bg-primary px-[18px] py-3 text-sm font-semibold text-primary-foreground transition-all hover:-translate-y-0.5 hover:bg-primary-hover"
            >
              Become a hosting partner
            </NavLink>
            <NavLink
              href="/contact"
              className="inline-flex items-center gap-2 border border-border bg-white px-[18px] py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
            >
              Talk to partnerships
            </NavLink>
          </div>
        </div>

        <div className="grid grid-cols-1 content-start gap-3.5 sm:grid-cols-2 lg:col-span-7">
          {BENEFITS.map((benefit) => (
            <div
              key={benefit.title}
              className="blueprint relative p-[18px] transition-transform duration-200 hover:-translate-y-0.5"
            >
              <Corners />
              <span className="block text-[14.5px] font-semibold">{benefit.title}</span>
              <span className="block text-[12.5px] text-muted-foreground">{benefit.detail}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default PartnerSection;
