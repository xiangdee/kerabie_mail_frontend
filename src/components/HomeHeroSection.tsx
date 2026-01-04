'use client';
import { Button } from "@/components/ui/button";
import { blackblazebucket } from "@/lib/constants/links";
import {
  CheckCircle2,
  Users,
  Clock,
  ArrowRight,
  Mail,
  Bell,
} from "lucide-react";
import Image from "next/image";

const HomeHeroSection = () => {
  return (
    <>
      {/* Hero Section - Full Height Modern Banner */}
    <section className="relative flex items-center overflow-hidden bg-linear-to-br from-primary via-green-900 to-secondary -mt-16 pt-5">
  {/* Animated background elements */}
  <div className="absolute inset-0">
    <div className="absolute left-0 top-0 h-full w-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE2YzAtMy4zMTQgMi42ODYtNiA2LTZzNiAyLjY4NiA2IDYtMi42ODYgNi02IDYtNi0yLjY4Ni02LTZ6TTAgMGg2MHY2MEgwVjB6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20"></div>
    <div className="absolute -left-20 top-1/4 h-[500px] w-[500px] animate-pulse rounded-full bg-green-400/20 blur-3xl"></div>
    <div className="absolute -right-20 bottom-1/3 h-[600px] w-[600px] animate-pulse rounded-full bg-green-500/20 blur-3xl" style={{ animationDelay: "1.5s" }}></div>
    <div className="absolute left-1/2 top-1/2 h-[400px] w-[400px] animate-pulse rounded-full bg-green-400/10 blur-3xl" style={{ animationDelay: "3s" }}></div>
  </div>

  <div className="container relative z-10 mx-auto px-4 py-20">
    <div className="grid items-center gap-16 lg:grid-cols-2">
      <div className="space-y-8 animate-fade-in">
        {/* Trust badge */}
        <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur-sm">
          <CheckCircle2 className="h-4 w-4 text-green-200" />
          <span className="text-sm font-medium text-white">Trusted by 10,000+ businesses</span>
        </div>
       
        <h1 className="text-5xl font-extrabold leading-tight text-white md:text-6xl lg:text-7xl tracking-tight">
          Reliable business email built for growing teams
        </h1>
        
        <p className="text-xl text-white/90 md:text-2xl leading-relaxed max-w-xl">
          Fast, secure, and professional email.
        </p>
        
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <Button 
            size="lg" 
            className="group bg-white text-green-700 hover:bg-green-50 shadow-lg hover:shadow-xl transition-all duration-300 font-semibold px-6 py-3 h-auto"
          >
            Get Started
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
          <Button 
            size="lg" 
            variant="outline" 
            className="border-2 border-white/30 bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm font-semibold px-6 py-3 h-auto transition-all duration-300"
          >
            View Pricing
          </Button>
        </div>
        
        {/* Social proof stats */}
        <div className="flex flex-wrap items-center gap-8 pt-4 text-white/90 border-t border-white/20">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm">
              <CheckCircle2 className="h-6 w-6 text-green-300" />
            </div>
            <div>
              <div className="text-3xl font-bold text-white">99.9%</div>
              <div className="text-sm text-white/70">Uptime</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm">
              <Users className="h-6 w-6 text-green-300" />
            </div>
            <div>
              <div className="text-3xl font-bold text-white">10k+</div>
              <div className="text-sm text-white/70">Customers</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm">
              <Clock className="h-6 w-6 text-green-300" />
            </div>
            <div>
              <div className="text-3xl font-bold text-white">24/7</div>
              <div className="text-sm text-white/70">Support</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Dashboard preview */}
      <div className="relative animate-scale-in lg:animate-float" style={{ animationDelay: "0.2s" }}>
        {/* <div className="absolute -inset-4 animate-pulse rounded-full bg-linear-to-r from-primary/30 to-orimary blur-3xl"></div> */}
        <div className="relative w-full max-w-4xl mx-auto px-4">
  {/* Animated glow background */}
  <div className="absolute inset-0 animate-pulse rounded-3xl bg-linear-to-r from-green-400/20 to-green-500/20 blur-3xl"></div>
  
  {/* Container for overlapping images */}
  <div className="relative flex items-center justify-center min-h-[400px]">
    
    {/* Code editor image - left side, tilted */}
    <div className="absolute left-0 z-1 w-[55%] transform -rotate-6 translate-x-8">
      <div className="rounded-2xl bg-white/10 p-2 backdrop-blur-sm ring-1 ring-white/20 shadow-2xl overflow-hidden">
        <Image
          src={blackblazebucket + "/assets/images/misc/app-screenshot-2.png"}
          width={500}
          height={400}
          alt="Code Editor"
          className="rounded-xl w-full"
        />
      </div>
    </div>
    
    {/* Dashboard/Person image - right side, overlapping */}
    <div className="absolute right-0 z-2  w-[55%] transform rotate-3 -translate-x-8">
      <div className="rounded-2xl bg-white/10  backdrop-blur-sm ring-1 ring-white/20 shadow-2xl overflow-hidden">
        <Image
          src="/hero-dashboard.jpg"
          width={600}
          height={500}
          alt="Kerabie Dashboard"
          className="rounded-xl w-full"
        />
        {/* Optional overlay gradient */}
        <div className="absolute inset-0 bg-linear-to-br from-green-400/30 to-primary/30 mix-blend-overlay pointer-events-none"></div>
      </div>
    </div>
    
  </div>
</div>
        
        {/* Floating feature cards */}
        <div className="absolute z-3 -left-8 top-1/4 hidden lg:block animate-float" style={{ animationDelay: "0.5s" }}>
          <div className="rounded-lg bg-white p-4 shadow-xl backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-900">100% Delivered</div>
                <div className="text-xs text-gray-600">This month</div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="absolute z-3 -right-8 bottom-1/4 hidden lg:block animate-float" style={{ animationDelay: "1s" }}>
          <div className="rounded-lg bg-white p-4 shadow-xl backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Bell className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-900">Zero Downtime</div>
                <div className="text-xs text-gray-600">Last 30 days</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  
  {/* Bottom wave decoration */}
  <div className="absolute bottom-0 left-0 right-0">
    <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
      <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white" fillOpacity="0.1"/>
    </svg>
  </div>
</section>

{/* Add this CSS to your global styles or in a style tag */}
<style jsx>{`
  @keyframes float {
    0%, 100% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-20px);
    }
  }
  .animate-float {
    animation: float 6s ease-in-out infinite;
  }
  @keyframes fade-in {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  .animate-fade-in {
    animation: fade-in 0.8s ease-out;
  }
  @keyframes scale-in {
    from {
      opacity: 0;
      transform: scale(0.9);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
  .animate-scale-in {
    animation: scale-in 0.8s ease-out;
  }
`}</style>
    </>
  );
};

export default HomeHeroSection;