import { Card } from "@/components/ui/card";
import { Star } from "lucide-react";

interface TestimonialCardProps {
  quote: string;
  author: string;
  role: string;
  company: string;
  rating: number;
}

export const TestimonialCard = ({
  quote,
  author,
  role,
  company,
  rating,
}: TestimonialCardProps) => {
  return (
    <Card className="h-full p-6 transition-all duration-300 hover:shadow-lg">
      <div className="mb-4 flex">
        {[...Array(rating)].map((_, i) => (
          <Star key={i} className="h-5 w-5 fill-primary text-primary" />
        ))}
      </div>
      
      <blockquote className="mb-6 text-foreground">
        &quot;{quote}&quot;
      </blockquote>

      <div className="border-t border-border pt-4">
        <p className="font-semibold text-foreground">{author}</p>
        <p className="text-sm text-muted-foreground">
          {role} at {company}
        </p>
      </div>
    </Card>
  );
};
