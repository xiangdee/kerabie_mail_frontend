import { Corners } from "@/components/ui/corners";
import { NavLink } from "@/components/NavLink";
import { blackblazebucket } from "@/lib/constants/links";
import Image from "next/image";

export default function EmailPlatformHero() {
  return (
    <section id="about" className="grid grid-cols-1 gap-3.5 pt-[78px] lg:grid-cols-12">
      <div className="col-span-1 flex flex-col justify-center py-2 lg:col-span-6 lg:pr-10">
        <span className="font-mono text-[11px] uppercase tracking-[.14em] text-primary">About Kerabie</span>
        <h2 className="mt-3.5 mb-4 text-3xl leading-[1.1] tracking-tight sm:text-4xl">
          Built for businesses that need email to just work.
        </h2>
        <p className="mb-3 text-[15.5px] leading-relaxed text-[#3A4240]">
          Kerabie delivers a stable, secure, and fully optimised email experience that respects
          your mailbox as it scales. From high deliverability to intuitive features, we help
          businesses communicate with clarity and confidence.
        </p>
        <div className="mt-3.5 flex flex-wrap gap-3">
          <NavLink
            href="/auth/register"
            className="inline-flex items-center gap-2 border border-primary bg-primary px-5 py-3.5 text-[14.5px] font-semibold text-primary-foreground transition-all hover:-translate-y-0.5 hover:bg-primary-hover"
          >
            Get free mailbox
          </NavLink>
          <a
            href="#features"
            className="inline-flex items-center gap-2 border border-border px-5 py-3.5 text-[14.5px] font-semibold text-foreground transition-colors hover:bg-muted"
          >
            See features
          </a>
        </div>
      </div>

      <div className="relative col-span-1 lg:col-span-6">
        <div className="blueprint duotone relative h-[340px]">
          <Corners />
          <Image
            src={blackblazebucket + "/assets/images/misc/about-team.jpg"}
            alt="Kerabie team working in an open-plan office"
            fill
            className="object-cover"
          />
        </div>
        <div className="blueprint absolute -bottom-[18px] -left-[18px] animate-[k-float_7s_ease-in-out_infinite] bg-white px-[18px] py-3.5 shadow-[0_14px_34px_rgba(26,31,30,.14)]">
          <Corners />
          <span className="block text-[28px] font-bold leading-none tracking-tight">15+</span>
          <span className="block text-xs text-muted-foreground">years of experience</span>
        </div>
      </div>
    </section>
  );
}
