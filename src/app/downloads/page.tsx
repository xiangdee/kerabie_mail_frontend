import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Corners } from "@/components/ui/corners";
import { NavLink } from "@/components/NavLink";
import Image from "next/image";
import { Smartphone, Tablet, Globe } from "lucide-react";
import { blackblazebucket, IMAP_HOST, SMTP_HOST } from "@/lib/constants/links";

const apps = [
  {
    icon: Smartphone,
    title: "iOS",
    description: "iPhone and iPad, with Face ID unlock and push in under a second.",
    cta: "App Store",
    tint: false,
  },
  {
    icon: Tablet,
    title: "Android",
    description: "Material design, work-profile support and offline drafts.",
    cta: "Google Play",
    tint: false,
  },
  {
    icon: Globe,
    title: "Web client",
    description: "Nothing to install — full keyboard control in any modern browser.",
    cta: "Open webmail",
    tint: true,
  },
];

const serverSettings = [
  { setting: "Incoming (IMAP)", server: IMAP_HOST, port: "993", security: "SSL / TLS" },
  { setting: "Outgoing (SMTP)", server: SMTP_HOST, port: "465", security: "SSL / TLS" },
  { setting: "Outgoing (submission)", server: SMTP_HOST, port: "587", security: "STARTTLS" },
];

const webmailUrl = process.env.NEXT_PUBLIC_WEBMAIL_URL ?? "https://webmail.kerabie.email";

const Downloads = () => {
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
              DOWNLOADS
            </span>
          </span>

          <h1 className="mx-auto mt-5 mb-3 max-w-[22ch] text-4xl leading-[1.08] tracking-tight sm:text-[54px]">
            Your mailbox on <span className="text-primary">every device</span>
          </h1>
          <p className="mx-auto max-w-[56ch] text-base text-muted-foreground">
            Native apps for phone and desktop, a fast web client, and standard IMAP for everything else.
          </p>
        </section>

        {/* Desktop app */}
        <section className="grid grid-cols-1 gap-3.5 pt-11 lg:grid-cols-12">
          <div className="blueprint relative col-span-1 flex min-h-[340px] flex-col justify-center overflow-hidden bg-[#2E4A3F] p-8 text-[#E8EDEB] lg:col-span-7">
            <Corners className="text-white/50" />
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(232,237,235,.055) 1px,transparent 1px),linear-gradient(90deg,rgba(232,237,235,.055) 1px,transparent 1px)",
                backgroundSize: "50px 50px",
              }}
            />
            <div className="relative">
              <span className="inline-flex items-center gap-2 font-mono text-[10.5px] tracking-[.12em] text-[#8FB3A6]">
                <span className="block h-1.5 w-1.5 animate-[k-pulse_2s_infinite] bg-[#4CAF80]" />
                VERSION 3.4.2 — RELEASED THIS WEEK
              </span>
              <h2 className="mb-2.5 mt-4 text-[32px] tracking-tight text-white">Kerabie for desktop</h2>
              <p className="mb-[22px] max-w-[44ch] text-[14.5px] leading-relaxed text-[#B7CEC5]">
                Offline search, multi-account switching and native notifications. Signs you in
                with the same account as the web client.
              </p>
              <div className="flex flex-wrap gap-2.5">
                <NavLink
                  href="/auth/register"
                  className="inline-flex items-center gap-2 bg-[#E8EDEB] px-[18px] py-3 text-sm font-semibold text-[#1A1F1E] transition-colors hover:bg-white"
                >
                  macOS (Apple silicon)
                </NavLink>
                <NavLink
                  href="/auth/register"
                  className="inline-flex items-center gap-2 border border-white/35 px-[18px] py-3 text-sm font-semibold text-[#E8EDEB] transition-colors hover:bg-white/10"
                >
                  Windows 10 / 11
                </NavLink>
                <NavLink
                  href="/auth/register"
                  className="inline-flex items-center gap-2 border border-white/35 px-[18px] py-3 text-sm font-semibold text-[#E8EDEB] transition-colors hover:bg-white/10"
                >
                  Linux (.deb / .rpm)
                </NavLink>
              </div>
            </div>
          </div>
          <div className="blueprint relative col-span-1 min-h-[340px] overflow-hidden bg-muted lg:col-span-5">
            <Corners />
            <Image
              src={blackblazebucket + "/assets/images/misc/desktop-image.jpg"}
              alt="Kerabie desktop app"
              fill
              className="object-cover"
            />
          </div>

          {apps.map((app) => (
            <div
              key={app.title}
              className={`blueprint relative col-span-1 p-[26px] transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(26,31,30,.08)] lg:col-span-4 ${app.tint ? "bg-muted" : ""}`}
            >
              <Corners />
              <app.icon size={20} className="text-primary" strokeWidth={1.5} />
              <h3 className="mb-1.5 mt-3.5 text-[21px]">{app.title}</h3>
              <p className="mb-4 text-[13.5px] leading-relaxed text-muted-foreground">{app.description}</p>
              <a
                href={app.title === "Web client" ? webmailUrl : "/auth/register"}
                target={app.title === "Web client" ? "_blank" : undefined}
                rel={app.title === "Web client" ? "noopener noreferrer" : undefined}
                className={`inline-flex items-center gap-2 border border-border px-4 py-2.5 text-[13.5px] font-semibold text-foreground transition-colors hover:bg-primary-muted ${app.tint ? "bg-white" : ""}`}
              >
                {app.cta}
              </a>
            </div>
          ))}
        </section>

        {/* Manual setup */}
        <section className="pt-14">
          <div className="mb-3.5 flex items-center gap-3.5">
            <span className="font-mono text-[11px] tracking-[.12em] text-muted-foreground">MANUAL SETUP — IMAP / SMTP</span>
            <span className="h-px flex-1 bg-border" />
          </div>
          <div className="blueprint relative overflow-x-auto p-[22px]">
            <Corners />
            <table className="w-full min-w-[520px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="pb-2.5 font-semibold">Setting</th>
                  <th className="pb-2.5 font-semibold">Server</th>
                  <th className="pb-2.5 font-semibold">Port</th>
                  <th className="pb-2.5 font-semibold">Security</th>
                </tr>
              </thead>
              <tbody>
                {serverSettings.map((row) => (
                  <tr key={`${row.setting}-${row.port}`} className="border-b border-border last:border-b-0">
                    <td className="py-2.5">{row.setting}</td>
                    <td className="py-2.5 font-mono text-[13px]">{row.server}</td>
                    <td className="py-2.5">{row.port}</td>
                    <td className="py-2.5">{row.security}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-3.5 text-[12.5px] text-muted-foreground">
              Username is your full email address. Generate an app password in Settings → Security
              if two-factor auth is on. Full walkthrough in the{" "}
              <NavLink href="/help" className="underline hover:text-foreground">help centre</NavLink>.
            </p>
          </div>
        </section>

        {/* Final CTA */}
        <section className="pb-[72px] pt-14">
          <div className="blueprint relative bg-muted px-6 py-11 text-center sm:px-10">
            <Corners />
            <h2 className="mb-2.5 text-[32px] tracking-tight">Need an account first?</h2>
            <p className="mx-auto mb-[22px] max-w-[48ch] text-[15px] text-muted-foreground">
              Claim your free mailbox, then sign in on every device with the same credentials.
            </p>
            <NavLink
              href="/auth/register"
              className="inline-flex items-center gap-2 border border-primary bg-primary px-[22px] py-3.5 text-[15px] font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-primary-hover"
            >
              Get free mailbox
            </NavLink>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Downloads;
