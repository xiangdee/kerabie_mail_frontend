import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Corners } from "@/components/ui/corners";
import { NavLink } from "@/components/NavLink";
import { blackblazebucket } from "@/lib/constants/links";
import Image from "next/image";
import AboutBanner from "@/components/aboutPage/AboutBanner";

const stats = [
  { value: "15+", label: "years building mail infrastructure", tint: false },
  { value: "10k+", label: "businesses sending every day", tint: true },
  { value: "99.9%", label: "uptime, measured monthly", tint: false },
];

const beliefs = [
  {
    index: "01",
    title: "Delivery is the product",
    description: "A feature nobody sees matters more than one they do. Authentication, reputation and routing are handled before you ever press send.",
    tint: false,
  },
  {
    index: "02",
    title: "Your mailbox, your data",
    description: "No scanning, no ad profiling, no training on your mail. Choose a storage region and we keep it there.",
    tint: true,
  },
  {
    index: "03",
    title: "Support by people who build it",
    description: "Every ticket reaches someone who can read the logs and fix the cause, in every timezone we sell into.",
    tint: false,
  },
];

const timeline = [
  { year: "2011", title: "First managed mail platform", detail: "Built for regional hosting resellers." },
  { year: "2018", title: "Own sending infrastructure", detail: "Dedicated pools, full SPF/DKIM/DMARC automation." },
  { year: "2022", title: "Kerabie opens to businesses", detail: "Self-serve domains, apps on every platform." },
  { year: "2025", title: "AI Compose and partner program", detail: "10,000 businesses, two storage regions.", tint: true },
];

const team = [
  { name: "Sarah Chen", role: "CEO & Co-founder", bio: "Former Gmail engineer with a passion for reimagining communication." },
  { name: "Marcus Johnson", role: "CTO & Co-founder", bio: "Infrastructure expert who scaled systems at multiple Fortune 500s." },
  { name: "Priya Sharma", role: "Head of Product", bio: "Design-thinking advocate focused on delightful user experiences." },
  { name: "David Kim", role: "Head of Security", bio: "Cybersecurity veteran committed to enterprise-grade protection." },
];

