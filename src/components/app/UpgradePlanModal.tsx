'use client';
import { useState } from 'react';
import { useAuth } from '@/lib/context/auth.context';
import {
  usePlans, useSubscription, useCreateSubscription,
  useUpgradeFromTrial, useUpgradeExistingSubscription,
  type Plan,
} from '@/lib/hooks/useBilling';
import { useAppToast } from '@/components/ui/app-toast';
import { siteUrl } from '@/lib/constants/links';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Crown, Building2, Loader2, Check, Minus, Plus } from 'lucide-react';

const PLAN_ICONS: Record<string, React.ElementType> = {
  pro: Crown,
  premium: Building2,
};

interface Props {
  open: boolean;
  onClose: () => void;
  onUpgraded?: () => void;
  defaultPlan?: 'pro' | 'premium';
  defaultCycle?: 'monthly' | 'yearly';
  defaultExtraMailboxes?: number;
  /** Optional context line shown above the plan picker — e.g. explaining
   *  why the modal opened (phone-verification skip, plan-limit hit, etc). */
  reason?: string;
}

/**
 * Plan + billing-cycle + add-ons picker, ending in a real checkout — used
 * both from the billing page's "Upgrade" button and from anywhere else in
 * the app that wants to offer an in-context upgrade (e.g. the phone-
 * verification page's "skip verification" path) without a full page nav.
 */
