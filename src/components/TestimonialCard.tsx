import { Star } from "lucide-react";
import { Corners } from "@/components/ui/corners";

interface TestimonialCardProps {
  quote: string;
  author: string;
  role: string;
  company: string;
  rating: number;
}

export const TestimonialCard = ({ quote, author, role, company, rating }: TestimonialCardProps) => {
  return (
    <div className="blueprint relative p-[26px] transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(26,31,30,.08)]">
      <Corners />

      <div className="flex gap-0.5 text-[#E0A855]">
        {[...Array(5)].map((_, i) => (
          <Star key={i} size={14} className={i < rating ? "fill-current" : "text-border"} />
        ))}
      </div>

      <p className="mb-5 mt-3.5 text-[14.5px] leading-relaxed">“{quote}”</p>

      <div className="flex items-center gap-2.5">
        <span className="grid h-9 w-9 shrink-0 place-items-center border border-border bg-muted text-[13px] font-semibold">
          {author[0]}
        </span>
        <span>
          <span className="block text-[13.5px] font-semibold">{author}</span>
          <span className="block text-xs text-muted-foreground">
            {role}, {company}
          </span>
        </span>
      </div>
    </div>
  );
};
