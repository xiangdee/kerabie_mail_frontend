'use client';
import { Zap, Crown, Building2 } from "lucide-react";
import { useState } from "react";
import { Card } from "./ui/card";
import PricingCard from "./PricingCard";
import { IPlan } from "@/lib/types/PlanTypes";
import { useCurrency } from "@/lib/utils/useCurrency";
import { useGetUserIpDetails } from "@/lib/utils/useGetUserIpDetails";


// Skeleton Components
const PricingCardSkeleton = () => (
  <Card className="p-8 animate-pulse">
    <div className="space-y-6">
      {/* Icon & Title */}
      <div className="space-y-3">
        <div className="w-12 h-12 bg-muted rounded-lg"></div>
        <div className="h-8 bg-muted rounded w-24"></div>
        <div className="h-4 bg-muted rounded w-full"></div>
      </div>
      
      {/* Price */}
      <div className="space-y-2">
        <div className="h-12 bg-muted rounded w-32"></div>
        <div className="h-4 bg-muted rounded w-20"></div>
      </div>
      
      {/* Features */}
      <div className="space-y-3 pt-6 border-t">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex gap-2">
            <div className="w-5 h-5 bg-muted rounded-full flex-shrink-0"></div>
            <div className="h-4 bg-muted rounded flex-1"></div>
          </div>
        ))}
      </div>
      
      {/* Button */}
      <div className="h-11 bg-muted rounded-lg w-full"></div>
    </div>
  </Card>
);

const ControlsSkeleton = () => (
  <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
    <div className="w-64 h-12 bg-muted rounded-xl animate-pulse"></div>
    <div className="w-32 h-12 bg-muted rounded-xl animate-pulse"></div>
  </div>
);

