'use client';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/context/auth.context';
import {
  useSubscription,
  useCancelSubscription,
  useReactivateSubscription,
  useRequestRefund,
  useMyRefunds,
  useCreateSubscription,
  useUpgradeFromTrial,
  useUpgradeExistingSubscription,
  useMyAddons,
  usePurchaseAddon,
  useCancelAddon,
  type RefundReason,
} from '@/lib/hooks/useBilling';
import { useAppToast } from '@/components/ui/app-toast';
import { ConfirmDialog } from '@/components/ui/app-toast';
import { siteUrl } from '@/lib/constants/links';
import { BillingView } from '@/components/app/settings/BillingView';
import UsageSummaryView from '@/components/app/settings/UsageSummaryView';
import { useUsage } from '@/lib/hooks/useUsage';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Crown, Building2, Loader2, Check, Minus, Plus, X, Mailbox, HardDrive } from 'lucide-react';
import {
  usePlans,
  type Plan,
} from '@/lib/hooks/useBilling';

const PLAN_ICONS: Record<string, React.ElementType> = {
  pro: Crown,
  premium: Building2,
};

const REFUND_REASONS: { value: RefundReason; label: string }[] = [
  { value: 'cancellation',          label: 'Cancellation — no longer need the service' },
  { value: 'duplicate_charge',      label: 'Duplicate charge' },
  { value: 'service_not_received',  label: 'Service not received / not working' },
  { value: 'technical_issue',       label: 'Technical issue that was not resolved' },
  { value: 'other',                 label: 'Other reason' },
];


export default function BillingPage() {
  return (
    <Suspense fallback={null}>
      <BillingPageInner />
    </Suspense>
  );
}

