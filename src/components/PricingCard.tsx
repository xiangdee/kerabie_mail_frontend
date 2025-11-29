import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";

interface PricingCardProps {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  highlighted?: boolean;
}

export const PricingCard = ({
  name,
  price,
  period,
  description,
  features,
  highlighted = false,
}: PricingCardProps) => {
  return (
    <Card
      className={`relative p-8 transition-all duration-300 hover:shadow-xl ${
        highlighted
          ? "border-2 border-primary shadow-lg scale-105"
          : "hover:border-primary/20"
      }`}
    >
      {highlighted && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-sm font-semibold text-primary-foreground">
          Most Popular
        </div>
      )}
      
      <div className="mb-6">
        <h3 className="mb-2 text-2xl font-bold text-foreground">{name}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      <div className="mb-6">
        <div className="flex items-baseline">
          <span className="text-4xl font-bold text-foreground">{price}</span>
          <span className="ml-2 text-muted-foreground">/{period}</span>
        </div>
      </div>

      <Button
        className={`mb-6 w-full ${
          highlighted
            ? "bg-primary hover:bg-primary-hover"
            : "bg-secondary hover:bg-secondary-hover"
        }`}
      >
        Get Started
      </Button>

      <ul className="space-y-3">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start">
            <Check className="mr-2 mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
            <span className="text-sm text-foreground">{feature}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
};
