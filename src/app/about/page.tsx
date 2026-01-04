import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import {
  Heart, Users, Target, 
  Lightbulb, TrendingUp, Shield, ArrowRight
} from "lucide-react";
import Image from "next/image";
import AboutBanner from "@/components/aboutPage/AboutBanner";

const values = [
  {
    icon: Lightbulb,
    title: "Innovation First",
    description: "We constantly push boundaries to reimagine what email can be."
  },
  {
    icon: Heart,
    title: "Human-Centered",
    description: "Technology should serve people, not the other way around."
  },
  {
    icon: Shield,
    title: "Security & Privacy",
    description: "Your trust is our foundation. We protect your data fiercely."
  },
  {
    icon: TrendingUp,
    title: "Continuous Growth",
    description: "We're always learning, iterating, and improving for you."
  }
];

const stats = [
  { number: "500K+", label: "Active Users" },
  { number: "12", label: "Global Regions" },
  { number: "99.9%", label: "Uptime SLA" },
  { number: "50M+", label: "Emails Delivered Daily" }
];

const team = [
  {
    name: "Sarah Chen",
    role: "CEO & Co-founder",
    image: "/team-1.jpg",
    bio: "Former Gmail engineer with a passion for reimagining communication."
  },
  {
    name: "Marcus Johnson",
    role: "CTO & Co-founder",
    image: "/team-2.jpg",
    bio: "Infrastructure expert who scaled systems at multiple Fortune 500s."
  },
  {
    name: "Priya Sharma",
    role: "Head of Product",
    image: "/team-3.jpg",
    bio: "Design-thinking advocate focused on delightful user experiences."
  },
  {
    name: "David Kim",
    role: "Head of Security",
    image: "/team-4.jpg",
    bio: "Cybersecurity veteran committed to enterprise-grade protection."
  }
];

const AboutUs = () => {
  return (
    <div className="min-h-screen bg-background selection:bg-primary/10">
      <Header />
      
      {/* Hero Section */}
      <AboutBanner/>

      {/* Story Section */}
      <section className="py-20 border-t">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold">Our Story</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  In 2025, our founder Emmanuel was managing growing teams at tech companies and hit the same wall: 
                  their email tools were holding them back. Missed messages, delayed deliveries, 
                  clunky interfaces, and zero visibility into what was actually working.
                </p>
                <p>
                  They realized that email—the backbone of business communication—hadn&apos;t evolved in decades. So they set out 
                  to build something better. Something fast, intelligent, and beautiful.
                </p>
                <p>
                  Today, Kerabie powers communication for over 500,000 professionals worldwide, from solo entrepreneurs to 
                  enterprise teams. We&apos;re just getting started.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -inset-4 bg-linear-to-r from-primary/20 to-blue-500/20 blur-3xl opacity-30"></div>
              <div className="relative bg-card rounded-2xl p-8 border">
                <Image 
                  src="/team-photo.jpg" 
                  alt="Kerabie Team" 
                  width={600} 
                  height={400}
                  className="rounded-lg w-full h-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center justify-center p-4 bg-primary/10 rounded-2xl mb-4">
              <Target className="h-12 w-12 text-primary" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold">Our Mission</h2>
            <p className="text-xl text-muted-foreground">
              To make email a tool that empowers rather than overwhelms. We believe communication should be fast, secure, and intuitive—giving you more time to focus on what matters.
            </p>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Values</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              These principles guide every decision we make, from product features to how we treat our community.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="text-center space-y-4">
                <div className="inline-flex items-center justify-center p-4 bg-primary/10 rounded-2xl">
                  <value.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold">{value.title}</h3>
                <p className="text-muted-foreground">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold mb-2">{stat.number}</div>
                <div className="text-primary-foreground/80">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Meet the Team</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We&apos;re a diverse group of engineers, designers, and problem-solvers united by a shared vision for better communication.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <div key={index} className="text-center space-y-4">
                <div className="relative mx-auto w-48 h-48 rounded-full overflow-hidden bg-muted">
                  <div className="w-full h-full flex items-center justify-center text-6xl font-bold text-muted-foreground">
                    {member.name.charAt(0)}
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold">{member.name}</h3>
                  <p className="text-primary font-medium mb-2">{member.role}</p>
                  <p className="text-sm text-muted-foreground">{member.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Join Us Section */}
      <section className="py-20 border-t">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-linear-to-br from-primary/10 to-blue-500/10 rounded-3xl p-8 md:p-12 text-center space-y-6">
              <div className="inline-flex items-center justify-center p-4 bg-primary/10 rounded-2xl mb-4">
                <Users className="h-12 w-12 text-primary" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold">Join Our Journey</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                We&apos;re always looking for talented, passionate people to help us build the future of email. Check out our open positions or just say hello.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Button size="lg" className="px-8">
                  View Careers <ArrowRight className="ml-2" size={20} />
                </Button>
                <Button size="lg" variant="outline">
                  Contact Us
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AboutUs;