const AboutUs = () => {
  return (
    <div className="min-h-screen max-w-full overflow-x-hidden bg-background">
      <Header />

      <main className="mx-auto max-w-[1240px] px-4">
        <AboutBanner />

        {/* Photo + stats */}
        <section className="grid grid-cols-1 gap-3.5 pt-11 lg:grid-cols-12">
          <div className="blueprint duotone relative col-span-1 h-[380px] lg:col-span-7">
            <Corners />
            <Image
              src={blackblazebucket + "/assets/images/misc/about-team.jpg"}
              alt="Three colleagues reviewing work on a laptop"
              fill
              className="object-cover"
            />
          </div>
          <div className="col-span-1 grid content-start gap-3.5 lg:col-span-5">
            {stats.map((stat) => (
              <div key={stat.label} className={`blueprint relative p-6 ${stat.tint ? "bg-muted" : ""}`}>
                <Corners />
                <span className="block text-[34px] font-bold leading-none tracking-tight">{stat.value}</span>
                <span className="block text-[13px] text-muted-foreground">{stat.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* What we believe */}
        <section className="pt-16">
          <div className="mb-4 flex items-center gap-3.5">
            <span className="font-mono text-[11px] tracking-[.12em] text-muted-foreground">WHAT WE BELIEVE</span>
            <span className="h-px flex-1 bg-border" />
          </div>
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
            {beliefs.map((belief) => (
              <div
                key={belief.index}
                className={`blueprint relative p-[26px] transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(26,31,30,.08)] ${belief.tint ? "bg-muted" : ""}`}
              >
                <Corners />
                <span className="font-mono text-[11px] text-primary">{belief.index}</span>
                <h3 className="mb-2 mt-3 text-[21px]">{belief.title}</h3>
                <p className="text-[13.5px] leading-relaxed text-muted-foreground">{belief.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How we got here */}
        <section className="pt-16">
          <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-12">
            <div className="blueprint relative overflow-hidden bg-[#2E4A3F] p-8 text-[#E8EDEB] lg:col-span-5">
              <Corners className="text-white/50" />
              <div
                className="pointer-events-none absolute inset-y-0 w-[36%] animate-[k-sweep_9s_ease-in-out_infinite]"
                style={{ background: "linear-gradient(90deg,transparent,rgba(90,138,120,.26),transparent)" }}
              />
              <span className="relative font-mono text-[11px] tracking-[.12em] text-[#8FB3A6]">HOW WE GOT HERE</span>
              <h2 className="relative mb-3 mt-3.5 text-[30px] leading-[1.15] tracking-tight text-white">
                From a hosting side-project to 10,000 businesses.
              </h2>
              <p className="relative text-sm leading-relaxed text-[#B7CEC5]">
                We started by running mail for other people&apos;s customers. The tooling we wished
                existed became Kerabie — the same infrastructure, opened up to any business that
                wants email on its own domain.
              </p>
            </div>
            <div className="col-span-1 grid content-start lg:col-span-7">
              {timeline.map((item) => (
                <div
                  key={item.year}
                  className={`blueprint relative grid grid-cols-[auto_1fr] items-baseline gap-5 px-6 py-5 -mt-px first:mt-0 ${item.tint ? "bg-muted" : ""}`}
                >
                  <Corners />
                  <span className="font-mono text-xs text-primary">{item.year}</span>
                  <span>
                    <span className="block text-[15px] font-semibold">{item.title}</span>
                    <span className="block text-[13px] text-muted-foreground">{item.detail}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Meet the team */}
        <section className="pt-16">
          <div className="mb-4 flex items-center gap-3.5">
            <span className="font-mono text-[11px] tracking-[.12em] text-muted-foreground">MEET THE TEAM</span>
            <span className="h-px flex-1 bg-border" />
          </div>
          <p className="mb-6 max-w-[58ch] text-[15px] text-muted-foreground">
            We&apos;re a diverse group of engineers, designers and problem-solvers united by a
            shared vision for better communication.
          </p>
          <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
            {team.map((member, i) => (
              <div
                key={member.name}
                className={`blueprint relative p-6 transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(26,31,30,.08)] ${i % 2 === 1 ? "bg-muted" : ""}`}
              >
                <Corners />
                <span className="grid h-11 w-11 place-items-center border border-border bg-primary-muted font-mono text-lg font-bold text-primary">
                  {member.name.charAt(0)}
                </span>
                <h3 className="mb-0.5 mt-3.5 text-base font-semibold">{member.name}</h3>
                <p className="mb-2 text-[12.5px] font-medium text-primary">{member.role}</p>
                <p className="text-[13px] leading-relaxed text-muted-foreground">{member.bio}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Join our journey */}
        <section className="pt-16">
          <div className="blueprint relative overflow-hidden bg-[#1A1F1E] px-6 py-12 text-center text-[#E8EDEB] sm:px-10">
            <Corners className="text-white/50" />
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(232,237,235,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(232,237,235,.05) 1px,transparent 1px)",
                backgroundSize: "48px 48px",
              }}
            />
            <div className="relative">
              <h2 className="mb-2.5 text-[34px] tracking-tight text-white">Join Our Journey</h2>
              <p className="mx-auto mb-[22px] max-w-[50ch] text-[15px] text-[#8A9E98]">
                We&apos;re always looking for talented, passionate people to help us build the
                future of email. Check out our open positions or just say hello.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <NavLink
                  href="/contact"
                  className="inline-flex items-center gap-2 bg-primary px-[22px] py-3.5 text-[15px] font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-[#5A8A78]"
                >
                  View careers
                </NavLink>
                <NavLink
                  href="/contact"
                  className="inline-flex items-center gap-2 border border-white/30 px-[22px] py-3.5 text-[15px] font-semibold text-[#E8EDEB] transition-colors hover:bg-white/10"
                >
                  Contact us
                </NavLink>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="pb-[72px] pt-16">
          <div className="blueprint relative overflow-hidden bg-muted px-6 py-12 text-center sm:px-10">
            <Corners />
            <h2 className="mb-2.5 text-[34px] tracking-tight">See it on your own domain.</h2>
            <p className="mx-auto mb-[22px] max-w-[50ch] text-[15px] text-muted-foreground">
              One free mailbox, no card, no migration fee.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <NavLink
                href="/auth/register"
                className="inline-flex items-center gap-2 border border-primary bg-primary px-[22px] py-3.5 text-[15px] font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-primary-hover"
              >
                Get free mailbox
              </NavLink>
              <NavLink
                href="/contact"
                className="inline-flex items-center gap-2 border border-border bg-white px-[22px] py-3.5 text-[15px] font-semibold text-foreground transition-colors hover:bg-primary-muted"
              >
                Talk to us
              </NavLink>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default AboutUs;
