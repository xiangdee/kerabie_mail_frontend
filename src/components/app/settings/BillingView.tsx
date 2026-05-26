'use client';
import { format, parseISO } from 'date-fns';
import { CreditCard, Zap, Crown, Building2, AlertTriangle, CheckCircle2, Loader2, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { Subscription } from '@/lib/types/api.types';

const PLAN_ICONS = {
  free: Zap,
  pro: Crown,
  premium: Building2,
};

const STATUS_CONFIG = {
  active: { label: 'Active', class: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  past_due: { label: 'Past due', class: 'bg-red-100 text-red-700 border-red-200' },
  canceled: { label: 'Cancelled', class: 'bg-gray-100 text-gray-600 border-gray-200' },
  trial: { label: 'Trial', class: 'bg-blue-100 text-blue-700 border-blue-200' },
};

interface BillingViewProps {
  subscription: Subscription | null | undefined;
  isLoading: boolean;
  isCancelling: boolean;
  isReactivating: boolean;
  planType?: string;
  onCancel: () => void;
  onReactivate: () => void;
}

export function BillingView({
  subscription, isLoading, isCancelling, isReactivating,
  planType, onCancel, onReactivate,
}: BillingViewProps) {
  const plan = (planType ?? 'free') as keyof typeof PLAN_ICONS;
  const PlanIcon = PLAN_ICONS[plan] ?? Zap;
  const statusCfg = subscription ? STATUS_CONFIG[subscription.status] : null;

  const fmt = (d: string) => {
    try { return format(parseISO(d), 'MMM d, yyyy'); } catch { return d; }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold">Billing & Subscription</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Manage your plan and payment details.</p>
      </div>

      {/* Current plan */}
      {isLoading ? (
        <Skeleton className="h-36 w-full rounded-xl" />
      ) : (
        <Card className="p-5 space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <PlanIcon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold capitalize">{plan} Plan</p>
                {statusCfg && (
                  <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border font-medium mt-0.5', statusCfg.class)}>
                    {statusCfg.label}
                  </span>
                )}
              </div>
            </div>
            {subscription && (
              <p className="text-2xl font-bold">
                {subscription.currency === 'NGN' ? '₦' : '$'}
                {subscription.amount.toLocaleString()}
                <span className="text-sm font-normal text-muted-foreground">/{subscription.billing_cycle}</span>
              </p>
            )}
          </div>

          {subscription && (
            <div className="grid grid-cols-2 gap-4 pt-3 border-t text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Current period</p>
                <p className="font-medium">{fmt(subscription.current_period_start)} — {fmt(subscription.current_period_end)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Next billing</p>
                <p className="font-medium">
                  {subscription.cancel_at_period_end ? (
                    <span className="text-amber-600 flex items-center gap-1">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      Cancels {fmt(subscription.current_period_end)}
                    </span>
                  ) : fmt(subscription.current_period_end)}
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-3 pt-1">
            {plan === 'free' && (
              <Button asChild size="sm">
                <Link href="/pricing">
                  <Crown className="mr-1.5 h-3.5 w-3.5" />
                  Upgrade plan
                </Link>
              </Button>
            )}
            {plan !== 'free' && subscription?.cancel_at_period_end && (
              <Button
                size="sm"
                onClick={onReactivate}
                disabled={isReactivating}
                className="gap-1.5"
              >
                {isReactivating && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                <CheckCircle2 className="h-3.5 w-3.5" />
                Reactivate
              </Button>
            )}
            {plan !== 'free' && !subscription?.cancel_at_period_end && (
              <Button
                size="sm"
                variant="outline"
                onClick={onCancel}
                disabled={isCancelling}
                className="text-destructive border-destructive/30 hover:bg-destructive/5 gap-1.5"
              >
                {isCancelling && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Cancel plan
              </Button>
            )}
            <Button variant="outline" size="sm" className="gap-1.5" asChild>
              <a href="https://billing.kerabie.email" target="_blank" rel="noopener">
                <CreditCard className="h-3.5 w-3.5" />
                Manage payment
                <ExternalLink className="h-3 w-3" />
              </a>
            </Button>
          </div>
        </Card>
      )}

      {/* Plan comparison CTA */}
      {plan === 'free' && !isLoading && (
        <Card className="p-5 border-primary/20 bg-primary/5">
          <div className="flex items-start gap-3">
            <Crown className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="font-medium text-sm">Unlock more with Pro</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                5 mailboxes, unlimited email, AI compose, custom domain, and more.
              </p>
            </div>
            <Button asChild size="sm">
              <Link href="/pricing">See plans</Link>
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
