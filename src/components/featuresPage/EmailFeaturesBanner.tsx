import { Mail, Sparkles } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function EmailFeaturesBanner() {
  

  return (
    <div className="min-h-screen md:min-h-0 bg-white py-10">
      {/* Hero Section - Inspired by first image */}
      <div className="max-w-5xl mx-auto text-center mb-2 relative">
        {/* Decorative stars */}
        <Sparkles className="absolute top-0 md:right-1/4 right-12 w-8 h-8 text-gray-800" />
        <Sparkles className="absolute top-10 md:left-1/4 left-12 w-6 h-6 text-gray-800" />
        
        <div className="max-w-6xl mx-auto mb-5 px-5 md:px-10">
        <div className="flex items-center justify-center  mb-8">
          <div className=" w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center">
            <Image src="/k-leaf-icon.png" width={20} height={20} alt="k-leaf-icon.png"/>
          </div>
          <span className="text-primary font-semibold text-sm tracking-wider uppercase bg-primary/10 px-4 py-2 rounded-full">
            Our Features
          </span>
        </div>
        
        <h2 className="text-4xl md:text-6xl font-bold text-center mb-4">
          <span className="text-gray-900">Maximize engagement with a smart</span>
          <br />
          <span className="text-gray-900">email </span>
          <span className="text-primary">service</span>
        </h2>
        <p className='text-gray-500'>
          Kerabie Mail empowers businesses with advanced email  tools to 
          drive engagement and conversions. Automate, personalize, and solve every businwss emailing needs
        </p>
      </div>
      </div>




    <div className="w-full ">
      <div className="w-full md:px-4 px-5">
        <div className="
          flex flex-col gap-4
          w-full
          md:w-auto
          md:flex-row md:justify-center md:items-center
        ">

          {/* input */}
          <div className="relative w-full md:w-[340px]">
            <input
              type="email"
              placeholder="Enter your email"
              className="
                h-12 w-full rounded-xl
                border-2 border-primary
                px-4 pr-10
                outline-none
                focus:ring-2 focus:ring-primary/50
              "
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-primary/70">
              <Mail size={18} />
            </span>
          </div>

          {/* button */}
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
            "
          >
            Get Kerabie
          </button>

        </div>
        <div className="text-center mt-2">
          <p className='text-gray-500'>By submitting this form, you agree to Our 
            <Link href="/privacy" className="text-primary underline hover:text-primary/90">Terms of Service</Link></p>
        </div>
      </div>
    </div>



    </div>
  );
}