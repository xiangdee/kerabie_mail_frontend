import { blackblazebucket } from "@/lib/constants/links";
import {  PenTool, Mail, Calendar, Smartphone, WandSparkles } from "lucide-react";
import Image from "next/image";

const FeaturesSection = () => {
  const features = [
    {
      icon:  blackblazebucket +'/assets/images/icons/sheild-icon.png',
      isMageIcon: true,
      title: "Guaranteed Delivery Confidence",
      description: "Engineered for maximum inbox delivery and reliability.",
      img: blackblazebucket + '/assets/images/feature-imgs/guaranteed-delivery.png'
    },
    // ai compose 
    {
        icon:WandSparkles,
        isMageIcon: false,
        title: "AI Compose",
        description: "Compose with the power of AI.",
        img: blackblazebucket + '/assets/images/feature-imgs/ai-compose2.png'
    },
    
    {
      icon: blackblazebucket + '/assets/images/icons/schedule-icon.png',
      isMageIcon: true,
      title: "Email Scheduling",
      description: "Send at the optimal time.",
      img:  blackblazebucket + '/assets/images/feature-imgs/schedule-send.png'
    },
    {
      icon:  blackblazebucket +'/assets/images/icons/template-icon.png',
      isMageIcon: true,
      title: "Email Templates",
      description: "Pre-built and customizable templates for fast communication.",
      img:  blackblazebucket + '/assets/images/feature-imgs/email-templates.png'
    },
    
    
    {
      icon:  blackblazebucket +'/assets/images/icons/instant-search-icon.png',
      isMageIcon: true,
      title: "Advanced Search",
      description: "Locate emails, attachments, and conversations instantly.",
      img: blackblazebucket +  '/assets/images/feature-imgs/adnvanced-search.png'
    },
    {
      icon: PenTool,
      isMageIcon: false,
      title: "Custom Signatures",
      description: "Create consistent branding across your team.",
      img: blackblazebucket +  '/assets/images/feature-imgs/email-signature.png'
    },
    {
      icon: Mail,
      isMageIcon: false,
      title: "Vacation Responders",
      description: "Automated replies while you're away.",
      img:blackblazebucket + '/assets/images/feature-imgs/vacation-responder.png'
    },
   
    {
      icon: Calendar,
      isMageIcon: false,
      title: "Calendar Integration",
      description: "Manage events, reminders, and scheduling.",
      img: blackblazebucket +  '/assets/images/feature-imgs/calender.png'
    },
    {
      icon: Smartphone,
      isMageIcon: false,
      title: "Mobile Friendly",
      description: "Fully responsive on all devices.",
      img: blackblazebucket +  '/assets/images/feature-imgs/mobile-friendly.png'
    },
  ];

  return (
    <section className="py-24 bg-linear-to-b from-background to-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            Everything you need to <span className="text-primary">succeed</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Powerful features designed to streamline your email workflow and boost productivity.
          </p>
        </div>

        <div className="space-y-24 max-w-6xl mx-auto">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const isReversed = index % 2 !== 0;

            return (
              <div
                key={index}
                className={`grid md:grid-cols-2 gap-8 md:gap-12 items-center ${
                  isReversed ? 'md:flex-row-reverse' : ''
                }`}
              >
                {/* Content */}
                <div className={`space-y-6 ${isReversed ? 'md:order-2' : ''}`}>
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 text-primary">
                    {
                      feature.isMageIcon ? (
                        <Image
                          src={feature.icon as string}
                          alt="Mage Icon"
                          width={80}
                          height={80}
                          className="object-contain"
                        />
                      ) : (
                          <Icon size={28} strokeWidth={2} />
                      )
                      
                    }

                  </div>
                  
                  <div>
                    <h3 className="text-3xl font-bold mb-3">{feature.title}</h3>
                    <p className="text-muted-foreground text-lg leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>

                {/* Image */}
                <div className={`relative ${isReversed ? 'md:order-1' : ''}`}>
                  <div className="absolute -inset-4 bg-linear-to-r from-primary/20 to-blue-500/20 rounded-3xl blur-2xl opacity-50" />
                  <div className="relative aspect-video rounded-2xl 0">
                    <Image
                      fill
                      src={feature.img}
                      alt={feature.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;