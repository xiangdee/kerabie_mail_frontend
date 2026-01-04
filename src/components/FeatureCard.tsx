/* eslint-disable @typescript-eslint/no-explicit-any */
import Image from "next/image";
import { cn } from "@/lib/utils";

interface FeatureCardProps {
  icon: any; 
  title: string;
  description: string;
  className?: string;
  isImage?: boolean; 
}

export const FeatureCard = ({ 
  icon: Icon, 
  title, 
  description, 
  className,
  isImage = false
}: FeatureCardProps) => {
  return (
    <div className={cn(
      "group p-8 transition-all duration-300 border-b ",
      className
    )}>
      {/* Icon with border */}
      <div className="mb-6 flex justify-center">
        <div className="inline-flex h-16 w-16 items-center justify-center  transition-all duration-300 group-hover:border-[#345147] group-hover:scale-110">
          {isImage ? (
            <Image 
              src={Icon} 
              alt={title} 
              width={80} 
              height={80} 
              className="object-contain"
            />
          ) : (
            <Icon size={36} className="text-[#345147]" />
          )}
        </div>
      </div>

      {/* Content */}
      <h3 className="mb-3 text-2xl font-bold text-foreground ">
        {title}
      </h3>
      <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
        {description}
      </p>

      {/* Underline on hover */}
      <div className="mt-4 h-0.5 w-0 bg-[#345147] transition-all duration-300 group-hover:w-12"></div>
    </div>
  );
};