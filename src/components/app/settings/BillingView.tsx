'use client';
import { format, parseISO } from 'date-fns';
import { Zap, Crown, Building2, AlertTriangle, CheckCircle2, Loader2, RotateCcw, Clock, CheckCheck, XCircle, Paperclip, MousePointerClick, BarChart3, Plus, Mailbox, HardDrive, X } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { Subscription } from '@/lib/types/api.types';
import type { RefundRequest, Plan, AddonSummary } from '@/lib/hooks/useBilling';

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

const REFUND_STATUS_CONFIG: Record<string, { label: string; icon: React.ElementType; class: string }> = {
  pending:   { label: 'Pending review', icon: Clock,        class: 'text-amber-600 bg-amber-50 border-amber-200' },
  approved:  { label: 'Approved',       icon: CheckCheck,   class: 'text-blue-600 bg-blue-50 border-blue-200' },
  processed: { label: 'Refunded',       icon: CheckCircle2, class: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  rejected:  { label: 'Rejected',       icon: XCircle,      class: 'text-red-600 bg-red-50 border-red-200' },
  failed:    { label: 'Failed',         icon: AlertTriangle,class: 'text-red-600 bg-red-50 border-red-200' },
};

interface BillingViewProps {
  subscription: Subscription | null | undefined;
  isLoading: boolean;
  isCancelling: boolean;
  isReactivating: boolean;
  planType?: string;
  plans?: Plan[];
  refunds?: RefundRequest[];
  refundsLoading?: boolean;
  /** extra_mailboxes/extra_storage_gb currently on the subscription — shown
   * as a quick summary next to the plan card itself. */
  extraMailboxes?: number;
  extraStorageGb?: number;
  addons?: AddonSummary[];
  addonsLoading?: boolean;
  isCancellingAddon?: boolean;
  onCancel: () => void;
  onReactivate: () => void;
  onRequestRefund: () => void;
  onUpgrade: () => void;
  onManageAddons: () => void;
  onCancelAddon: (paymentMethodId: number) => void;
}

export function BillingView({
  subscription, isLoading, isCancelling, isReactivating,
  planType, plans, refunds, refundsLoading, extraMailboxes, extraStorageGb,
  addons, addonsLoading, isCancellingAddon,
  onCancel, onReactivate, onRequestRefund, onUpgrade, onManageAddons, onCancelAddon,
}: BillingViewProps) {
  const plan = (planType ?? 'free') as keyof typeof PLAN_ICONS;
  const PlanIcon = PLAN_ICONS[plan] ?? Zap;
  const statusCfg = subscription ? STATUS_CONFIG[subscription.status] : null;
  // RevenueCat (App Store/Play Store) — and the legacy apple_pay/google_pay
  // values some older rows may still carry — can't be cancelled/reactivated/
  // refunded through our own endpoints; Apple/Google own that relationship.
  // payment_provider is never cleared once a subscription expires (it's a
  // historical record of how it was originally paid), so this must also
  // require the plan to still actually be paid — otherwise an expired
  // RevenueCat subscription that's already correctly downgraded to free
  // permanently shows "manage on the App Store," with the last live
  // billing period frozen in place, even though there's nothing left to
  // manage there. Confirmed live against a real expired account.
  const isAppStoreManaged = plan !== 'free' && ['revenuecat', 'apple_pay', 'google_pay'].includes(subscription?.payment_provider ?? '');

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
            {subscription && plan !== 'free' && (() => {
              const price = subscription.amount ?? subscription.total_price ?? 0;
              // price=0 on a paid plan_type with auto_renew off means this
              // was admin-comped (see PATCH /admin/users/{id}/subscription),
              // not a real $0 charge — label it as such instead of showing
              // a price that looks like a data error.
              const isComped = price === 0 && subscription.auto_renew === false;
              const cyclePrice = plans?.find((p) => p.id === plan)?.billing_cycles?.[subscription.billing_cycle];

              if (!isComped) {
                return (
                  <p className="text-2xl font-bold">
                    {subscription.currency?.toLowerCase() === 'ngn' ? '₦' : '$'}
                    {price.toLocaleString()}
                    <span className="text-sm font-normal text-muted-foreground">/{subscription.billing_cycle}</span>
                  </p>
                );
              }
              return (
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary">Complimentary</p>
                  {cyclePrice && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {cyclePrice.symbol}{cyclePrice.amount.toLocaleString()}/{subscription.billing_cycle} value
                    </p>
                  )}
                </div>
              );
            })()}
          </div>

          {/* plan !== 'free' — a subscription row's period dates freeze at
              whatever they were when it last renewed and are never cleared
              on downgrade, so an expired/free account would otherwise show
              a stale billing period forever. */}
          {subscription && plan !== 'free' && (
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

          {plan !== 'free' && ((extraMailboxes ?? 0) > 0 || (extraStorageGb ?? 0) > 0) && (
            <div className="flex flex-wrap gap-4 pt-3 border-t text-sm">
              {(extraMailboxes ?? 0) > 0 && (
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Mailbox className="h-3.5 w-3.5" />
                  {extraMailboxes} extra mailbox{extraMailboxes === 1 ? '' : 'es'}
                </div>
              )}
              {(extraStorageGb ?? 0) > 0 && (
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <HardDrive className="h-3.5 w-3.5" />
                  +{extraStorageGb} GB storage
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          {isAppStoreManaged ? (
            <div className="rounded-lg border border-console-border-soft bg-console-hover px-4 py-3 space-y-2">
              <p className="text-[13.5px]">
                This subscription was purchased through the {subscription?.payment_provider === 'apple_pay' ? 'App Store' : subscription?.payment_provider === 'google_pay' ? 'Play Store' : 'App Store or Play Store'}
                {' '}— manage or cancel it from there, not here.
              </p>
              <div className="flex flex-wrap gap-3 pt-1">
                <a
                  href="https://apps.apple.com/account/subscriptions"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-primary hover:underline"
                >
                  Manage on iPhone/iPad →
                </a>
                <a
                  href="https://play.google.com/store/account/subscriptions"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-primary hover:underline"
                >
                  Manage on Android →
                </a>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-3 pt-1">
              {(plan === 'free' || subscription?.status === 'trial'
                || (subscription?.status === 'active' && plan !== 'premium')) && (
                <Button size="sm" onClick={onUpgrade}>
                  <Crown className="mr-1.5 h-3.5 w-3.5" />
                  Upgrade plan
                </Button>
              )}
              {plan !== 'free' && subscription?.status === 'active' && (
                <Button size="sm" variant="outline" onClick={onManageAddons} className="gap-1.5">
                  <Plus className="h-3.5 w-3.5" />
                  Add-ons
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
              {plan !== 'free' && subscription?.status !== 'trial' && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onRequestRefund}
                  className="gap-1.5"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Request refund
                </Button>
              )}
            </div>
          )}
        </Card>
      )}

      {/* Sending features included in this plan */}
      {subscription && !isLoading && (
        <Card className="p-5">
          <p className="text-sm font-medium mb-3">Sending features</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <Paperclip className="h-4 w-4 text-muted-foreground shrink-0" />
              <span>
                {subscription.attachment_size_limit_mb ?? 10}MB attachments
              </span>
            </div>
            <div className={cn('flex items-center gap-2', !subscription.has_click_tracking && 'text-muted-foreground')}>
              <MousePointerClick className="h-4 w-4 shrink-0" />
              <span>
                Click tracking {subscription.has_click_tracking ? '' : '— upgrade to unlock'}
              </span>
            </div>
            <div className={cn('flex items-center gap-2', !subscription.has_heatmaps && 'text-muted-foreground')}>
              <BarChart3 className="h-4 w-4 shrink-0" />
              <span>
                Click heatmaps {subscription.has_heatmaps ? '' : '— upgrade to unlock'}
              </span>
            </div>
          </div>
        </Card>
      )}

      {/* Active add-ons */}
      {subscription && plan !== 'free' && (addonsLoading || (addons && addons.length > 0)) && (
        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium">Active add-ons</p>
            {subscription.status === 'active' && (
              <Button size="sm" variant="outline" onClick={onManageAddons} className="gap-1.5">
                <Plus className="h-3.5 w-3.5" />
                Add more
              </Button>
            )}
          </div>
          <div className="space-y-2">
            {addonsLoading ? (
              <Skeleton className="h-12 w-full rounded-lg" />
            ) : (
              addons!.map((a) => (
                <div key={a.payment_method_id ?? `bundled-${a.addon_type}`} className="flex items-center justify-between rounded-lg border px-4 py-3 text-sm">
                  <div className="flex items-center gap-3">
                    {a.addon_type === 'extra_mailbox' ? (
                      <Mailbox className="h-4 w-4 text-muted-foreground shrink-0" />
                    ) : (
                      <HardDrive className="h-4 w-4 text-muted-foreground shrink-0" />
                    )}
                    <div>
                      <p className="font-medium">
                        {a.quantity}x {a.addon_type === 'extra_mailbox' ? 'Extra mailbox' : 'Extra storage'}
                        {a.quantity > 1 ? 'es' : ''}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {subscription.currency?.toLowerCase() === 'ngn' ? '₦' : '$'}{a.price.toLocaleString()}/mo
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={cn(
                      'inline-flex items-center px-2 py-0.5 rounded-full text-xs border font-medium',
                      a.status === 'active' ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                        : a.status === 'cancelled' ? 'bg-gray-100 text-gray-600 border-gray-200'
                        : a.status === 'bundled' ? 'bg-blue-100 text-blue-700 border-blue-200'
                        : 'bg-amber-100 text-amber-700 border-amber-200',
                    )}>
                      {a.status === 'pending_payment' ? 'Pending' : a.status === 'bundled' ? 'In original plan' : a.status === 'active' ? 'Active' : 'Cancelled'}
                    </span>
                    {a.status !== 'cancelled' && a.status !== 'bundled' && a.payment_method_id != null && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        disabled={isCancellingAddon}
                        onClick={() => onCancelAddon(a.payment_method_id as number)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
          {!addonsLoading && addons?.some(a => a.status === 'bundled') && (
            <p className="text-xs text-muted-foreground mt-3">
              &ldquo;In original plan&rdquo; add-ons were chosen at checkout and can&apos;t be removed
              individually — cancelling your plan removes them too.
            </p>
          )}
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
                3 mailboxes, AI compose, calendar, contacts, read receipts, and more.
              </p>
            </div>
            <Button size="sm" onClick={onUpgrade}>Upgrade</Button>
          </div>
        </Card>
      )}

      {/* Refund history */}
      {refunds && refunds.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold">Refund requests</h3>
          <div className="space-y-2">
            {refundsLoading ? (
              <Skeleton className="h-12 w-full rounded-lg" />
            ) : (
              refunds.map((r) => {
                const cfg = REFUND_STATUS_CONFIG[r.status] ?? REFUND_STATUS_CONFIG.pending;
                const StatusIcon = cfg.icon;
                const currencySymbol = r.currency?.toLowerCase() === 'ngn' ? '₦' : '$';
                return (
                  <div key={r.id} className="flex items-center justify-between rounded-lg border px-4 py-3 text-sm">
                    <div className="flex items-center gap-3">
                      <StatusIcon className={cn('h-4 w-4', cfg.class.split(' ')[0])} />
                      <div>
                        <p className="font-medium capitalize">{r.reason.replace(/_/g, ' ')}</p>
                        <p className="text-xs text-muted-foreground">{fmt(r.requested_at)}</p>
                        {r.admin_note && (
                          <p className="text-xs text-muted-foreground italic mt-0.5">{r.admin_note}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-right">
                      <span className="font-semibold">{currencySymbol}{Number(r.amount_requested).toLocaleString()}</span>
                      <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border font-medium', cfg.class)}>
                        {cfg.label}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      <p className="text-xs text-muted-foreground text-center">
        Cancel anytime · Refund requests are reviewed within 3–5 business days · Payments processed securely
      </p>
    </div>
  );
}
