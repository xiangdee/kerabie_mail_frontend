import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface PricingCardProps {
  name: string;
  icon: React.ComponentType<{ size?: number }>;
  price: number;
  originalPrice: number | null;
  monthlyEquivalent?: string | null;
  description: string;
  features: string[];
  limitations?: string[];
  highlighted: boolean;
  billingCycle: 'monthly' | 'yearly' | 'biennial' | 'triennial';
  currency: 'usd' | 'ngn';
  savings?: {
    yearly?: number;
    biennial?: number;
    triennial?: number;
  };
}

const PricingCard = ({ 
  name, 
  icon: Icon, 
  price, 
  originalPrice,
  monthlyEquivalent,
  description, 
  features, 
  limitations,
  highlighted, 
  billingCycle, 
  currency,
  savings
}: PricingCardProps) => {
  
  const formatPrice = (val: number) => {
    return currency === 'ngn' 
      ? `₦${val.toLocaleString()}` 
      : `$${val}`;
  };

  const getCycleLabel = () => {
    switch (billingCycle) {
      case 'monthly': return 'mo';
      case 'yearly': return 'yr';
      case 'biennial': return '2 yrs';
      case 'triennial': return '3 yrs';
    }
  };

  const getBillingText = () => {
    switch (billingCycle) {
      case 'monthly': return null;
      case 'yearly': return 'annually';
      case 'biennial': return 'every 2 years';
      case 'triennial': return 'every 3 years';
    }
  };

  const getSavingsPercent = () => {
    if (name === 'Free' || !savings) return null;
    return savings[billingCycle as keyof typeof savings];
  };

  const isFree = name === 'Free';
  const currentSavings = getSavingsPercent();

  return (
    <Card className={`relative flex flex-col p-8 transition-all duration-500 overflow-hidden ${
      highlighted 
        ? "border-primary shadow-2xl scale-105 z-10 bg-card" 
        : "border-border hover:border-primary/40 shadow-sm translate-y-0 hover:-translate-y-2"
    }`}>
      
      {highlighted && (
        <div className="absolute top-0 right-0">
          <div className="bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-widest py-1 px-10 translate-x-[35px] translate-y-[15px] rotate-45">
            Best Value
          </div>
        </div>
      )}

      <div className="mb-8">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 ${
          highlighted ? 'bg-primary text-primary-foreground' : 'bg-muted text-primary'
        }`}>
          <Icon size={24} />
        </div>
        <h3 className="text-2xl font-bold mb-2">{name}</h3>
        <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
      </div>

      <div className="mb-8">
        {isFree ? (
          <div className="flex items-baseline gap-1">
            <span className="text-5xl font-black tracking-tight">{formatPrice(price)}</span>
            <span className="text-muted-foreground font-medium">/forever</span>
          </div>
        ) : (
          <>
            {billingCycle !== 'monthly' && originalPrice && price < originalPrice ? (
    <div className="flex items-baseline gap-1 mb-2">
      <span className="text-3xl font-bold text-muted-foreground line-through">
        {formatPrice(originalPrice)}
      </span>
    </div>
  ) : null}
            
            <div className="flex items-baseline gap-1">
              <span className="text-5xl font-black tracking-tight">{formatPrice(price)}</span>
              <span className="text-muted-foreground font-medium">/{getCycleLabel()}</span>
            </div>
            
            {monthlyEquivalent && billingCycle !== 'monthly' && (
              <p className="text-sm text-muted-foreground mt-2">
                {formatPrice(parseFloat(monthlyEquivalent))}/mo
              </p>
            )}
            
            {billingCycle !== 'monthly' && (
              <div className="mt-3 flex flex-col gap-1">
                <p className="text-xs font-semibold text-muted-foreground">
                  Billed {formatPrice(price)} {getBillingText()}
                </p>
                {currentSavings && (
                  <span className="inline-block w-fit px-2 py-0.5 rounded-md bg-green-500/10 text-green-600 text-[10px] font-bold">
                    SAVE {currentSavings}%
                  </span>
                )}
              </div>
            )}
          </>
        )}
      </div>

      <ul className="space-y-4 mb-6 flex-grow">
        {features.map((feature: string, i: number) => (
          <li key={i} className="flex items-start gap-3 text-sm">
            <div className={`p-0.5 rounded-full mt-0.5 shrink-0 ${
              highlighted ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
            }`}>
              <Check size={14} strokeWidth={3} />
            </div>
            <span className={highlighted ? 'font-medium' : 'text-muted-foreground'}>{feature}</span>
          </li>
        ))}
        
        {limitations && limitations.map((limitation: string, i: number) => (
          <li key={`limit-${i}`} className="flex items-start gap-3 text-sm">
            <div className="p-0.5 rounded-full mt-0.5 shrink-0 bg-red-500/10 text-red-500">
              <X size={14} strokeWidth={3} />
            </div>
            <span className="text-muted-foreground">{limitation}</span>
          </li>
        ))}
      </ul>

      <Button 
        variant={highlighted ? "default" : "outline"} 
        className={`w-full h-12 text-md font-bold rounded-xl transition-all ${
          highlighted ? "shadow-lg shadow-primary/25 hover:scale-[1.02]" : "hover:bg-primary/5"
        }`}
      >
        {isFree ? 'Start for free' : `Upgrade to ${name}`}
      </Button>
    </Card>
  );
};

export default PricingCard;