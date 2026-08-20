import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FeatureCard } from "@/components/FeatureCard";
import { Corners } from "@/components/ui/corners";
import { NavLink } from "@/components/NavLink";
import {
  Users, Calendar, Smartphone,
  ShieldCheck, Zap, Globe, ArrowRight, Clock,
} from "lucide-react";
import EmailFeaturesBanner from "@/components/featuresPage/EmailFeaturesBanner";
import Image from "next/image";
import { blackblazebucket } from "@/lib/constants/links";

const coreFeatures = [
  {
    image: blackblazebucket + '/assets/images/icons/sheild-icon.png',
    title: "Guaranteed delivery",
    description: "Our infrastructure is optimised to bypass spam filters and ensure 99.9% inbox placement.",
    tint: false,
  },
  {
    image: blackblazebucket + '/assets/images/icons/read-receipts-icon.png',
    title: "Real-time tracking",
    description: "Know exactly when your emails are opened, with instant push notifications and read receipts.",
    tint: true,
  },
  {
    image: blackblazebucket + '/assets/images/icons/enterprise-security-icon-2.png',
    title: "Enterprise security",
    description: "Encryption at rest and advanced phishing protection to keep your business data safe.",
    tint: false,
  },
];

const secondaryFeatures = [
  { icon: Clock, title: "Email scheduling", description: "Compose now, send at the perfect peak-engagement time.", isImage: false },
  { icon: blackblazebucket + '/assets/images/icons/template-icon.png', title: "Smart templates", description: "Standardise your team's outreach with beautiful layouts.", isImage: true },
  { icon: Users, title: "Team collaboration", description: "Manage multiple business identities and shared inboxes.", isImage: false },
  { icon: blackblazebucket + '/assets/images/icons/bell-icon.png', title: "Smart reminders", description: "Gentle nudges to follow up on messages that haven't been replied to.", isImage: true, tint: true },
  { icon: blackblazebucket + '/assets/images/icons/filter-icon.png', title: "Inbox automation", description: "Custom rules to filter, label and archive emails automatically.", isImage: true, tint: true },
  { icon: blackblazebucket + '/assets/images/icons/instant-search-icon.png', title: "Instant search", description: "Find any attachment or conversation from years ago in milliseconds.", isImage: true, tint: true },
  { icon: blackblazebucket + '/assets/images/icons/signature-icon.png', title: "Brand signatures", description: "Dynamic signatures that update across your entire organisation.", isImage: true },
  { icon: Calendar, title: "Integrated calendar", description: "Book meetings without ever leaving your compose window.", isImage: false },
  { icon: Smartphone, title: "Mobile excellence", description: "A desktop-class experience optimised for your pocket.", isImage: false },
];

