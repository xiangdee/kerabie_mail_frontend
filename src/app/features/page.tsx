import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FeatureCard } from "@/components/FeatureCard";
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
} from "lucide-react";

const features = [
  {
    icon: CheckCircle2,
    title: "Guaranteed Delivery Confidence",
    description:
      "Kerabie ensures your email reaches inboxes with consistently high deliverability rates. Our infrastructure is optimized to reduce spam flags and maximize message success.",
  },
  {
    icon: Eye,
    title: "Read Receipts",
    description:
      "Track engagement and know when your messages are being read. Get real-time notifications when recipients open your emails.",
  },
  {
    icon: Clock,
    title: "Email Scheduling",
    description:
      "Compose now and deliver your message at the perfect moment. Schedule emails to send at optimal times for maximum impact.",
  },
  {
    icon: FileText,
    title: "Email Templates",
    description:
      "Save time with ready-to-use, customizable templates. Create professional emails faster with pre-built layouts for common scenarios.",
  },
  {
    icon: Users,
    title: "Multiple Accounts",
    description:
      "Manage multiple business identities with ease. Switch between accounts seamlessly and keep your professional personas organized.",
  },
  {
    icon: Bell,
    title: "Email Reminders",
    description:
      "Stay on track with prompt follow-up alerts. Never miss an important response with intelligent reminder notifications.",
  },
  {
    icon: Filter,
    title: "Rules & Filtering",
    description:
      "Create custom rules to automate organization by sender, keyword, or label. Keep your inbox clean and organized automatically.",
  },
  {
    icon: Search,
    title: "Advanced Search",
    description:
      "Search across messages, attachments, senders, and date ranges instantly. Powerful search capabilities to find anything in seconds.",
  },
  {
    icon: PenTool,
    title: "Custom Signatures",
    description:
      "Keep your branding polished and consistent. Create professional email signatures with images, links, and formatting.",
  },
  {
    icon: Mail,
    title: "Vacation Responders",
    description:
      "Automated replies when you're away. Set up out-of-office messages to keep contacts informed during your absence.",
  },
  {
    icon: Palette,
    title: "Composer Tools",
    description:
      "Create clean, formatted, professional emails. Rich text editor with formatting options for clear communication.",
  },
  {
    icon: Calendar,
    title: "Calendar Integration",
    description:
      "Schedule, plan, and manage events effortlessly. A built-in calendar keeps your meetings and events in perfect sync.",
  },
  {
    icon: Smartphone,
    title: "Mobile Friendly",
    description:
      "A seamless experience on any device. Fully responsive design ensures you stay productive whether on desktop, tablet, or phone.",
  },
];

const Features = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <h1 className="mb-4 text-4xl font-bold text-foreground md:text-5xl">
              Everything you need for powerful, professional communication.
            </h1>
            <p className="mx-auto max-w-3xl text-lg text-muted-foreground">
              Kerabie combines essential email features with advanced tools to help your business
              communicate effectively and efficiently.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <FeatureCard
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
              />
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Features;
