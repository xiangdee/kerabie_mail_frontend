import React from 'react';
import { Mail } from 'lucide-react';
import Image from 'next/image';

export default function EmailPlatformHero() {
  return (
    <section className="bg-linear-to-br from-slate-50 to-slate-100 py-16 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Content */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-primary font-semibold">
              <Mail className="w-5 h-5" />
              <span className="uppercase tracking-wide text-sm">About Kerabie</span>
            </div>
            
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
              Built for businesses that need email to just work.
            </h1>
            
            <p className="text-lg text-gray-600 leading-relaxed">
              Kerabie delivers a stable, secure, and fully optimized email experience that
              supports your customers as they grow. From high deliverability to intuitive
              features, we help businesses communicate with clarity and confidence.
            </p>
            
            <button className="bg-secondary hover:bg-primary text-white font-semibold px-8 py-4 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
              Get Started
            </button>
          </div>
          
          {/* Right Image Section */}
          <div className="relative">
            {/* Main Image Container */}
            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              <Image
                width={800}
                height={600} 
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=600&fit=crop" 
                alt="Team collaboration workspace"
                className="w-full h-auto"
              />
              
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-linear-to-br from-secondary/20 to-blue-500/20 mix-blend-overlay"></div>
              
              {/* Decorative Icon */}
              <div className="absolute top-6 right-6 bg-secondary p-4 rounded-2xl shadow-lg animate-pulse">
                <Mail className="w-8 h-8 text-white" />
              </div>
            </div>
            
            {/* Stats Card */}
            <div className="absolute -bottom-8 -left-8 bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
              <div className="text-5xl font-bold text-gray-900 mb-2">15+</div>
              <div className="text-gray-600 font-medium">Years of Experience</div>
            </div>
            
            {/* Decorative Elements */}
            <div className="absolute -top-6 -left-6 w-32 h-32 bg-green-400/30 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute -bottom-6 -right-6 w-40 h-40 bg-blue-400/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
          </div>
          
        </div>
      </div>
    </section>
  );
}