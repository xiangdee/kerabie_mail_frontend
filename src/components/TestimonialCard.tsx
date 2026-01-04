import React from "react";
import { Star } from "lucide-react";
import Image from "next/image";

interface TestimonialCardProps {
  quote: string;
  author: string;
  role: string;
  company: string;
  rating: number;
  image?: string;
}

export const TestimonialCard = ({
  quote,
  author,
  role,
  company,
  rating,
  image,
}: TestimonialCardProps) => {
  return (
    <div className="relative rounded-xl border border-slate-200 dark:border-primary/90 bg-white dark:bg-primary/70 p-6 transition hover:shadow-md">
      
      {/* Rating */}
      <div className="flex gap-1 mb-4">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < rating
                ? "fill-amber-400 text-amber-400"
                : "text-slate-300 dark:text-white"
            }`}
          />
        ))}
      </div>

      {/* Quote */}
      <p className="text-white  text-base leading-relaxed mb-6">
        “{quote}”
      </p>

      {/* Author */}
      <div className="flex items-center gap-4 border-t border-slate-200 dark:border-primary/90 pt-4">
        
        {/* Avatar */}
        <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-primary/90 flex items-center justify-center overflow-hidden shrink-0">
          {image ? (
            <Image
              src={image}
              alt={author}
              width={48}
              height={48}
              className="object-cover"
            />
          ) : (
            <span className="text-gray-50   font-semibold">
              {author[0]}
            </span>
          )}
        </div>

        {/* Name & role */}
        <div>
          <p className="font-semibold text-primary/70 dark:text-white leading-tight">
            {author}
          </p>
          <p className="text-sm text-gray-50 ">
            {role}, <span className="font-medium">{company}</span>
          </p>
        </div>
      </div>
    </div>
  );
};