export default function UpgradePlanModal({
  open, onClose, onUpgraded, defaultPlan = 'pro', defaultCycle = 'monthly', defaultExtraMailboxes = 0, reason,
}: Props) {
  const { token } = useAuth();
  const { success, error: toastError } = useAppToast();

  const [upgradePlan, setUpgradePlan] = useState<'pro' | 'premium'>(defaultPlan);
  const [upgradeCycle, setUpgradeCycle] = useState<'monthly' | 'yearly'>(defaultCycle);
  const [extraMailboxes, setExtraMailboxes] = useState(defaultExtraMailboxes);
  const [extraStorage, setExtraStorage] = useState(0);

  const { data: subscription } = useSubscription(token);
  const defaultCurrency: 'ngn' | 'usd' = subscription?.currency?.toLowerCase() === 'ngn' ? 'ngn' : 'usd';
  const { data: plansData, isLoading: plansLoading } = usePlans(defaultCurrency.toUpperCase());

  const createMutation = useCreateSubscription(token);
  const upgradeFromTrialMutation = useUpgradeFromTrial(token);
  const upgradeExistingMutation = useUpgradeExistingSubscription(token);
  const isSubmitting = createMutation.isPending || upgradeFromTrialMutation.isPending || upgradeExistingMutation.isPending;

  const paidPlans = (plansData?.plans ?? []).filter(p => p.id !== 'free') as Plan[];
  const selectedPlan = paidPlans.find(p => p.id === upgradePlan) ?? null;
  const currencySymbol = plansData?.currency === 'NGN' ? '₦' : '$';
  const mailboxAddon = plansData?.addons?.find(a => a.type === 'extra_mailbox');
  const storageAddon = plansData?.addons?.find(a => a.type === 'extra_storage');
  const planPrice = selectedPlan?.billing_cycles[upgradeCycle]?.amount ?? 0;
  const mailboxTotal = (mailboxAddon?.amount ?? 0) * extraMailboxes;
  const storageTotal = (storageAddon?.amount ?? 0) * extraStorage;
  const price = planPrice + mailboxTotal + storageTotal;

  const reset = () => { setExtraMailboxes(0); setExtraStorage(0); };

  const handleSubmit = async () => {
    try {
      const addons = [
        ...(extraMailboxes > 0 ? [{ type: 'extra_mailbox' as const, quantity: extraMailboxes }] : []),
        ...(extraStorage > 0 ? [{ type: 'extra_storage' as const, quantity: extraStorage }] : []),
      ];
      const addonsArg = addons.length > 0 ? addons : undefined;

      // Already on an active paid plan -> move to a higher tier via the
      // dedicated upgrade endpoint. /subscriptions/create 400s outright for
      // anyone in this state ("User already has an active subscription"),
      // it's only for a free/expired/no-subscription account.
      if (subscription?.status === 'active') {
        const result = await upgradeExistingMutation.mutateAsync({
          new_plan: upgradePlan,
          new_billing_cycle: upgradeCycle,
          addons: addonsArg,
        });
        // Paddle/Bachs upgrade the existing subscription in place and return
        // no redirect at all — only Flutterwave needs re-authorization.
        if (result.authorization_url) {
          window.location.href = result.authorization_url;
        } else {
          success('Plan upgraded');
          reset();
          onUpgraded?.();
          onClose();
        }
        return;
      }

      const payload = {
        plan: upgradePlan,
        billing_cycle: upgradeCycle,
        currency: defaultCurrency,
        return_url: `${siteUrl}/app/settings/billing`,
        country_code: defaultCurrency === 'ngn' ? 'NG' : 'US',
        addons: addonsArg,
      };
      // Every signup starts a 3-day Pro trial automatically — /subscriptions/create
      // rejects outright while that trial is still active, so a trial user has
      // to go through the dedicated trial->paid endpoint instead.
      const result = subscription?.status === 'trial'
        ? await upgradeFromTrialMutation.mutateAsync(payload)
        : await createMutation.mutateAsync(payload);
      // Redirect to the payment provider's checkout page
      window.location.href = result.authorization_url;
    } catch (err: unknown) {
      const msg = (err as Error)?.message;
      toastError(msg || 'Could not start checkout. Please try again.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) { reset(); onClose(); } }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Choose a plan</DialogTitle>
          <DialogDescription>
            {reason ?? "Pick a plan and billing cycle. You'll be redirected to complete payment securely."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Plan picker */}
          <div className="grid grid-cols-2 gap-3">
            {plansLoading ? (
              <div className="col-span-2 h-32 flex items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : paidPlans.map(plan => {
              const PlanIcon = PLAN_ICONS[plan.id] ?? Crown;
              const selected = upgradePlan === plan.id;
              return (
                <button
                  key={plan.id}
                  type="button"
                  onClick={() => setUpgradePlan(plan.id as 'pro' | 'premium')}
                  className={cn(
                    'rounded-xl border p-4 text-left transition-colors',
                    selected
                      ? 'border-primary bg-primary/5 ring-1 ring-primary'
                      : 'border-border hover:border-primary/50',
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <PlanIcon className={cn('h-4 w-4', selected ? 'text-primary' : 'text-muted-foreground')} />
                    {selected && <Check className="h-3.5 w-3.5 text-primary" />}
                  </div>
                  <p className="font-semibold text-sm">{plan.name}</p>
                  <ul className="mt-2 space-y-1">
                    {plan.features.slice(0, 3).map(f => (
                      <li key={f} className="text-xs text-muted-foreground">{f}</li>
                    ))}
                  </ul>
                </button>
              );
            })}
          </div>

          {/* Billing cycle */}
          <div className="space-y-1.5">
            <Label>Billing cycle</Label>
            <div className="grid grid-cols-2 gap-2">
              {(['monthly', 'yearly'] as const).map(cycle => (
                <button
                  key={cycle}
                  type="button"
                  onClick={() => setUpgradeCycle(cycle)}
                  className={cn(
                    'rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors capitalize',
                    upgradeCycle === cycle
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-border text-muted-foreground hover:border-primary/50',
                  )}
                >
                  {cycle}
                  {cycle === 'yearly' && (
                    <span className="ml-1.5 text-xs rounded-full bg-emerald-100 text-emerald-700 px-1.5 py-0.5">
                      Save 25%
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Add-ons */}
          <div className="space-y-2">
            <Label>Add-ons <span className="text-muted-foreground font-normal">(optional)</span></Label>

            {mailboxAddon && (
              <div className="flex items-center justify-between rounded-lg border px-4 py-2.5">
                <div>
                  <p className="text-sm font-medium">Extra mailboxes</p>
                  <p className="text-xs text-muted-foreground">
                    {mailboxAddon.symbol}{mailboxAddon.amount}/mo each
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Button type="button" variant="outline" size="icon" className="h-7 w-7"
                    disabled={extraMailboxes <= 0} onClick={() => setExtraMailboxes(n => Math.max(0, n - 1))}>
                    <Minus className="h-3.5 w-3.5" />
                  </Button>
                  <span className="w-4 text-center text-sm font-semibold tabular-nums">{extraMailboxes}</span>
                  <Button type="button" variant="outline" size="icon" className="h-7 w-7"
                    onClick={() => setExtraMailboxes(n => Math.min(100, n + 1))}>
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            )}

            {storageAddon && (
              <div className="flex items-center justify-between rounded-lg border px-4 py-2.5">
                <div>
                  <p className="text-sm font-medium">Extra storage</p>
                  <p className="text-xs text-muted-foreground">
                    {storageAddon.symbol}{storageAddon.amount}/mo each (10GB)
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Button type="button" variant="outline" size="icon" className="h-7 w-7"
                    disabled={extraStorage <= 0} onClick={() => setExtraStorage(n => Math.max(0, n - 1))}>
                    <Minus className="h-3.5 w-3.5" />
                  </Button>
                  <span className="w-4 text-center text-sm font-semibold tabular-nums">{extraStorage}</span>
                  <Button type="button" variant="outline" size="icon" className="h-7 w-7"
                    onClick={() => setExtraStorage(n => Math.min(100, n + 1))}>
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Price summary */}
          {selectedPlan && (
            <div className="rounded-xl border bg-muted/40 px-4 py-3 space-y-1">
              <div className="flex items-baseline justify-between">
                <p className="text-sm text-muted-foreground">
                  {selectedPlan.name} · {upgradeCycle}
                  {extraMailboxes > 0 && ` + ${extraMailboxes} mailbox${extraMailboxes > 1 ? 'es' : ''}`}
                  {extraStorage > 0 && ` + ${extraStorage * 10}GB`}
                </p>
                <p className="font-bold text-lg">
                  {currencySymbol}{price.toLocaleString()}
                  <span className="text-sm font-normal text-muted-foreground">
                    /{upgradeCycle === 'monthly' ? 'mo' : 'yr'}
                  </span>
                </p>
              </div>
              {(mailboxTotal > 0 || storageTotal > 0) && (
                <p className="text-xs text-muted-foreground text-right">
                  {currencySymbol}{planPrice.toLocaleString()} plan
                  {mailboxTotal > 0 && ` + ${currencySymbol}${mailboxTotal.toLocaleString()} mailboxes`}
                  {storageTotal > 0 && ` + ${currencySymbol}${storageTotal.toLocaleString()} storage`}
                </p>
              )}
            </div>
          )}

          <p className="text-xs text-muted-foreground">
            Payment is processed securely via {defaultCurrency === 'ngn' ? 'Flutterwave' : 'our payment partner'}.
            You can cancel anytime from Settings → Billing.
          </p>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => { reset(); onClose(); }} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting} className="gap-1.5">
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Continue to payment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
