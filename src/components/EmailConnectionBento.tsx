import { Corners } from "@/components/ui/corners";
import { NavLink } from "@/components/NavLink";
import { ArrowRight, Globe, Shield, Server } from "lucide-react";

export default function EmailConnectionBento() {
  return (
    <section className="pt-[82px]">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-6">
        <div>
          <h2 className="mb-1.5 text-3xl tracking-tight sm:text-[34px]">Connect your email account</h2>
          <p className="text-[15px] text-muted-foreground">
            Choose the best way to connect your email and start sending in minutes.
          </p>
        </div>
        <span className="font-mono text-[11px] tracking-[.12em] text-muted-foreground">03 METHODS</span>
      </div>

      <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-12">
        {/* Connect domain */}
        <div className="blueprint relative col-span-1 overflow-hidden bg-[#2E4A3F] p-7 text-[#E8EDEB] transition-transform duration-200 hover:-translate-y-0.5 lg:col-span-5">
          <Corners className="text-white/50" />
          <span className="absolute right-5 top-5 border border-white/40 px-2 py-1 font-mono text-[10px] tracking-wider">
            RECOMMENDED
          </span>
          <Globe size={22} className="text-[#8FB3A6]" strokeWidth={1.5} />
          <h3 className="mb-2 mt-4 text-xl text-white sm:text-[22px]">Connect domain</h3>
          <p className="mb-5 max-w-[36ch] text-[13.5px] leading-relaxed text-[#B7CEC5]">
            Set up professional email addresses with your own domain. Perfect for businesses
            that want brand consistency.
          </p>
          <div className="mb-5 grid grid-cols-2 gap-2.5">
            <div className="border border-white/20 px-3 py-2.5">
              <span className="block text-[13px] font-semibold">Custom</span>
              <span className="font-mono text-[11.5px] text-[#8FB3A6]">you@domain.com</span>
            </div>
            <div className="border border-white/20 px-3 py-2.5">
              <span className="block text-[13px] font-semibold">DNS</span>
              <span className="font-mono text-[11.5px] text-[#8FB3A6]">Guided records</span>
            </div>
          </div>
          <NavLink
            href="/auth/register"
            className="inline-flex items-center gap-2 bg-[#E8EDEB] px-[18px] py-2.5 text-sm font-semibold text-[#1A1F1E] transition-colors hover:bg-white"
          >
            Get started
            <ArrowRight size={14} />
          </NavLink>
        </div>

        {/* Connect OAuth */}
        <div className="blueprint relative col-span-1 p-7 transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_26px_rgba(26,31,30,.08)] lg:col-span-4">
          <Corners />
          <Shield size={22} className="text-primary" strokeWidth={1.5} />
          <h3 className="mb-2 mt-4 text-xl sm:text-[22px]">Connect OAuth</h3>
          <p className="mb-[18px] text-[13.5px] leading-relaxed text-muted-foreground">
            Most secure method, with one-click authorisation. No password sharing required.
          </p>
          <div className="mb-[18px] grid gap-2">
            <span className="flex items-center gap-2.5 border border-border px-3 py-2.5 text-[13px]">
              <span className="block h-1.5 w-1.5 bg-primary" />
              Gmail &amp; Google Workspace
            </span>
            <span className="flex items-center gap-2.5 border border-border px-3 py-2.5 text-[13px]">
              <span className="block h-1.5 w-1.5 bg-primary" />
              Outlook &amp; Microsoft 365
            </span>
          </div>
          <NavLink
            href="/auth/register"
            className="inline-flex items-center gap-2 border border-primary px-[18px] py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-white"
          >
            Connect now
          </NavLink>
        </div>

        {/* Stat tiles */}
        <div className="col-span-1 grid content-start gap-3.5 lg:col-span-3">
          <div className="blueprint relative bg-muted px-[18px] py-4">
            <Corners />
            <span className="block text-2xl font-bold tracking-tight">99.9%</span>
            <span className="block text-xs text-muted-foreground">Uptime guarantee</span>
          </div>
          <div className="blueprint relative bg-muted px-[18px] py-4">
            <Corners />
            <span className="block text-2xl font-bold tracking-tight">24/7</span>
            <span className="block text-xs text-muted-foreground">Support available</span>
          </div>
          <div className="blueprint relative bg-primary-muted px-[18px] py-4">
            <Corners />
            <span className="block text-2xl font-bold tracking-tight text-primary-hover">Instant</span>
            <span className="block text-xs text-primary">Synchronisation</span>
          </div>
        </div>

        {/* Connect IMAP / SMTP */}
        <div className="blueprint relative col-span-1 p-7 transition-transform duration-200 hover:-translate-y-0.5 lg:col-span-7">
          <Corners />
          <div className="flex flex-wrap items-start gap-6">
            <div className="min-w-[240px] flex-1">
              <Server size={22} className="text-primary" strokeWidth={1.5} />
              <h3 className="mb-2 mt-3.5 text-xl sm:text-[22px]">Connect IMAP / SMTP</h3>
              <p className="mb-4 text-[13.5px] leading-relaxed text-muted-foreground">
                Connect any email provider using IMAP and SMTP protocols. Works with all email services.
              </p>
              <NavLink
                href="/auth/register"
                className="inline-flex items-center gap-2 border border-border px-[18px] py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
              >
                Configure IMAP
              </NavLink>
            </div>
            <div className="grid min-w-[200px] gap-2.5">
              <span className="border border-border px-3 py-2.5 font-mono text-[13px]">MANUAL SETUP</span>
              <span className="border border-border px-3 py-2.5 font-mono text-[13px]">SECURE ACCESS</span>
              <span className="border border-border px-3 py-2.5 font-mono text-[13px]">TLS 1.3</span>
            </div>
          </div>
        </div>

        {/* Need help choosing */}
        <div className="blueprint relative col-span-1 flex flex-col justify-center bg-[#1A1F1E] p-7 text-[#E8EDEB] lg:col-span-5">
          <Corners className="text-white/50" />
          <h3 className="mb-2 text-xl text-white sm:text-[22px]">Need help choosing?</h3>
          <p className="mb-[18px] text-[13.5px] leading-relaxed text-[#8A9E98]">
            Our team can help you select the best connection method for your needs.
          </p>
          <div className="flex flex-wrap gap-2.5">
            <NavLink
              href="/contact"
              className="inline-flex items-center gap-2 bg-primary px-[18px] py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#5A8A78]"
            >
              Contact support
            </NavLink>
            <NavLink
              href="/auth/register"
              className="inline-flex items-center gap-2 border border-white/30 px-[18px] py-2.5 text-sm font-semibold text-[#E8EDEB] transition-colors hover:bg-white/10"
            >
              Get free mailbox
            </NavLink>
          </div>
        </div>
      </div>
    </section>
  );
}
