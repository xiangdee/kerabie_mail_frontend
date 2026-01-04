import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FeatureCard } from "@/components/FeatureCard";
import { Button } from "@/components/ui/button"; // Assuming shadcn/ui
import {
  CheckCircle2, Eye, Users, 
  Calendar, Smartphone,
  ShieldCheck, Zap, Globe, ArrowRight
} from "lucide-react";
import EmailFeaturesBanner from "@/components/featuresPage/EmailFeaturesBanner";
import Image from "next/image";
import { blackblazebucket } from "@/lib/constants/links";

const coreFeatures = [
  {
    icon: CheckCircle2,
    image:blackblazebucket +'/assets/images/icons/sheild-icon.png',
    title: "Guaranteed Delivery",
    description: "Our infrastructure is optimized to bypass spam filters and ensure 99.9% inbox placement.",
  },
  {
    icon: Eye,
    image:blackblazebucket +'/assets/images/icons/read-receipts-icon.png',
    title: "Real-time Tracking",
    description: "Know exactly when your emails are opened with instant push notifications and read receipts.",
  },
  {
    icon: ShieldCheck,
    image:blackblazebucket +'/assets/images/icons/enterprise-security-icon-2.png',
    title: "Enterprise Security",
    description: "End-to-end encryption and advanced phishing protection to keep your business data safe.",
  },
];

const secondaryFeatures = [
  { icon: blackblazebucket +'/assets/images/icons/schedule-icon.png', title: "Email Scheduling", description: "Compose now, send at the perfect peak-engagement time.",
    isImage:true },
  { icon: blackblazebucket +'/assets/images/icons/template-icon.png', title: "Smart Templates", description: "Standardize your team's outreach with beautiful layouts.",
    isImage:true
   },
  { icon: Users, title: "Team Collaboration", description: "Manage multiple business identities and shared inboxes.",
    isImage:false
   },
  { icon: blackblazebucket +'/assets/images/icons/bell-icon.png', title: "Smart Reminders", description: "Gentle nudges to follow up on messages that haven't been replied to." ,
    isImage:true
  },
  { icon: blackblazebucket +'/assets/images/icons/filter-icon.png', title: "Inbox Automation", description: "Custom rules to filter, label, and archive emails automatically.",
    isImage:true
   },
  { icon: blackblazebucket +'/assets/images/icons/instant-search-icon.png', title: "Instant Search", description: "Find any attachment or conversation from years ago in milliseconds.",
    isImage:true
   },
  { icon: blackblazebucket +'/assets/images/icons/signature-icon.png', title: "Brand Signatures", description: "Dynamic signatures that update across your entire organization.",
    isImage:true
   },
  { icon: Calendar, title: "Integrated Calendar", description: "Book meetings without ever leaving your compose window.",
    isImage:false
   },
  { icon: Smartphone, title: "Mobile Excellence", description: "A desktop-class experience optimized for your pocket.",
    isImage:false
   },
];

const Features = () => {
  return (
    <div className="min-h-screen bg-background selection:bg-primary/10">
      <Header />
      
      {/* 1. Hero & Visual Section */}
      <section className="relative overflow-hidden pb-12 ">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <EmailFeaturesBanner />
            <div className="relative mx-auto max-w-5xl group py-10">
            <div className="absolute -inset-1 bg-linear-to-r from-primary/20 to-blue-500/20 blur-2xl opacity-50 group-hover:opacity-75 transition duration-1000"></div>
            <div className="relative bg-card rounded-2xl  overflow-hidden">
              <Image 
                src={blackblazebucket+'/assets/images/misc/scene.gif'} 
                alt="Kerabie Dashboard" 
                width={1200} 
                height={675} 
                className="w-full h-auto"
                unoptimized // for GIFs
              />
            </div>
          </div>
            <h1 className="mt-6 mb-6 text-4xl font-extrabold tracking-tight text-foreground md:text-6xl lg:leading-[1.1]">
              Powerful email that <br />
              <span className="text-primary">takes you places.</span>
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground md:text-xl">
              Kerabie isn&apos;t just an inbox. It&apos;s a high-performance communication engine 
              designed for teams who value speed, security, and deliverability.
            </p>
          </div>

          
        </div>
      </section>

      {/* 2. Core Value Pillars */}
      <section className="py-20  ">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-3">
            {coreFeatures.map((f, i) => (
              <div key={i} className="flex flex-col items-center text-center p-6 space-y-4">
                <div className="p-1 rounded-2xl bg-primary/10 text-primary">
                 {
                  f.image ? (
                    <Image src={f.image} alt={f.title} width={82} height={82} />
                  ) : (
                    <f.icon className="h-8 w-8" />
                  )
                 }
                </div>
                <h3 className="text-xl font-bold">{f.title}</h3>
                <p className="text-muted-foreground">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Feature Grid (Secondary) */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div className="max-w-xl">
              <h2 className="text-3xl font-bold mb-4">Everything you need to master your inbox</h2>
              <p className="text-muted-foreground">From automation to aesthetics, we&apos;ve built every tool with the modern professional in mind.</p>
            </div>
            
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {secondaryFeatures.map((feature, index) => (
              <div  key={index}>
              <FeatureCard
               
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                isImage={feature.isImage}
               
                // className="hover:shadow-lg transition-shadow border-muted/50"
              />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Content Block: Security/Global Trust */}
      <section className="py-20 border-t border-b bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 space-y-6">
            <h2 className="text-3xl font-bold">Global Infrastructure. <br/>Local Performance.</h2>
            <p className="text-primary-foreground/80 text-lg">
              Our servers are distributed across 12 global regions. This means your emails are 
              processed and sent with zero latency, no matter where your team is located.
            </p>
            <ul className="space-y-3">
              <li className="flex items-center gap-2"><Globe size={18}/> 12 Data Centers Worldwide</li>
              <li className="flex items-center gap-2"><Zap size={18}/> 99.9% Uptime SLA</li>
              <li className="flex items-center gap-2"><ShieldCheck size={18}/> GDPR & SOC2 Compliant</li>
            </ul>
          </div>
          <div className="flex-1 bg-white/10 p-8 rounded-3xl backdrop-blur-sm border border-white/20">
             <Image src={blackblazebucket+'/assets/images/misc/app-screenshot.png'} alt="app-screenshot.png" width={500} height={500} />
          </div>
        </div>
      </section>

      {/* 5. Final CTA */}
      <section className="py-24 text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to upgrade your email experience?</h2>
          <p className="text-muted-foreground mb-10 max-w-lg mx-auto">
            Join thousands of professionals who have reclaimed their time with Kerabie.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button size="lg" className="px-8 h-12 text-lg">
              Get Started for Free <ArrowRight className="ml-2" size={20} />
            </Button>
            <Button size="lg" variant="outline" className="px-8 h-12 text-lg">
              Contact Sales
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Features;