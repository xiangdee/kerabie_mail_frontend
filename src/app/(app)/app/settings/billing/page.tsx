'use client';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/context/auth.context';
import { useCurrency } from '@/lib/utils/useCurrency';
import {
  useSubscription,
  useCancelSubscription,
  useReactivateSubscription,
  useRequestRefund,
  useMyRefunds,
  useMyAddons,
  usePurchaseAddon,
  useCancelAddon,
  usePlans,
  type RefundReason,
} from '@/lib/hooks/useBilling';
import { useAppToast } from '@/components/ui/app-toast';
import { ConfirmDialog } from '@/components/ui/app-toast';
import { siteUrl } from '@/lib/constants/links';
import { BillingView } from '@/components/app/settings/BillingView';
import UpgradePlanModal from '@/components/app/UpgradePlanModal';
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
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Minus, Plus } from 'lucide-react';

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

  // Upgrade modal state — plan/cycle/mailboxes-count only matter as the
  // modal's *initial* values (it owns its own state after that), used for
  // the Pro->Premium special case and the ?upgrade= URL pre-fill below.
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [upgradeDefaults, setUpgradeDefaults] = useState<{ plan: 'pro' | 'premium'; cycle: 'monthly' | 'yearly'; mailboxes: number }>({ plan: 'pro', cycle: 'monthly', mailboxes: 0 });

  // Add-ons dialog state (for an already-active subscriber buying more
  // mailboxes/storage without changing plan tier — separate from the
  // upgrade dialog's addon stepper, which only applies when creating or
  // changing a plan)
  const [showAddons, setShowAddons] = useState(false);
  const [buyMailboxQty, setBuyMailboxQty] = useState(1);
  const [buyStorageQty, setBuyStorageQty] = useState(1);
  const [confirmCancelAddon, setConfirmCancelAddon] = useState<number | null>(null);

  const { data: subscription, isLoading } = useSubscription(token);
  const { data: usage, isLoading: usageLoading } = useUsage(token);
  const { data: refunds, isLoading: refundsLoading } = useMyRefunds(token);

  // `User` has no `currency` field (see api.types.ts) — this used to read
  // `user.currency`, which was always undefined, so every upgrade
  // unconditionally defaulted to NGN regardless of the visitor. A real,
  // ever-billed subscriber upgrades in the currency they're already billed
  // in; everyone else — no subscription yet, OR still on the free 3-day
  // trial (a Subscription row exists but nothing has ever actually been
  // charged, so its currency is just whatever the registration-time IP
  // lookup guessed, see get_or_create_user) — falls back to the visitor's
  // detected preferred_currency instead. Confirmed live: registration-time
  // IP geolocation resolved a Nigerian visitor to a different country
  // (VPN/proxy), producing a USD trial that then permanently overrode their
  // real NGN preference here even after this file's first currency fix.
  const { currency: detectedCurrency } = useCurrency();
  const hasBillingHistoryCurrency = subscription && subscription.status !== 'trial';
  const defaultCurrency: 'ngn' | 'usd' =
    hasBillingHistoryCurrency && subscription!.currency?.toLowerCase() === 'ngn' ? 'ngn'
    : hasBillingHistoryCurrency && subscription!.currency?.toLowerCase() === 'usd' ? 'usd'
    : detectedCurrency;

  const { data: plansData } = usePlans(defaultCurrency.toUpperCase());

  const cancelMutation = useCancelSubscription(token);
  const reactivateMutation = useReactivateSubscription(token);
  const refundMutation = useRequestRefund(token);

  const { data: addonsData, isLoading: addonsLoading } = useMyAddons(token);
  const purchaseAddonMutation = usePurchaseAddon(token);
  const cancelAddonMutation = useCancelAddon(token);

  // Arriving from a pricing-card CTA (?upgrade=pro&cycle=yearly&mailboxes=1)
  // — either directly (already signed in) or via /auth/register's existing
  // ?redirect= mechanism after a fresh signup. Pre-fill and open the same
  // modal instead of making them re-pick what they already chose.
  useEffect(() => {
    const upgrade = searchParams.get('upgrade');
    if (upgrade !== 'pro' && upgrade !== 'premium') return;
    const cycle = searchParams.get('cycle');
    const mailboxes = parseInt(searchParams.get('mailboxes') ?? '0', 10);

    setUpgradeDefaults({
      plan: upgrade,
      cycle: cycle === 'yearly' ? 'yearly' : 'monthly',
      mailboxes: Number.isFinite(mailboxes) && mailboxes > 0 ? mailboxes : 0,
    });
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

  const handleCancelAddon = async () => {
    if (confirmCancelAddon == null) return;
    try {
      await cancelAddonMutation.mutateAsync(confirmCancelAddon);
      success('Add-on cancelled');
    } catch (err: unknown) {
      const msg = (err as Error)?.message;
      toastError(msg || 'Could not cancel add-on. Please try again.');
    } finally {
      setConfirmCancelAddon(null);
    }
  };

  const mailboxAddon = plansData?.addons?.find(a => a.type === 'extra_mailbox');
  const storageAddon = plansData?.addons?.find(a => a.type === 'extra_storage');

  // A Hosting Partner's auto-provisioned client — billing (plan, cancel,
  // add-ons) is managed by the partner on their behalf, not self-service
  // here (the backend's require_primary_mailbox 403s these actions anyway).
  // Usage is still their own, so that stays visible below.
  if (user?.is_hosting_partner_managed) {
    return (
      <div className="space-y-6">
        <Card className="p-5">
          <h2 className="text-lg font-semibold mb-2">Billing is managed by your provider</h2>
          <p className="text-sm text-muted-foreground">
            This mailbox was set up by your hosting provider, so your plan, billing, and add-ons
            are managed through them, not here. Contact your hosting provider to make changes to
            your subscription.
          </p>
        </Card>
        <UsageSummaryView usage={usage} isLoading={usageLoading} />
      </div>
    );
  }

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
            const plan = (subscription?.status === 'active' && user?.plan_status === 'pro') ? 'premium' : 'pro';
            setUpgradeDefaults({ plan, cycle: 'monthly', mailboxes: 0 });
            setShowUpgrade(true);
          }}
          onManageAddons={() => setShowAddons(true)}
          addons={addonsData?.addons}
          addonsLoading={addonsLoading}
          isCancellingAddon={cancelAddonMutation.isPending}
          onCancelAddon={(paymentMethodId) => setConfirmCancelAddon(paymentMethodId)}
        />
        <UsageSummaryView usage={usage} isLoading={usageLoading} />
      </div>

      {/* Only mounted once actually opened — its internal state initializes
          once from these default* props, so upgradeDefaults must already be
          correct (from the ?upgrade= URL pre-fill or the Pro->Premium
          special case above) by the time it first mounts, not after. */}
      {showUpgrade && (
        <UpgradePlanModal
          open={showUpgrade}
          onClose={() => setShowUpgrade(false)}
          defaultPlan={upgradeDefaults.plan}
          defaultCycle={upgradeDefaults.cycle}
          defaultExtraMailboxes={upgradeDefaults.mailboxes}
        />
      )}

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

      {/* Cancel add-on confirmation */}
      <ConfirmDialog
        open={confirmCancelAddon != null}
        title="Cancel this add-on?"
        description="This stops the recurring charge for it right away."
        confirmLabel="Cancel add-on"
        cancelLabel="Keep it"
        variant="warning"
        onConfirm={handleCancelAddon}
        onCancel={() => setConfirmCancelAddon(null)}
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
