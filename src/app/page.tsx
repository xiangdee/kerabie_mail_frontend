import { Button } from "@/components/ui/button";
import { FeatureCard } from "@/components/FeatureCard";
import { PricingCard } from "@/components/PricingCard";
import { TestimonialCard } from "@/components/TestimonialCard";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import {
  CheckCircle2,
  Eye,
  Clock,
  FileText,
  Users,
  Bell,
  Filter,
  Search,
  PenTool,
  Mail,
  Palette,
  Calendar,
  Smartphone,
  ArrowRight,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import Image from "next/image";

const features = [
  {
    icon: CheckCircle2,
    title: "Guaranteed Delivery Confidence",
    description: "Engineered for maximum inbox delivery and reliability.",
  },
  {
    icon: Eye,
    title: "Read Receipts",
    description: "Know when your message has been opened.",
  },
  {
    icon: Clock,
    title: "Email Scheduling",
    description: "Send at the optimal time.",
  },
  {
    icon: FileText,
    title: "Email Templates",
    description: "Pre-built and customizable templates for fast communication.",
  },
  {
    icon: Users,
    title: "Multiple Accounts",
    description: "Manage multiple identities and team members with ease.",
  },
  {
    icon: Bell,
    title: "Email Reminders",
    description: "Stay on top of follow-ups effortlessly.",
  },
  {
    icon: Filter,
    title: "Rules & Filtering",
    description: "Automate organization and categorization.",
  },
  {
    icon: Search,
    title: "Advanced Search",
    description: "Locate emails, attachments, and conversations instantly.",
  },
  {
    icon: PenTool,
    title: "Custom Signatures",
    description: "Create consistent branding across your team.",
  },
  {
    icon: Mail,
    title: "Vacation Responders",
    description: "Automated replies while you're away.",
  },
  {
    icon: Palette,
    title: "Composer Tools",
    description: "Rich formatting for clear communication.",
  },
  {
    icon: Calendar,
    title: "Calendar Integration",
    description: "Manage events, reminders, and scheduling.",
  },
  {
    icon: Smartphone,
    title: "Mobile Friendly",
    description: "Fully responsive on all devices.",
  },
];

const pricingPlans = [
  {
    name: "Starter",
    price: "$9",
    period: "user/month",
    description: "Perfect for small teams getting started",
    features: [
      "10 GB storage per user",
      "Custom email domain",
      "Email scheduling",
      "Basic templates",
      "Mobile apps",
      "Email support",
    ],
  },
  {
    name: "Professional",
    price: "$19",
    period: "user/month",
    description: "Advanced features for growing businesses",
    features: [
      "50 GB storage per user",
      "Everything in Starter",
      "Read receipts",
      "Advanced search",
      "Custom signatures",
      "Calendar integration",
      "Priority support",
      "Team collaboration tools",
    ],
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "contact us",
    description: "Tailored solutions for large organizations",
    features: [
      "Unlimited storage",
      "Everything in Professional",
      "Advanced security features",
      "Custom integrations",
      "Dedicated account manager",
      "SLA guarantee",
      "24/7 phone support",
      "White-label options",
    ],
  },
];

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
      <Header />

      {/* Hero Section - Full Height Modern Banner */}
      <section className="relative flex min-h-[90vh] items-center overflow-hidden bg-linear-to-br from-primary via-primary-hover to-secondary">
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -left-4 top-1/4 h-96 w-96 animate-pulse rounded-full bg-primary-foreground blur-3xl"></div>
          <div className="absolute -right-4 bottom-1/4 h-96 w-96 animate-pulse rounded-full bg-primary-foreground blur-3xl" style={{ animationDelay: "1s" }}></div>
        </div>

        <div className="container relative z-10 mx-auto px-4">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="space-y-8 animate-fade-in">
              <div className="inline-block rounded-full bg-primary-foreground/10 px-4 py-2 text-sm font-medium text-primary-foreground backdrop-blur-sm">
                Trusted by 10,000+ businesses worldwide
              </div>
              <h1 className="text-5xl font-bold leading-tight text-primary-foreground md:text-6xl lg:text-7xl">
                Reliable business email built for growing teams.
              </h1>
              <p className="text-xl text-primary-foreground/90 md:text-2xl">
                Fast, secure, and professional email your customers can depend on every day.
              </p>
              <div className="flex flex-col gap-4 sm:flex-row">
                <Button size="lg" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 shadow-lg">
                  Get Started with Kerabie Email
                  <ArrowRight className="ml-2" size={20} />
                </Button>
                <Button size="lg" variant="outline" className="border-2 border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10">
                  View Pricing
                </Button>
              </div>
              <div className="flex items-center gap-8 text-primary-foreground/90">
                <div>
                  <div className="text-3xl font-bold">99.9%</div>
                  <div className="text-sm">Uptime</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">10k+</div>
                  <div className="text-sm">Customers</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">24/7</div>
                  <div className="text-sm">Support</div>
                </div>
              </div>
            </div>
            <div className="relative animate-scale-in" style={{ animationDelay: "0.2s" }}>
              <div className="absolute -inset-4 animate-pulse rounded-lg bg-primary-foreground/20 blur-2xl"></div>
              <Image
                src={'/hero-dashboard.jpg'}
                width={600}
                height={600}
                alt="Kerabie Email Dashboard"
                className="relative rounded-xl shadow-2xl ring-1 ring-primary-foreground/20"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Why Kerabie Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">
                Built for businesses that need email to just work.
              </h2>
              <p className="text-lg text-muted-foreground">
                Kerabie delivers a stable, secure, and fully optimized email experience that
                supports your customers as they grow. From high deliverability to intuitive
                features, we help businesses communicate with clarity and confidence.
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="rounded-lg border border-border bg-card p-6">
                <h3 className="mb-2 text-xl font-semibold text-foreground">99.9% Uptime</h3>
                <p className="text-muted-foreground">Enterprise-grade reliability you can count on.</p>
              </div>
              <div className="rounded-lg border border-border bg-card p-6">
                <h3 className="mb-2 text-xl font-semibold text-foreground">Secure by Default</h3>
                <p className="text-muted-foreground">End-to-end encryption and data protection.</p>
              </div>
              <div className="rounded-lg border border-border bg-card p-6">
                <h3 className="mb-2 text-xl font-semibold text-foreground">Fast Performance</h3>
                <p className="text-muted-foreground">Lightning-fast email delivery and sync.</p>
              </div>
              <div className="rounded-lg border border-border bg-card p-6">
                <h3 className="mb-2 text-xl font-semibold text-foreground">24/7 Support</h3>
                <p className="text-muted-foreground">Always here when you need us.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-y border-border bg-muted py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">
              Powerful tools built to elevate every message
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Everything you need for professional business communication in one platform.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <FeatureCard
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
              />
            ))}
          </div>

          <div className="mt-12 text-center">
            <NavLink href="/features">
              <Button size="lg" variant="outline">
                See All Features
              </Button>
            </NavLink>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">
              Simple, Transparent Pricing
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Choose the perfect plan for your team. All plans include a 14-day free trial.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {pricingPlans.map((plan, index) => (
              <PricingCard
                key={index}
                name={plan.name}
                price={plan.price}
                period={plan.period}
                description={plan.description}
                features={plan.features}
                highlighted={plan.highlighted}
              />
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-muted-foreground">
              Need a custom solution?{" "}
              <NavLink href="/contact" className="font-medium text-primary hover:underline">
                Contact our sales team
              </NavLink>
            </p>
          </div>
        </div>
      </section>

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
      <section className="bg-secondary-muted py-20">
        <div className="container mx-auto px-4">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">
                Partner With Kerabie
              </h2>
              <p className="mb-6 text-lg text-muted-foreground">
                Empower your customers with a premium business email solution designed for
                deliverability, reliability, and growth. Kerabie integrates smoothly with your
                hosting stack and enhances your service offerings instantly.
              </p>
              <Button size="lg" className="bg-secondary hover:bg-secondary-hover text-secondary-foreground">
                Are you a web host? Partner with us
              </Button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-border bg-background p-6">
                <CheckCircle2 className="mb-3 h-8 w-8 text-secondary" />
                <h3 className="mb-2 font-semibold text-foreground">Easy provisioning & onboarding</h3>
              </div>
              <div className="rounded-lg border border-border bg-background p-6">
                <CheckCircle2 className="mb-3 h-8 w-8 text-secondary" />
                <h3 className="mb-2 font-semibold text-foreground">High-deliverability email infrastructure</h3>
              </div>
              <div className="rounded-lg border border-border bg-background p-6">
                <CheckCircle2 className="mb-3 h-8 w-8 text-secondary" />
                <h3 className="mb-2 font-semibold text-foreground">White-label options</h3>
              </div>
              <div className="rounded-lg border border-border bg-background p-6">
                <CheckCircle2 className="mb-3 h-8 w-8 text-secondary" />
                <h3 className="mb-2 font-semibold text-foreground">Powerful admin tools</h3>
              </div>
              <div className="rounded-lg border border-border bg-background p-6">
                <CheckCircle2 className="mb-3 h-8 w-8 text-secondary" />
                <h3 className="mb-2 font-semibold text-foreground">Multi-domain support</h3>
              </div>
              <div className="rounded-lg border border-border bg-background p-6">
                <CheckCircle2 className="mb-3 h-8 w-8 text-secondary" />
                <h3 className="mb-2 font-semibold text-foreground">Scalable for large customer bases</h3>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