const PricingSection = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly' | 'biennial' | 'triennial'>('monthly');
  const { userIpDetails, isFetchingUserIp } = useGetUserIpDetails();
  const { currency, setCurrency } = useCurrency({ userIpDetails, isFetchingUserIp });

  const plans: IPlan[] = [
    {
      name: 'Free',
      icon: Zap,
      price: { usd: 0, ngn: 0 },
      description: 'Ideal for personal use and exploring our platform.',
      features: [
        '1 mailbox account',
        '500MB storage',
        '100 emails/day',
        'End-to-end encryption',
        'Basic support'
      ],
      highlighted: false,
      limitations: ['Contains ads']
    },
    {
      name: 'Pro',
      icon: Crown,
      prices: {
        monthly: { usd: 2, ngn: 2000 },
        yearly: { usd: 20, ngn: 20000 },
        biennial: { usd: 36, ngn: 36000 },
        triennial: { usd: 50, ngn: 50000 }
      },
      savings: {
        yearly: 17,
        biennial: 25,
        triennial: 31
      },
      description: 'The most popular choice for professionals.',
      features: [
        '3 mailbox accounts',
        '10GB storage per mailbox',
        '1,000 emails/day',
        '100 AI requests/month',
        'Calendar & Contacts',
        'Read receipts & Unsend',
        'Webhooks',
        '10 forwarding rules',
        '50 email aliases',
        'Audit logs',
        'Priority support'
      ],
      highlighted: true
    },
    {
      name: 'Premium',
      icon: Building2,
      prices: {
        monthly: { usd: 5, ngn: 5000 },
        yearly: { usd: 50, ngn: 50000 },
        biennial: { usd: 90, ngn: 90000 },
        triennial: { usd: 126, ngn: 126000 }
      },
      savings: {
        yearly: 17,
        biennial: 25,
        triennial: 30
      },
      description: 'Advanced tools for growing organizations.',
      features: [
        '10 mailbox accounts',
        '50GB storage per mailbox',
        '2,000 emails/day',
        'Unlimited AI requests',
        'Calendar & Contacts',
        'Read receipts & Unsend',
        'Webhooks & Zapier',
        'Unlimited forwarding rules',
        'Unlimited email aliases',
        'Audit logs',
        'API access',
        'Custom domains',
        'Premium support'
      ],
      highlighted: false
    }
  ];

  const getCurrentPrice = (plan: typeof plans[number]) => {
    if (plan.name === 'Free') {
      return plan.price[currency];
    }
    return plan.prices[billingCycle][currency];
  };

  const getMonthlyEquivalent = (plan: typeof plans[number]) => {
    if (plan.name === 'Free') return null;
    
    const totalPrice = plan.prices[billingCycle][currency];
    const months = {
      monthly: 1,
      yearly: 12,
      biennial: 24,
      triennial: 36
    }[billingCycle];
    
    return (totalPrice / months).toFixed(2);
  };
  const getOriginalPrice = (plan: typeof plans[number]) => {
  if (plan.name === 'Free') return null;
  
  const monthlyPrice = plan.prices.monthly[currency];
  const months = {
    monthly: 1,
    yearly: 12,
    biennial: 24,
    triennial: 36
  }[billingCycle];
  
  return monthlyPrice * months;
};

  return (
    <section className="relative py-24 overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10">
        <div className="absolute top-24 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-24 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            Plans for every <span className="text-primary">ambition</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-10">
            Transparent pricing with no hidden fees. Switch or cancel your plan at any time.
          </p>

          {/* Enhanced Control Bar */}
          {isFetchingUserIp ? (
            <ControlsSkeleton />
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              {/* Billing Cycle Toggle */}
              <div className="bg-muted p-1 rounded-xl flex flex-col md:flex-row items-center shadow-inner">
                <button 
                  onClick={() => setBillingCycle('monthly')}
                  className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${billingCycle === 'monthly' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'}`}
                >
                  Monthly
                </button>
                <button 
                  onClick={() => setBillingCycle('yearly')}
                  className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${billingCycle === 'yearly' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'}`}
                >
                  Yearly
                  <span className="ml-1 text-xs text-primary">Save 17%</span>
                </button>
                <button 
                  onClick={() => setBillingCycle('biennial')}
                  className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${billingCycle === 'biennial' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'}`}
                >
                  2 Years
                  <span className="ml-1 text-xs text-primary">Save 25%</span>
                </button>
                <button 
                  onClick={() => setBillingCycle('triennial')}
                  className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${billingCycle === 'triennial' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'}`}
                >
                  3 Years
                  <span className="ml-1 text-xs text-primary">Save 31%</span>
                </button>
              </div>

              {/* Currency Selector */}
              <div className="flex gap-2 bg-muted p-1 rounded-xl">
                {['usd', 'ngn'].map((curr) => (
                  <button
                    key={curr}
                    onClick={() => setCurrency(curr as 'usd' | 'ngn')}
                    className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all ${currency === curr ? 'bg-primary text-primary-foreground shadow-md' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    {curr}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center max-w-7xl mx-auto">
          {isFetchingUserIp ? (
            <>
              <PricingCardSkeleton />
              <PricingCardSkeleton />
              <PricingCardSkeleton />
            </>
          ) : (
            plans.map((plan, i) => (
              <PricingCard 
                key={i} 
                {...plan} 
                originalPrice={getOriginalPrice(plan)}
                price={getCurrentPrice(plan)}
                monthlyEquivalent={getMonthlyEquivalent(plan)}
                currency={currency}
                billingCycle={billingCycle}
              />
            ))
          )}
        </div>

        {/* Add-ons Section */}
        <div className="mt-24 pt-16 border-t border-border">
          <h3 className="text-2xl font-bold text-center mb-10">Scale your plan with Add-ons</h3>
          <div className="grid sm:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {isFetchingUserIp ? (
              <>
                <Card className="p-8 animate-pulse">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2 flex-1">
                      <div className="h-6 bg-muted rounded w-32"></div>
                      <div className="h-4 bg-muted rounded w-48"></div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-8 bg-muted rounded w-16"></div>
                      <div className="h-3 bg-muted rounded w-12"></div>
                    </div>
                  </div>
                </Card>
                <Card className="p-8 animate-pulse">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2 flex-1">
                      <div className="h-6 bg-muted rounded w-32"></div>
                      <div className="h-4 bg-muted rounded w-48"></div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-8 bg-muted rounded w-16"></div>
                      <div className="h-3 bg-muted rounded w-12"></div>
                    </div>
                  </div>
                </Card>
              </>
            ) : (
              <>
                <Card className="group p-8 hover:border-primary/50 transition-colors bg-linear-to-br from-background to-muted/30">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="text-xl font-bold">Extra Storage</h4>
                      <p className="text-muted-foreground text-sm">Scale easily as your business grows. Use it all for one mailbox or share across several.</p>
                    </div>
                    <span className="text-primary font-bold text-xl">
                      {currency === 'usd' ? '$1' : '₦1,000'}
                      <span className="text-xs text-muted-foreground block text-right">/10GB</span>
                    </span>
                  </div>
                </Card>
                <Card className="group p-8 hover:border-primary/50 transition-colors bg-linear-to-br from-background to-muted/30">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="text-xl font-bold">Extra Mailbox</h4>
                      <p className="text-muted-foreground text-sm">Add more team members without upgrading your plan.</p>
                    </div>
                    <span className="text-primary font-bold text-xl">
                      {currency === 'usd' ? '$1.50' : '₦1,500'}
                      <span className="text-xs text-muted-foreground block text-right">/mailbox</span>
                    </span>
                  </div>
                </Card>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;