'use client';
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Corners } from "@/components/ui/corners";
import { NavLink } from "@/components/NavLink";
import Image from "next/image";
import { useState } from "react";

const inquiryTags = ["Sales & pricing", "Technical support", "Migration help", "Partnerships"];

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    teamSize: '',
    inquiry: inquiryTags[0],
    message: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
  };

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
              CONTACT US
            </span>
          </span>

          <h1 className="mx-auto mt-5 mb-3 max-w-[20ch] text-4xl leading-[1.08] tracking-tight sm:text-[54px]">
            Let&apos;s start a <span className="text-primary">conversation</span>
          </h1>
          <p className="mx-auto max-w-[56ch] text-base text-muted-foreground">
            Have questions about Kerabie? Want to explore enterprise solutions? Our team is here to
            help you succeed.
          </p>
        </section>

        {/* Form + sidebar */}
        <section className="grid grid-cols-1 gap-3.5 pt-11 lg:grid-cols-12">
          <form onSubmit={handleSubmit} className="blueprint relative col-span-1 p-8 lg:col-span-7">
            <Corners />
            <h2 className="mb-1.5 text-2xl">Send us a message</h2>
            <p className="mb-[22px] text-[13.5px] text-muted-foreground">
              We reply to every message — most within two hours.
            </p>

            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs text-muted-foreground">Full name</label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  type="text"
                  placeholder="Amélie Laurent"
                  className="h-11 w-full border border-border bg-white px-3.5 text-sm outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs text-muted-foreground">Work email</label>
                <input
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  type="email"
                  placeholder="you@company.com"
                  className="h-11 w-full border border-border bg-white px-3.5 text-sm outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs text-muted-foreground">Company</label>
                <input
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  type="text"
                  placeholder="Northgate Logistics"
                  className="h-11 w-full border border-border bg-white px-3.5 text-sm outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs text-muted-foreground">Team size</label>
                <input
                  name="teamSize"
                  value={formData.teamSize}
                  onChange={handleChange}
                  type="text"
                  placeholder="1–10 mailboxes"
                  className="h-11 w-full border border-border bg-white px-3.5 text-sm outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="mt-3.5">
              <label className="mb-1.5 block text-xs text-muted-foreground">What can we help with?</label>
              <div className="flex flex-wrap gap-2">
                {inquiryTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setFormData({ ...formData, inquiry: tag })}
                    className={`border px-3 py-1.5 text-[12.5px] transition-colors ${
                      formData.inquiry === tag
                        ? "border-primary bg-primary-muted text-primary"
                        : "border-border hover:bg-muted"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-3.5">
              <label className="mb-1.5 block text-xs text-muted-foreground">Message</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows={4}
                placeholder="Tell us about your domains, team size and what you're moving from."
                className="w-full border border-border bg-white p-3.5 text-sm outline-none focus:border-primary"
              />
            </div>

            <div className="mt-[18px] flex flex-wrap items-center gap-3">
              <button
                type="submit"
                className="blueprint relative inline-flex items-center gap-2 border border-primary bg-primary px-5 py-3.5 text-[14.5px] font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-primary-hover"
              >
                <Corners className="text-white/50" />
                Send message
              </button>
              <span className="text-[12.5px] text-muted-foreground">
                Or just claim a mailbox —{" "}
                <NavLink href="/auth/register" className="text-primary underline">start free</NavLink>.
              </span>
            </div>
          </form>

          <div className="col-span-1 grid content-start gap-3.5 lg:col-span-5">
            <div className="blueprint relative overflow-hidden bg-[#2E4A3F] p-6 text-[#E8EDEB]">
              <Corners className="text-white/50" />
              <div
                className="pointer-events-none absolute inset-y-0 w-[38%] animate-[k-sweep_8s_ease-in-out_infinite]"
                style={{ background: "linear-gradient(90deg,transparent,rgba(90,138,120,.26),transparent)" }}
              />
              <span className="relative inline-flex items-center gap-2 font-mono text-[10.5px] tracking-[.12em] text-[#8FB3A6]">
                <span className="block h-1.5 w-1.5 animate-[k-pulse_2s_infinite] bg-[#4CAF80]" />
                SUPPORT ONLINE
              </span>
              <h3 className="relative mb-2 mt-3.5 text-xl text-white">Under 2 hours, every time</h3>
              <p className="relative text-[13.5px] leading-relaxed text-[#B7CEC5]">
                First response in under two hours, 24/7. Priority plans get a named engineer and a
                one-hour target on anything that blocks sending.
              </p>
            </div>

            <div className="blueprint relative p-6">
              <Corners />
              <span className="block font-mono text-[10.5px] tracking-[.12em] text-muted-foreground">REACH US</span>
              <div className="mt-3 grid gap-2.5 text-sm">
                <span className="flex justify-between gap-3">
                  <span className="text-muted-foreground">Support</span>
                  <a href="mailto:support@kerabie.email" className="font-mono text-[13px]">support@kerabie.email</a>
                </span>
                <span className="flex justify-between gap-3">
                  <span className="text-muted-foreground">Sales</span>
                  <a href="mailto:sales@kerabie.email" className="font-mono text-[13px]">sales@kerabie.email</a>
                </span>
                <span className="flex justify-between gap-3">
                  <span className="text-muted-foreground">Partners</span>
                  <a href="mailto:partners@kerabie.email" className="font-mono text-[13px]">partners@kerabie.email</a>
                </span>
                <span className="flex justify-between gap-3">
                  <span className="text-muted-foreground">Phone</span>
                  <a href="tel:+2349031290387" className="font-mono text-[13px]">+234 903 129 0387</a>
                </span>
              </div>
            </div>

            <div className="blueprint relative bg-muted p-6">
              <Corners />
              <span className="block font-mono text-[10.5px] tracking-[.12em] text-muted-foreground">PREFER TO SELF-SERVE?</span>
              <p className="my-2.5 text-[13.5px] leading-relaxed">
                Setup guides, DNS records and billing answers live in the help centre.
              </p>
              <NavLink
                href="/help"
                className="inline-flex items-center gap-2 border border-border bg-white px-4 py-2.5 text-[13.5px] font-semibold text-foreground transition-colors hover:bg-primary-muted"
              >
                Visit help centre
              </NavLink>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="pb-[72px] pt-16">
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
              <h2 className="mb-2.5 text-[34px] tracking-tight text-white">Skip the queue — try it instead.</h2>
              <p className="mx-auto mb-[22px] max-w-[50ch] text-[15px] text-[#8A9E98]">
                Your first mailbox is free, and setup takes about four minutes.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <NavLink
                  href="/auth/register"
                  className="inline-flex items-center gap-2 bg-primary px-[22px] py-3.5 text-[15px] font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-[#5A8A78]"
                >
                  Get free mailbox
                </NavLink>
                <NavLink
                  href="/pricing"
                  className="inline-flex items-center gap-2 border border-white/30 px-[22px] py-3.5 text-[15px] font-semibold text-[#E8EDEB] transition-colors hover:bg-white/10"
                >
                  Compare plans
                </NavLink>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;
