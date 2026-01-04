import type { LucideIcon } from 'lucide-react';

type Currency = 'usd' | 'ngn';
type BillingCycle = 'monthly' | 'yearly' | 'biennial' | 'triennial';

type CurrencyPrice = Record<Currency, number>;

interface BasePlan {
  name: string;
  icon: LucideIcon;
  description: string;
  features: string[];
  highlighted: boolean;
}

export interface FreePlan extends BasePlan {
  name: 'Free';
  price: CurrencyPrice;
  limitations?: string[];
}

export interface PaidPlan extends BasePlan {
  name: 'Pro' | 'Premium';
  prices: Record<BillingCycle, CurrencyPrice>;
  savings?: Partial<Record<BillingCycle, number>>;
}

export type IPlan = FreePlan | PaidPlan;


