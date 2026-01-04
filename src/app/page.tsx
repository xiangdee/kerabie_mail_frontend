
import { TestimonialCard } from "@/components/TestimonialCard";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";


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
    <div className="min-h-screen bg-background">
      <Header variant="overlay" />

      <HomeHeroSection/>
      <EmailPlatformHero/>

      <EmailConnectionBento/>

      {/* Features Section */}
      <FeaturesSection/>

      {/* Pricing Section */}
      <PricingSection/>

      {/* Testimonials Section */}
      <section className="border-y border-border bg-muted py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">
              Trusted by Businesses Worldwide
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              See what our customers have to say about their experience with Kerabie.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
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
        </div>
      </section>

      {/* Partner Section */}
      <PartnerSection/>

      <Footer />
    </div>
  );
};

export default Home;