function BillingPageInner() {
  const { token, user } = useAuth();
  const searchParams = useSearchParams();
  const { success, error: toastError } = useAppToast();

  const [confirmCancel, setConfirmCancel] = useState(false);
  const [showRefundDialog, setShowRefundDialog] = useState(false);
  const [refundReason, setRefundReason] = useState<RefundReason>('cancellation');
  const [refundDetail, setRefundDetail] = useState('');

  // Upgrade dialog state
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [upgradePlan, setUpgradePlan] = useState<'pro' | 'premium'>('pro');
  const [upgradeCycle, setUpgradeCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [extraMailboxes, setExtraMailboxes] = useState(0);

  // Add-ons dialog state (for an already-active subscriber buying more
  // mailboxes/storage without changing plan tier — separate from the
  // upgrade dialog's addon stepper, which only applies when creating or
  // changing a plan)
  const [showAddons, setShowAddons] = useState(false);
  const [buyMailboxQty, setBuyMailboxQty] = useState(1);
  const [buyStorageQty, setBuyStorageQty] = useState(1);

  const { data: subscription, isLoading } = useSubscription(token);
  const { data: usage, isLoading: usageLoading } = useUsage(token);
  const { data: refunds, isLoading: refundsLoading } = useMyRefunds(token);

  // `User` has no `currency` field (see api.types.ts) — this used to read
  // `user.currency`, which was always undefined, so every upgrade
  // unconditionally defaulted to NGN regardless of the visitor. An existing
  // subscriber upgrades in the currency they're already billed in; anyone
  // without a subscription yet (free/no-sub) defaults to USD.
  const defaultCurrency: 'ngn' | 'usd' = subscription?.currency?.toLowerCase() === 'ngn' ? 'ngn' : 'usd';
  const upgradeCurrency = defaultCurrency;

  const { data: plansData, isLoading: plansLoading } = usePlans(defaultCurrency.toUpperCase());

  const cancelMutation = useCancelSubscription(token);
  const reactivateMutation = useReactivateSubscription(token);
  const refundMutation = useRequestRefund(token);
  const createMutation = useCreateSubscription(token);
  const upgradeFromTrialMutation = useUpgradeFromTrial(token);
  const upgradeExistingMutation = useUpgradeExistingSubscription(token);
  const isUpgradeSubmitting = createMutation.isPending || upgradeFromTrialMutation.isPending || upgradeExistingMutation.isPending;

  const { data: addonsData, isLoading: addonsLoading } = useMyAddons(token);
  const purchaseAddonMutation = usePurchaseAddon(token);
  const cancelAddonMutation = useCancelAddon(token);

  // Arriving from a pricing-card CTA (?upgrade=pro&cycle=yearly&mailboxes=1)
  // — either directly (already signed in) or via /auth/register's existing
  // ?redirect= mechanism after a fresh signup. Pre-fill and open the same
  // dialog instead of making them re-pick what they already chose.
  useEffect(() => {
    const upgrade = searchParams.get('upgrade');
    if (upgrade !== 'pro' && upgrade !== 'premium') return;
    const cycle = searchParams.get('cycle');
    const mailboxes = parseInt(searchParams.get('mailboxes') ?? '0', 10);

    setUpgradePlan(upgrade);
    if (cycle === 'monthly' || cycle === 'yearly') setUpgradeCycle(cycle);
    if (Number.isFinite(mailboxes) && mailboxes > 0) setExtraMailboxes(mailboxes);
    setShowUpgrade(true);
    // Only meant to apply once, off the URL that brought us here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCancel = async () => {
    const res = await cancelMutation.mutateAsync();
    if (res.status === true) {
      success('Subscription cancelled', { description: 'Your plan remains active until the end of the billing period.' });
    } else {
      toastError('Could not cancel subscription');
    }
    setConfirmCancel(false);
  };

  const handleReactivate = async () => {
    const res = await reactivateMutation.mutateAsync();
    if (res.status === true) {
      success('Subscription reactivated!');
    } else {
      toastError('Could not reactivate subscription');
    }
  };

  const handleRefundSubmit = async () => {
    if (!subscription?.latest_transaction_id) {
      toastError('No transaction found for your current subscription.');
      return;
    }
    try {
      await refundMutation.mutateAsync({
        transaction_id: subscription.latest_transaction_id,
        reason: refundReason,
        reason_detail: refundDetail.trim() || undefined,
      });
      success('Refund request submitted', {
        description: 'Our team will review your request within 3–5 business days.',
      });
      setShowRefundDialog(false);
      setRefundDetail('');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      toastError(msg || 'Could not submit refund request. Please try again.');
    }
  };

  const handleUpgradeSubmit = async () => {
    try {
      const addons = extraMailboxes > 0 ? [{ type: 'extra_mailbox' as const, quantity: extraMailboxes }] : undefined;

      // Already on an active paid plan -> move to a higher tier via the
      // dedicated upgrade endpoint. /subscriptions/create 400s outright for
      // anyone in this state ("User already has an active subscription"),
      // it's only for a free/expired/no-subscription account.
      if (subscription?.status === 'active') {
        const result = await upgradeExistingMutation.mutateAsync({
          new_plan: upgradePlan,
          new_billing_cycle: upgradeCycle,
          addons,
        });
        // Paddle/Bachs upgrade the existing subscription in place and return
        // no redirect at all — only Flutterwave needs re-authorization.
        if (result.authorization_url) {
          window.location.href = result.authorization_url;
        } else {
          success('Plan upgraded');
          setShowUpgrade(false);
        }
        return;
      }

      const payload = {
        plan: upgradePlan,
        billing_cycle: upgradeCycle,
        currency: upgradeCurrency,
        return_url: `${siteUrl}/app/settings/billing`,
        country_code: upgradeCurrency === 'ngn' ? 'NG' : 'US',
        addons,
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

  const handlePurchaseAddon = async (type: 'extra_mailbox' | 'extra_storage', quantity: number) => {
    try {
      const result = await purchaseAddonMutation.mutateAsync({
        type,
        quantity,
        return_url: `${siteUrl}/app/settings/billing`,
      });
      // Bachs starts a brand-new checkout for the add-on and needs a
      // redirect; Paddle updates the existing subscription in place with
      // no redirect at all.
      if (result.authorization_url) {
        window.location.href = result.authorization_url;
      } else {
        success('Add-on added to your plan');
      }
    } catch (err: unknown) {
      const msg = (err as Error)?.message;
      toastError(msg || 'Could not start add-on purchase. Please try again.');
    }
  };

  const handleCancelAddon = async (paymentMethodId: number) => {
    try {
      await cancelAddonMutation.mutateAsync(paymentMethodId);
      success('Add-on cancelled');
    } catch (err: unknown) {
      const msg = (err as Error)?.message;
      toastError(msg || 'Could not cancel add-on. Please try again.');
    }
  };

  const paidPlans = (plansData?.plans ?? []).filter(p => p.id !== 'free') as Plan[];
  const selectedPlan = paidPlans.find(p => p.id === upgradePlan) ?? null;
  const currencySymbol = plansData?.currency === 'NGN' ? '₦' : '$';
  const mailboxAddon = plansData?.addons?.find(a => a.type === 'extra_mailbox');
  const storageAddon = plansData?.addons?.find(a => a.type === 'extra_storage');
  const planPrice = selectedPlan?.billing_cycles[upgradeCycle]?.amount ?? 0;
  const addonTotal = (mailboxAddon?.amount ?? 0) * extraMailboxes;
  const price = planPrice + addonTotal;

  return (
    <>
      <div className="space-y-6">
        <BillingView
          subscription={subscription}
          isLoading={isLoading}
          isCancelling={cancelMutation.isPending}
          isReactivating={reactivateMutation.isPending}
          planType={user?.plan_status}
          plans={plansData?.plans}
          refunds={refunds ?? []}
          refundsLoading={refundsLoading}
          extraMailboxes={addonsData?.extra_mailboxes}
          extraStorageGb={addonsData?.extra_storage_gb}
          onCancel={() => setConfirmCancel(true)}
          onReactivate={handleReactivate}
          onRequestRefund={() => setShowRefundDialog(true)}
          onUpgrade={() => {
            // The only real upgrade path today is Pro -> Premium (Premium
            // has no higher tier — the button itself is hidden then).
            // Defaulting to 'pro' for an already-active Pro subscriber
            // would just fail the backend's own tier check.
            if (subscription?.status === 'active' && user?.plan_status === 'pro') {
              setUpgradePlan('premium');
            }
            setShowUpgrade(true);
          }}
          onManageAddons={() => setShowAddons(true)}
        />
        <UsageSummaryView usage={usage} isLoading={usageLoading} />
      </div>

      {/* Upgrade dialog */}
      <Dialog open={showUpgrade} onOpenChange={(open) => { setShowUpgrade(open); if (!open) setExtraMailboxes(0); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Upgrade your plan</DialogTitle>
            <DialogDescription>
              Choose a plan and billing cycle. You&apos;ll be redirected to complete payment securely.
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

            {/* Extra mailboxes add-on */}
            {mailboxAddon && (
              <div className="flex items-center justify-between rounded-lg border px-4 py-2.5">
                <div>
                  <p className="text-sm font-medium">Extra mailboxes</p>
                  <p className="text-xs text-muted-foreground">
                    {mailboxAddon.symbol}{mailboxAddon.amount}/mo each, added to your plan
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-7 w-7"
                    disabled={extraMailboxes <= 0}
                    onClick={() => setExtraMailboxes(n => Math.max(0, n - 1))}
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </Button>
                  <span className="w-4 text-center text-sm font-semibold tabular-nums">{extraMailboxes}</span>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setExtraMailboxes(n => Math.min(100, n + 1))}
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            )}

            {/* Price summary */}
            {selectedPlan && (
              <div className="rounded-xl border bg-muted/40 px-4 py-3 space-y-1">
                <div className="flex items-baseline justify-between">
                  <p className="text-sm text-muted-foreground">
                    {selectedPlan.name} · {upgradeCycle}
                    {extraMailboxes > 0 && ` + ${extraMailboxes} mailbox${extraMailboxes > 1 ? 'es' : ''}`}
                  </p>
                  <p className="font-bold text-lg">
                    {currencySymbol}{price.toLocaleString()}
                    <span className="text-sm font-normal text-muted-foreground">
                      /{upgradeCycle === 'monthly' ? 'mo' : 'yr'}
                    </span>
                  </p>
                </div>
                {addonTotal > 0 && (
                  <p className="text-xs text-muted-foreground text-right">
                    {currencySymbol}{planPrice.toLocaleString()} plan + {currencySymbol}{addonTotal.toLocaleString()} mailboxes
                  </p>
                )}
              </div>
            )}

            <p className="text-xs text-muted-foreground">
              Payment is processed securely via {upgradeCurrency === 'ngn' ? 'Flutterwave' : 'our payment partner'}.
              You can cancel anytime from this page.
            </p>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowUpgrade(false)} disabled={isUpgradeSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleUpgradeSubmit} disabled={isUpgradeSubmitting} className="gap-1.5">
              {isUpgradeSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Continue to payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manage add-ons dialog */}
      <Dialog open={showAddons} onOpenChange={setShowAddons}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add-ons</DialogTitle>
            <DialogDescription>
              Buy more mailboxes or storage without changing your plan.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-2">
            {addonsLoading ? (
              <div className="h-24 flex items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                {/* Buy more mailboxes */}
                {mailboxAddon && (
                  <div className="flex items-center justify-between rounded-lg border px-4 py-2.5">
                    <div>
                      <p className="text-sm font-medium">Extra mailboxes</p>
                      <p className="text-xs text-muted-foreground">
                        {mailboxAddon.symbol}{mailboxAddon.amount}/mo each
                        {(addonsData?.extra_mailboxes ?? 0) > 0 && ` · ${addonsData?.extra_mailboxes} active`}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Button
                        type="button" variant="outline" size="icon" className="h-7 w-7"
                        disabled={buyMailboxQty <= 1}
                        onClick={() => setBuyMailboxQty(n => Math.max(1, n - 1))}
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </Button>
                      <span className="w-4 text-center text-sm font-semibold tabular-nums">{buyMailboxQty}</span>
                      <Button
                        type="button" variant="outline" size="icon" className="h-7 w-7"
                        onClick={() => setBuyMailboxQty(n => Math.min(100, n + 1))}
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        disabled={purchaseAddonMutation.isPending}
                        onClick={() => handlePurchaseAddon('extra_mailbox', buyMailboxQty)}
                        className="gap-1.5"
                      >
                        {purchaseAddonMutation.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                        Buy
                      </Button>
                    </div>
                  </div>
                )}

                {/* Buy more storage */}
                {storageAddon && (
                  <div className="flex items-center justify-between rounded-lg border px-4 py-2.5">
                    <div>
                      <p className="text-sm font-medium">Extra storage</p>
                      <p className="text-xs text-muted-foreground">
                        {storageAddon.symbol}{storageAddon.amount}/mo each (10GB)
                        {(addonsData?.extra_storage_gb ?? 0) > 0 && ` · +${addonsData?.extra_storage_gb}GB active`}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Button
                        type="button" variant="outline" size="icon" className="h-7 w-7"
                        disabled={buyStorageQty <= 1}
                        onClick={() => setBuyStorageQty(n => Math.max(1, n - 1))}
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </Button>
                      <span className="w-4 text-center text-sm font-semibold tabular-nums">{buyStorageQty}</span>
                      <Button
                        type="button" variant="outline" size="icon" className="h-7 w-7"
                        onClick={() => setBuyStorageQty(n => Math.min(100, n + 1))}
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        disabled={purchaseAddonMutation.isPending}
                        onClick={() => handlePurchaseAddon('extra_storage', buyStorageQty)}
                        className="gap-1.5"
                      >
                        {purchaseAddonMutation.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                        Buy
                      </Button>
                    </div>
                  </div>
                )}

                {/* Current add-on purchases (Bachs only — Paddle merges add-ons
                    into a single quantity with no per-purchase breakdown) */}
                {addonsData && addonsData.addons.length > 0 && (
                  <div className="space-y-2">
                    <Label>Your add-ons</Label>
                    {addonsData.addons.map((a) => (
                      <div key={a.payment_method_id} className="flex items-center justify-between rounded-lg border px-4 py-2.5 text-sm">
                        <div className="flex items-center gap-2">
                          {a.addon_type === 'extra_mailbox' ? (
                            <Mailbox className="h-3.5 w-3.5 text-muted-foreground" />
                          ) : (
                            <HardDrive className="h-3.5 w-3.5 text-muted-foreground" />
                          )}
                          <span>
                            {a.quantity}x {a.addon_type === 'extra_mailbox' ? 'mailbox' : 'storage'}
                            {a.quantity > 1 ? 'es' : ''}
                          </span>
                          <span className={cn(
                            'inline-flex items-center px-2 py-0.5 rounded-full text-xs border font-medium',
                            a.status === 'active' ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                              : a.status === 'cancelled' ? 'bg-gray-100 text-gray-600 border-gray-200'
                              : 'bg-amber-100 text-amber-700 border-amber-200',
                          )}>
                            {a.status === 'pending_payment' ? 'pending' : a.status}
                          </span>
                        </div>
                        {a.status !== 'cancelled' && (
                          <Button
                            variant="ghost" size="icon" className="h-6 w-6"
                            disabled={cancelAddonMutation.isPending}
                            onClick={() => handleCancelAddon(a.payment_method_id)}
                          >
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddons(false)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel confirmation */}
      <ConfirmDialog
        open={confirmCancel}
        title="Cancel subscription?"
        description="You'll lose access to paid features at the end of your billing period. You can reactivate any time."
        confirmLabel="Cancel subscription"
        cancelLabel="Keep plan"
        variant="warning"
        onConfirm={handleCancel}
        onCancel={() => setConfirmCancel(false)}
      />

      {/* Refund request dialog */}
      <Dialog open={showRefundDialog} onOpenChange={setShowRefundDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Request a refund</DialogTitle>
            <DialogDescription>
              Refund requests are reviewed within 3–5 business days. You&apos;ll receive an email when your request is processed.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Reason for refund</Label>
              <Select value={refundReason} onValueChange={(v) => setRefundReason(v as RefundReason)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {REFUND_REASONS.map((r) => (
                    <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Additional details <span className="text-muted-foreground text-xs">(optional)</span></Label>
              <Textarea
                placeholder="Tell us more about the issue to help us process your request faster…"
                value={refundDetail}
                onChange={(e) => setRefundDetail(e.target.value)}
                rows={3}
                maxLength={500}
              />
              {refundDetail.length > 400 && (
                <p className="text-xs text-muted-foreground text-right">{refundDetail.length}/500</p>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowRefundDialog(false)} disabled={refundMutation.isPending}>
              Cancel
            </Button>
            <Button onClick={handleRefundSubmit} disabled={refundMutation.isPending}>
              {refundMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
