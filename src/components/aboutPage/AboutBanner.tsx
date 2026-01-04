import React from 'react';
import {  Users, Sparkles, Target } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function AboutBanner() {
  return (
    <div className="min-h-screen md:min-h-0 bg-white py-10">
      {/* Hero Section */}
      <div className="max-w-5xl mx-auto text-center mb-2 relative">
        {/* Decorative stars */}
        <Sparkles className="absolute top-0 md:right-1/4 right-12 w-8 h-8 text-gray-800" />
        <Sparkles className="absolute top-10 md:left-1/4 left-12 w-6 h-6 text-gray-800" />
        
        <div className="max-w-6xl mx-auto mb-5 px-5 md:px-10">
          <div className="flex items-center justify-center mb-8">
            <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center">
              <Image src="/k-leaf-icon.png" width={20} height={20} alt="k-leaf-icon.png"/>
            </div>
            <span className="text-primary font-semibold text-sm tracking-wider uppercase bg-primary/10 px-4 py-2 rounded-full">
              About Us
            </span>
          </div>
        
          <h2 className="text-4xl md:text-6xl font-bold text-center mb-4">
            <span className="text-gray-900">Building the </span>
            <span className="text-primary">future</span>
            <span className="text-gray-900"> of</span>
            <br />
            <span className="text-gray-900">business communication</span>
          </h2>
          <p className='text-gray-500 max-w-3xl mx-auto'>
            We&apos;re on a mission to transform how professionals communicate. 
            Kerabie combines cutting-edge technology with thoughtful design 
            to create an email experience that actually works for you.
          </p>
        </div>
      </div>

      {/* CTA Section */}
      <div className="w-full">
        <div className="w-full md:px-4 px-5">
          <div className="
            flex flex-col gap-4
            w-full
            md:w-auto
            md:flex-row md:justify-center md:items-center
          ">
            {/* Join Us Button */}
            <button
              className="
                h-12 w-full
                md:w-auto md:px-10
                bg-primary hover:bg-primary-hover
                text-white font-semibold
                rounded-xl
                transition-all duration-300
                shadow-md hover:shadow-lg
                hover:-translate-y-0.5
                focus:ring-2 focus:ring-primary/50
                flex items-center justify-center gap-2
              "
            >
              <Users size={18} />
              Join Kerabie
            </button>

            {/* Learn More Button */}
            <Link
              href="/features"
              className="
                h-12 w-full
                md:w-auto md:px-10
                bg-white hover:bg-gray-50
                text-gray-900 font-semibold
                rounded-xl
                border-2 border-gray-200
                transition-all duration-300
                shadow-md hover:shadow-lg
                hover:-translate-y-0.5
                focus:ring-2 focus:ring-primary/50
                flex items-center justify-center gap-2
              "
            >
              <Target size={18} />
              Our Features
            </Link>
          </div>
          
          <div className="text-center mt-4">
            <p className='text-gray-500'>
              Have questions? <Link href="/contact" className="text-primary underline hover:text-primary/90 font-medium">Get in touch</Link> with our team
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}