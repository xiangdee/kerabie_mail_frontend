'use client';
import React, { useState } from 'react';
import { Mail, Server, Shield, Globe, Lock,  ArrowRight, Key, Cloud } from 'lucide-react';
import Image from 'next/image';

export default function EmailConnectionBento() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [activeCard, setActiveCard] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Connect Your Email Account
          </h1>
          <p className="text-lg text-gray-600">
            Choose the best way to connect your email and start sending emails
          </p>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-12 gap-6">
          {/* Connect Domain - Large Card */}
          <div 
            className="
            col-span-12 lg:col-span-7 bg-red-600 rounded-3xl p-8 text-white relative overflow-hidden group
            
            cursor-pointer transition-transform hover:scale-[1.02]"
            onMouseEnter={() => setActiveCard('domain')}
            onMouseLeave={() => setActiveCard(null)}
          >
            <div className="relative z-10">
              <div className="flex items-start justify-between md:mb-6 mb-2">
                <div>
                  <div className="inline-block bg-white/20 backdrop-blur-sm rounded-full p-3 mb-4">
                    <Globe className="w-8 h-8" />
                  </div>
                  <div className="absolute top-4 right-4 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full">
              RECOMMENDED
            </div>
                  <h2 className="text-3xl font-bold mb-1 md:mb-3">Connect Domain</h2>
                  <p className="text-emerald-50 md:text-lg mb-1 md:mb-6 max-w-md">
                    Set up professional email addresses with your own domain. Perfect for businesses that want brand consistency.
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl md:p-4 p-2">
                  <div className="text-2xl font-bold mb-1">Custom</div>
                  <div className="text-emerald-100 text-sm">your@domain.com</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl md:p-4 p-2">
                  <div className="text-2xl font-bold mb-1">DNS</div>
                  <div className="text-emerald-100 text-sm">Simple configuration</div>
                </div>
              </div>

              <button className="bg-white text-emerald-600 px-6 py-3 rounded-xl font-semibold hover:bg-emerald-50 transition-colors inline-flex items-center gap-2">
                Get Started
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Decorative illustration area */}
            <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-10">
              <div className="w-48 h-48 bg-white rounded-3xl transform rotate-12">
                <Image src="/connect-domain.png" alt="Bento Illustration" width={100} height={100} />
              </div>
            </div>
          </div>

          {/* Connect OAuth - Medium Card */}
          <div 
            className="col-span-12 lg:col-span-5 bg-linear-to-br from-green-700 to-primary rounded-3xl p-8 text-white relative overflow-hidden group cursor-pointer transition-transform hover:scale-[1.02]"
            onMouseEnter={() => setActiveCard('oauth')}
            onMouseLeave={() => setActiveCard(null)}
          >
            

            <div className="inline-block bg-white/20 backdrop-blur-sm rounded-full p-3 mb-4">
              <Shield className="w-8 h-8" />
            </div>

            <h2 className="text-2xl font-bold mb-3">Connect OAuth</h2>
            <p className="text-blue-50 mb-6">
              Most secure method with one-click authentication. No password sharing required.
            </p>

            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-3">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <span className="font-medium">Gmail</span>
              </div>
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-3">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                  <Cloud className="w-5 h-5 text-primary" />
                </div>
                <span className="font-medium">Outlook</span>
              </div>
            </div>

            <button className="w-full bg-white text-primary px-6 py-3 rounded-xl font-semibold hover:bg-blue-50 transition-colors inline-flex items-center justify-center gap-2">
              Connect Now
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Connect IMAP - Wide Card */}
          <div 
            className="col-span-12 lg:col-span-5 bg-white border-2 border-gray-200 rounded-3xl p-8 relative overflow-hidden
             group cursor-pointer transition-all hover:border-purple-300 hover:shadow-lg items-center"
            onMouseEnter={() => setActiveCard('imap')}
            onMouseLeave={() => setActiveCard(null)}
          >
            <div className="inline-block bg-purple-100 rounded-full p-3 mb-4">
              <Server className="w-8 h-8 text-primary" />
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-3">Connect IMAP/SMTP</h2>
            <p className="text-gray-600 mb-6">
              Connect any email provider using IMAP and SMTP protocols. Works with all email services.
            </p>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="border border-gray-200 rounded-xl p-3">
                <Key className="w-5 h-5 text-primary mb-2" />
                <div className="text-sm font-semibold text-gray-900">Manual Setup</div>
              </div>
              <div className="border border-gray-200 rounded-xl p-3">
                <Lock className="w-5 h-5 text-primary mb-2" />
                <div className="text-sm font-semibold text-gray-900">Secure Access</div>
              </div>
            </div>

            <button className="w-full bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-purple-700 transition-colors inline-flex items-center justify-center gap-2">
              Configure IMAP
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Info Cards */}
          <div className="col-span-12 lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
            <div className="bg-yellow-400 rounded-2xl p-6">
              <div className="text-3xl font-bold text-gray-900 mb-2">99.9%</div>
              <div className="text-gray-800 font-medium">Uptime Guarantee</div>
            </div>

            <div className="bg-pink-400 rounded-2xl p-6">
              <div className="text-3xl font-bold text-white mb-2">24/7</div>
              <div className="text-pink-50 font-medium">Support Available</div>
            </div>

            <div className="bg-indigo-400 rounded-2xl p-6">
              <div className="text-3xl font-bold text-white mb-2">Instant</div>
              <div className="text-indigo-50 font-medium">Synchronization</div>
            </div>
          </div>
        </div>

        {/* Bottom Help Section */}
        <div className="mt-12 bg-linear-to-r from-gray-100 to-gray-200 rounded-2xl p-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Need help choosing?</h3>
              <p className="text-gray-600">Our team can help you select the best connection method for your needs</p>
            </div>
            <button className="bg-gray-900 text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-800 transition-colors">
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}