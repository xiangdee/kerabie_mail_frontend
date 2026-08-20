import { Corners } from "@/components/ui/corners";
import { NavLink } from "@/components/NavLink";
import { ArrowRight } from "lucide-react";

const HomeHeroSection = () => {
  return (
    <section className="grid grid-cols-1 gap-3.5 pt-10 lg:grid-cols-12">
      {/* Headline card */}
      <div className="blueprint relative col-span-1 flex min-h-[392px] flex-col overflow-hidden bg-[#111413] p-9 text-[#E8EDEB] lg:col-span-7">
        <Corners className="text-white/50" />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(232,237,235,.055) 1px,transparent 1px),linear-gradient(90deg,rgba(232,237,235,.055) 1px,transparent 1px)",
            backgroundSize: "52px 52px",
          }}
        />
        <div
          className="pointer-events-none absolute inset-y-0 w-[34%] animate-[k-sweep_7s_ease-in-out_infinite]"
          style={{ background: "linear-gradient(90deg,transparent,rgba(90,138,120,.28),transparent)" }}
        />
        <div className="relative">
          <span className="inline-flex items-center gap-2 border border-white/30 px-2.5 py-1.5 text-[11.5px] uppercase tracking-wider text-[#B7CEC5]">
            <span className="block h-1.5 w-1.5 animate-[k-pulse_2s_infinite] bg-[#4CAF80]" />
            Trusted by 10,000+ businesses
          </span>
          <h1 className="mt-5 max-w-[16ch] text-4xl leading-[1.08] tracking-tight text-white sm:text-5xl">
            Reliable business email built for growing teams
          </h1>
          <p className="mt-3.5 max-w-[44ch] text-[17px] leading-relaxed text-[#B7CEC5]">
            Fast, secure, and professional email. Bring your own domain, connect in minutes,
            and never wonder whether a message landed.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <NavLink
              href="/auth/register"
              className="inline-flex items-center gap-2 bg-[#E8EDEB] px-5 py-3.5 text-[14.5px] font-semibold text-[#1A1F1E] transition-all hover:-translate-y-0.5 hover:bg-white"
            >
              Get free mailbox
              <ArrowRight size={15} />
            </NavLink>
            <a
              href="#pricing"
              className="inline-flex items-center gap-2 border border-white/35 px-5 py-3.5 text-[14.5px] font-semibold text-[#E8EDEB] transition-colors hover:bg-white/10"
            >
              View pricing
            </a>
          </div>
        </div>
        <div className="relative mt-auto flex flex-wrap gap-8 pt-7 font-mono text-[11px] tracking-wide text-[#8FB3A6]">
          <span>SOC-2 READY</span>
          <span>DKIM · SPF · DMARC</span>
          <span>EU + US REGIONS</span>
        </div>
      </div>

      {/* Inbox preview card */}
      <div className="blueprint relative col-span-1 min-h-[392px] overflow-hidden bg-muted lg:col-span-5">
        <Corners />
        <div className="flex items-center justify-between border-b border-border px-4 py-3.5">
          <span className="font-mono text-[11px] tracking-wider text-muted-foreground">INBOX / TEAM</span>
          <span className="flex gap-1.5">
            <span className="block h-1.5 w-1.5 bg-[#4CAF80]" />
            <span className="block h-1.5 w-1.5 bg-[#B7CEC5]" />
            <span className="block h-1.5 w-1.5 bg-border" />
          </span>
        </div>
        <div className="relative h-[294px] overflow-hidden">
          <div
            className="pointer-events-none absolute inset-x-0 h-[58px] animate-[k-scan_5.5s_cubic-bezier(.6,0,.4,1)_infinite_alternate]"
            style={{ background: "linear-gradient(180deg,rgba(65,103,88,.09),transparent)" }}
          />
          <div className="grid">
            {[
              { name: "Anna Whitfield", detail: "Re: Q3 renewal — signed & returned", time: "09:41", unread: true },
              { name: "billing@northgate", detail: "Invoice 2291 · delivered to inbox", time: "09:12", unread: true },
              { name: "Deploy bot", detail: "Scheduled: newsletter sends 08:00", time: "Tue", unread: false },
              { name: "Marcus Bell", detail: "Signature approved for all 42 seats", time: "Mon", unread: false },
            ].map((row) => (
              <div
                key={row.name}
                className="grid grid-cols-[8px_1fr_auto] items-start gap-3 border-b border-border bg-white px-4 py-3.5 last:border-b-0"
              >
                <span className={`mt-1.5 block h-[7px] w-[7px] ${row.unread ? "bg-primary" : "bg-border"}`} />
                <span>
                  <span className={`block text-[13.5px] ${row.unread ? "font-semibold" : "font-medium text-[#3A4240]"}`}>{row.name}</span>
                  <span className="block text-[12.5px] text-muted-foreground">{row.detail}</span>
                </span>
                <span className="font-mono text-[10.5px] text-muted-foreground">{row.time}</span>
              </div>
            ))}
          </div>
          <div className="blueprint absolute bottom-4 right-3.5 animate-[k-float_6s_ease-in-out_infinite] bg-white p-3.5 shadow-[0_12px_32px_rgba(26,31,30,.14)]">
            <Corners />
            <span className="block font-mono text-[10px] tracking-wider text-muted-foreground">DELIVERABILITY</span>
            <span className="mt-0.5 block text-[22px] font-bold tracking-tight">
              99.2% <span className="text-xs font-medium text-[#4CAF80]">inbox rate</span>
            </span>
            <span className="mt-2 block h-1 w-[150px] bg-border">
              <span className="block h-1 w-[92%] origin-left animate-[k-bar_2.4s_cubic-bezier(.2,.8,.2,1)_infinite_alternate] bg-primary" />
            </span>
          </div>
        </div>
      </div>

      {/* Stat tiles */}
      {[
        { value: "99.9%", label: "Uptime, measured monthly" },
        { value: "10k+", label: "Businesses sending with Kerabie" },
        { value: "24/7", label: "Human support, every region" },
      ].map((stat) => (
        <div
          key={stat.label}
          className="blueprint relative col-span-1 p-[22px] transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_26px_rgba(26,31,30,.09)] lg:col-span-4"
        >
          <Corners />
          <span className="block text-[38px] font-bold leading-none tracking-tight">{stat.value}</span>
          <span className="mt-1 block text-[13px] text-muted-foreground">{stat.label}</span>
        </div>
      ))}
    </section>
  );
};

export default HomeHeroSection;