const Features = () => {
  return (
    <div className="min-h-screen max-w-full overflow-x-hidden bg-background">
      <Header />

      <main className="mx-auto max-w-[1240px] px-4">
        {/* Hero */}
        <EmailFeaturesBanner />

        {/* Live demo */}
        <section className="pt-9">
          <div className="blueprint relative overflow-hidden bg-muted">
            <Corners />
            <div className="flex items-center justify-between gap-3 border-b border-border bg-white px-4 py-3">
              <span className="flex items-center gap-2.5 font-mono text-[10.5px] tracking-[.12em] text-muted-foreground">
                <span className="block h-1.5 w-1.5 animate-[k-pulse_2s_infinite] bg-[#4CAF80]" />
                KERABIE MAIL — LIVE DEMO
              </span>
              <span className="font-mono text-[10.5px] tracking-[.12em] text-muted-foreground">
                INBOX / STARRED
              </span>
            </div>
            <Image
              src={blackblazebucket + '/assets/images/misc/scene.gif'}
              alt="Kerabie Mail inbox demo"
              width={1200}
              height={675}
              unoptimized
              className="block h-auto w-full bg-primary-muted"
            />
          </div>
        </section>

        {/* Core value pillars */}
        <section className="pt-[72px] text-center">
          <h2 className="mx-auto mb-3 max-w-[20ch] text-[32px] leading-[1.12] tracking-tight sm:text-[42px]">
            Powerful email that <span className="text-primary">takes you places.</span>
          </h2>
          <p className="mx-auto max-w-[58ch] text-[15.5px] leading-relaxed text-muted-foreground">
            Kerabie isn&apos;t just an inbox. It&apos;s a high-performance communication engine
            designed for teams who value speed, security and deliverability.
          </p>
          <div className="mt-8 grid grid-cols-1 gap-3.5 text-left sm:grid-cols-3">
            {coreFeatures.map((f) => (
              <div
                key={f.title}
                className={`blueprint relative p-7 transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(26,31,30,.08)] ${f.tint ? "bg-muted" : ""}`}
              >
                <Corners />
                <span className="grid h-10 w-10 place-items-center border border-border bg-primary-muted">
                  <Image src={f.image} alt={f.title} width={19} height={19} className="object-contain" />
                </span>
                <h3 className="mb-2 mt-4 text-[21px]">{f.title}</h3>
                <p className="text-[13.5px] leading-relaxed text-muted-foreground">{f.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Secondary feature grid */}
        <section className="pt-[76px]">
          <div className="mb-[26px]">
            <h2 className="mb-2 text-[34px] tracking-tight">Everything you need to master your inbox</h2>
            <p className="max-w-[52ch] text-[15px] text-muted-foreground">
              From automation to aesthetics, we&apos;ve built every tool with the modern professional in mind.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
            {secondaryFeatures.map((feature) => (
              <FeatureCard
                key={feature.title}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                isImage={feature.isImage}
                tint={feature.tint}
              />
            ))}
          </div>
        </section>
      </main>

      {/* Global infrastructure */}
      <section className="relative mt-[76px] overflow-hidden bg-primary text-white">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(232,237,235,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(232,237,235,.05) 1px,transparent 1px)",
            backgroundSize: "52px 52px",
          }}
        />
        <div className="relative mx-auto grid max-w-[1240px] grid-cols-1 items-center gap-6 px-4 py-[72px] lg:grid-cols-12">
          <div className="lg:col-span-5">
            <h2 className="mb-3.5 text-[34px] leading-[1.15] tracking-tight text-white">
              Global infrastructure.<br />Local performance.
            </h2>
            <p className="mb-[22px] max-w-[44ch] text-[14.5px] leading-relaxed text-[#D8E5E0]">
              Our servers are distributed across 12 global regions. Your emails are processed and
              sent with zero latency, no matter where your team is located.
            </p>
            <div className="grid gap-3">
              <span className="flex items-center gap-2.5 text-sm">
                <Globe size={17} className="text-[#B7CEC5]" strokeWidth={1.5} />
                12 data centres worldwide
              </span>
              <span className="flex items-center gap-2.5 text-sm">
                <Zap size={17} className="text-[#B7CEC5]" strokeWidth={1.5} />
                99.9% uptime SLA
              </span>
              <span className="flex items-center gap-2.5 text-sm">
                <ShieldCheck size={17} className="text-[#B7CEC5]" strokeWidth={1.5} />
                GDPR &amp; SOC 2 compliant
              </span>
            </div>
          </div>
          <div className="blueprint relative min-h-[380px] overflow-hidden border-white/25 bg-[#1A1F1E]/20 lg:col-span-7">
            <Corners className="text-white/50" />
            <Image
              src={blackblazebucket + '/assets/images/misc/app-screenshot.png'}
              alt="Kerabie inbox on a laptop"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-[1240px] px-4 py-[76px] text-center">
        <h2 className="mb-2.5 text-[34px] tracking-tight">Ready to upgrade your email experience?</h2>
        <p className="mx-auto mb-6 max-w-[46ch] text-[15px] text-muted-foreground">
          Join thousands of professionals who have reclaimed their time with Kerabie.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <NavLink
            href="/auth/register"
            className="inline-flex items-center gap-2 border border-primary bg-primary px-[22px] py-3.5 text-[15px] font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-primary-hover"
          >
            Get started for free
            <ArrowRight size={15} />
          </NavLink>
          <NavLink
            href="/contact"
            className="inline-flex items-center gap-2 border border-border px-[22px] py-3.5 text-[15px] font-semibold text-foreground transition-colors hover:bg-muted"
          >
            Contact sales
          </NavLink>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Features;
