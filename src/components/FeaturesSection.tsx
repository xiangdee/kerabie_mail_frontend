import { blackblazebucket } from "@/lib/constants/links";
import { Corners } from "@/components/ui/corners";
import { NavLink } from "@/components/NavLink";
import {
  Check, WandSparkles, Clock, FileText, Search, PenTool, RefreshCw, Calendar, Smartphone, ArrowRight,
} from "lucide-react";
import Image from "next/image";
import type { ComponentType } from "react";

const FeaturesSection = () => {
  return (
    <section id="features" className="pt-[88px]">
      <div className="mx-auto mb-[26px] max-w-[620px] text-center">
        <h2 className="mb-2 text-3xl tracking-tight sm:text-4xl">
          Everything you need to <span className="text-primary">succeed</span>
        </h2>
        <p className="text-[15px] text-muted-foreground">
          Powerful features designed to streamline your email workflow and boost productivity.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-6">
        {/* Guaranteed delivery confidence */}
        <div className="blueprint relative col-span-2 overflow-hidden transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(26,31,30,.09)] sm:col-span-4">
          <Corners />
          <div className="grid min-h-[340px] grid-cols-1 sm:grid-cols-2">
            <div className="flex flex-col justify-center p-7">
              <span className="grid h-[34px] w-[34px] place-items-center border border-border bg-primary-muted">
                <Check size={17} className="text-primary" strokeWidth={2} />
              </span>
              <h3 className="mb-2 mt-4 text-xl sm:text-[22px]">Guaranteed delivery confidence</h3>
              <p className="text-[13.5px] leading-relaxed text-muted-foreground">
                Engineered for maximum inbox delivery and reliability — with authentication handled for you.
              </p>
            </div>
            <div className="relative min-h-[180px] border-t border-border bg-muted sm:border-l sm:border-t-0">
              <Image
                src={blackblazebucket + "/assets/images/feature-imgs/guaranteed-delivery.png"}
                alt="Guaranteed delivery confidence in Kerabie webmail"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>

        {/* AI Compose */}
        <div className="blueprint relative col-span-2 overflow-hidden bg-[#1A1F1E] p-[26px] text-[#E8EDEB] transition-transform duration-200 hover:-translate-y-0.5">
          <Corners className="text-white/50" />
          <div
            className="pointer-events-none absolute inset-y-0 w-2/5 animate-[k-sweep_6s_ease-in-out_infinite]"
            style={{ background: "linear-gradient(90deg,transparent,rgba(90,138,120,.3),transparent)" }}
          />
          <span className="relative grid h-[34px] w-[34px] place-items-center border border-white/30">
            <WandSparkles size={17} className="text-[#8FB3A6]" strokeWidth={1.5} />
          </span>
          <h3 className="relative mb-2 mt-4 text-xl text-white sm:text-[22px]">AI Compose</h3>
          <p className="relative mb-4 text-[13.5px] leading-relaxed text-[#8FB3A6]">
            Compose with the power of AI — drafts, replies and tone in your own voice.
          </p>
          <div className="relative border border-white/20 p-3 font-mono text-[11.5px] leading-relaxed text-[#B7CEC5]">
            &gt; draft a renewal reply
            <span className="ml-0.5 inline-block h-3.5 w-1.5 animate-[k-pulse_1.2s_steps(1)_infinite] bg-[#4CAF80] align-middle" />
          </div>
        </div>

        {/* Email scheduling */}
        <FeatureTile icon={Clock} title="Email scheduling" description="Send at the optimal time, in your recipient's timezone." />
        {/* Email templates */}
        <FeatureTile icon={FileText} title="Email templates" description="Pre-built and customisable templates for faster communication." />
        {/* Advanced search */}
        <FeatureTile icon={Search} title="Advanced search" description="Locate emails, attachments and conversations instantly." tint />

        {/* Custom signatures */}
        <div className="blueprint relative col-span-2 overflow-hidden transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(26,31,30,.09)] sm:col-span-3">
          <Corners />
          <div className="px-[26px] pb-5 pt-[26px]">
            <PenTool size={20} className="text-primary" strokeWidth={1.5} />
            <h3 className="mb-1.5 mt-3.5 text-lg sm:text-xl">Custom signatures</h3>
            <p className="text-[13.5px] leading-relaxed text-muted-foreground">
              Create consistent branding across your team — pushed to every seat at once.
            </p>
          </div>
          <div className="relative h-[150px] border-t border-border bg-muted">
            <Image
              src={blackblazebucket + "/assets/images/feature-imgs/email-signature.png"}
              alt="Email signature editor"
              fill
              className="object-cover"
            />
          </div>
        </div>

        {/* Calendar integration */}
        <div className="blueprint relative col-span-2 overflow-hidden transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(26,31,30,.09)] sm:col-span-3">
          <Corners />
          <div className="px-[26px] pb-5 pt-[26px]">
            <Calendar size={20} className="text-primary" strokeWidth={1.5} />
            <h3 className="mb-1.5 mt-3.5 text-lg sm:text-xl">Calendar integration</h3>
            <p className="text-[13.5px] leading-relaxed text-muted-foreground">
              Manage events, reminders and scheduling beside your inbox.
            </p>
          </div>
          <div className="relative h-[150px] border-t border-border bg-muted">
            <Image
              src={blackblazebucket + "/assets/images/feature-imgs/calender.png"}
              alt="Calendar month view"
              fill
              className="object-cover"
            />
          </div>
        </div>

        {/* Vacation responders */}
        <FeatureTile icon={RefreshCw} title="Vacation responders" description="Automated replies while you're away, per mailbox or team." />

        {/* Mobile friendly */}
        <div className="blueprint relative col-span-1 overflow-hidden transition-transform duration-200 hover:-translate-y-0.5 sm:col-span-2">
          <Corners />
          <div className="px-[26px] pb-4 pt-[26px]">
            <Smartphone size={20} className="text-primary" strokeWidth={1.5} />
            <h3 className="mb-1.5 mt-3.5 text-lg sm:text-xl">Mobile friendly</h3>
            <p className="text-[13.5px] leading-relaxed text-muted-foreground">
              Fully responsive across all devices, plus native apps.
            </p>
          </div>
          <div className="relative h-[118px] border-t border-border bg-muted">
            <Image
              src={blackblazebucket + "/assets/images/feature-imgs/mobile-friendly.png"}
              alt="Kerabie webmail on mobile"
              fill
              className="object-cover"
            />
          </div>
        </div>

        {/* Start free CTA */}
        <div id="download" className="blueprint relative col-span-1 flex flex-col justify-between bg-primary p-[26px] text-white sm:col-span-2">
          <Corners className="text-white/55" />
          <div>
            <h3 className="mb-2 text-xl text-white sm:text-[22px]">Start free today</h3>
            <p className="mb-[18px] text-[13.5px] leading-relaxed text-white/85">
              One mailbox on us. Upgrade only when your team grows.
            </p>
          </div>
          <NavLink
            href="/auth/register"
            className="flex items-center justify-between gap-2 bg-white px-4 py-3 text-sm font-semibold text-primary-hover transition-transform hover:-translate-y-0.5"
          >
            Get free mailbox
            <ArrowRight size={14} />
          </NavLink>
        </div>
      </div>
    </section>
  );
};

const FeatureTile = ({
  icon: Icon,
  title,
  description,
  tint,
}: {
  icon: ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
  title: string;
  description: string;
  tint?: boolean;
}) => (
  <div
    className={`blueprint relative col-span-1 p-[26px] transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(26,31,30,.08)] sm:col-span-2 ${tint ? "bg-muted" : ""}`}
  >
    <Corners />
    <Icon size={20} className="text-primary" strokeWidth={1.5} />
    <h3 className="mb-1.5 mt-3.5 text-lg sm:text-xl">{title}</h3>
    <p className="text-[13.5px] leading-relaxed text-muted-foreground">{description}</p>
  </div>
);

export default FeaturesSection;
