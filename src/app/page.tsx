import { TestimonialCard } from "@/components/TestimonialCard";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Corners } from "@/components/ui/corners";
import { NavLink } from "@/components/NavLink";
import { ArrowRight } from "lucide-react";

import HomeHeroSection from "@/components/HomeHeroSection";
import EmailPlatformHero from "@/components/EmailPlatformHero";
import EmailConnectionBento from "@/components/EmailConnectionBento";
import PricingSection from "@/components/PricingSection";
import FeaturesSection from "@/components/FeaturesSection";
import PartnerSection from "@/components/PartnerSection";

const testimonials = [
  {
    quote: "Kerabie has transformed how our team communicates. The reliability and speed are unmatched.",
    author: "Sarah Johnson",
    role: "CEO",
    company: "TechStart Inc",
    rating: 5,
  },
  {
    quote: "We switched from our previous provider and haven't looked back. The deliverability is excellent.",
    author: "Michael Chen",
    role: "Operations Director",
    company: "Global Ventures",
    rating: 5,
  },
  {
    quote: "The customer support is outstanding. They helped us migrate our entire organization seamlessly.",
    author: "Emily Rodriguez",
    role: "IT Manager",
    company: "Creative Solutions",
    rating: 5,
  },
];

const Home = () => {
  return (
    <div className="min-h-screen max-w-full overflow-x-hidden bg-background">
      <div className="flex items-center justify-center gap-2.5 bg-[#1A1F1E] px-4 py-1.5 text-center text-[12.5px] tracking-wide text-[#E8EDEB]">
        <span className="block h-1.5 w-1.5 animate-[k-pulse_2s_infinite] bg-[#4CAF80]" />
        Free mailbox, no card required — 10,000+ businesses already moved to Kerabie
      </div>

      <Header />

      <main className="mx-auto max-w-[1240px] px-4">
        <HomeHeroSection />
        <EmailPlatformHero />
        <EmailConnectionBento />
        <FeaturesSection />
        <PricingSection />

        {/* Testimonials Section */}
        <section className="pt-[88px]">
          <div className="mx-auto mb-[26px] max-w-[620px] text-center">
            <h2 className="mb-2 text-[32px] tracking-tight sm:text-[38px]">Trusted by businesses worldwide</h2>
            <p className="text-[15px] text-muted-foreground">
              See what our customers have to say about their experience with Kerabie.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <TestimonialCard
                key={index}
                quote={testimonial.quote}
                author={testimonial.author}
                role={testimonial.role}
                company={testimonial.company}
                rating={testimonial.rating}
              />
            ))}
          </div>
        </section>

        <PartnerSection />

        {/* Final CTA */}
        <section className="pt-[88px]">
          <div className="blueprint relative overflow-hidden bg-[#1A1F1E] px-6 py-[52px] text-center text-[#E8EDEB] sm:px-10">
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
              <h2 className="mb-2.5 text-3xl tracking-tight text-white sm:text-[38px]">
                Your first mailbox is free.
              </h2>
              <p className="mx-auto mb-6 max-w-[52ch] text-[15.5px] text-[#8A9E98]">
                No card, no migration fee, no waiting on a sales call. Claim an address, point
                your domain, and send.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <NavLink
                  href="/auth/register"
                  className="inline-flex items-center gap-2 bg-primary px-[22px] py-3.5 text-[15px] font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-[#5A8A78]"
                >
                  Get free mailbox
                  <ArrowRight size={15} />
                </NavLink>
                <a
                  href="#pricing"
                  className="inline-flex items-center gap-2 border border-white/30 px-[22px] py-3.5 text-[15px] font-semibold text-[#E8EDEB] transition-colors hover:bg-white/10"
                >
                  Compare plans
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Home;
