'use client';
import { useState, type ReactElement } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Copy, Users, DollarSign, Server, Plus,
  Loader2, CheckCircle2, Clock, AlertTriangle,
} from 'lucide-react';
import { format } from 'date-fns';
import type { Partner, HostingMailbox } from '@/lib/types/api.types';

// ── Status badge helpers ───────────────────────────────────────────────────────
function partnerStatusBadge(status: Partner['status']) {
  if (status === 'approved') return <Badge className="bg-emerald-100 text-emerald-700 border-0 dark:bg-emerald-900/30 dark:text-emerald-400">Approved</Badge>;
  if (status === 'suspended') return <Badge variant="destructive">Suspended</Badge>;
  return <Badge variant="secondary">Pending review</Badge>;
}

function hostingStatusBadge(status: HostingMailbox['status']) {
  const map: Record<HostingMailbox['status'], ReactElement> = {
    active: <Badge className="bg-emerald-100 text-emerald-700 border-0 dark:bg-emerald-900/30 dark:text-emerald-400">Active</Badge>,
    trial: <Badge variant="secondary">Trial</Badge>,
    suspended: <Badge variant="destructive">Suspended</Badge>,
    expired: <Badge variant="outline">Expired</Badge>,
  };
  return map[status];
}

// ── Props ─────────────────────────────────────────────────────────────────────
interface Props {
  partner: Partner | null;
  mailboxes: HostingMailbox[];
  isLoading: boolean;
  isApplying: boolean;
  isRequestingTrial: boolean;
  onApply: (data: { payout_method: string; payout_details: Record<string, string> }) => void;
  onRequestTrial: (data: { email_address: string; domain: string; display_name?: string }) => void;
}

export default function PartnerView({
  partner, mailboxes, isLoading, isApplying, isRequestingTrial,
  onApply, onRequestTrial,
}: Props) {
  const [payoutMethod, setPayoutMethod] = useState('bank_transfer');
  const [payoutDetails, setPayoutDetails] = useState('');

  const [trialEmail, setTrialEmail] = useState('');
  const [trialDomain, setTrialDomain] = useState('');
  const [trialName, setTrialName] = useState('');

  const handleApply = () => {
    if (!payoutDetails.trim()) return;
    onApply({
      payout_method: payoutMethod,
      payout_details: { detail: payoutDetails.trim() },
    });
  };

  const handleTrial = () => {
    if (!trialEmail.trim() || !trialDomain.trim()) return;
    onRequestTrial({
      email_address: trialEmail.trim(),
      domain: trialDomain.trim(),
      display_name: trialName.trim() || undefined,
    });
    setTrialEmail('');
    setTrialDomain('');
    setTrialName('');
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-40" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
        <Skeleton className="h-48 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Partner Programme</h1>
        <p className="text-muted-foreground mt-1">
          Earn commissions by referring customers and host managed mailboxes for your clients.
        </p>
      </div>

      {/* Not yet a partner */}
      {!partner && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Apply to become a partner</CardTitle>
            <CardDescription>
              Partners earn a commission on every referral and can provision hosted mailboxes.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>Payout method</Label>
              <Select value={payoutMethod} onValueChange={setPayoutMethod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bank_transfer">Bank transfer</SelectItem>
                  <SelectItem value="paypal">PayPal</SelectItem>
                  <SelectItem value="crypto">Crypto (USDT)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Payout details</Label>
              <Input
                placeholder={
                  payoutMethod === 'bank_transfer'
                    ? 'Account number / IBAN'
                    : payoutMethod === 'paypal'
                    ? 'PayPal email'
                    : 'Wallet address'
                }
                value={payoutDetails}
                onChange={(e) => setPayoutDetails(e.target.value)}
              />
            </div>
            <Button onClick={handleApply} disabled={isApplying || !payoutDetails.trim()}>
              {isApplying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit application
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Partner dashboard */}
      {partner && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{partner.total_referrals}</p>
                    <p className="text-xs text-muted-foreground">Total referrals</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                    <DollarSign className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">${partner.total_earnings_usd.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">Total earnings</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                    <Server className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{mailboxes.length}</p>
                    <p className="text-xs text-muted-foreground">Hosted mailboxes</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Referral code + status */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <CardTitle className="text-base">Your referral code</CardTitle>
                {partnerStatusBadge(partner.status)}
              </div>
              <CardDescription>
                Commission rate: <strong>{(partner.commission_rate * 100).toFixed(0)}%</strong>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 bg-muted rounded-xl px-4 py-3">
                <span className="flex-1 font-mono text-lg font-semibold tracking-widest">
                  {partner.referral_code}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigator.clipboard.writeText(partner.referral_code)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Hosted mailboxes */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <CardTitle className="text-base">Hosted Mailboxes</CardTitle>
                  <CardDescription>Mailboxes you manage on behalf of clients.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Request trial form */}
              <div className="p-4 border border-border rounded-xl space-y-3 bg-muted/20">
                <p className="text-sm font-medium">Provision a trial mailbox</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Input
                    placeholder="user@client.com"
                    value={trialEmail}
                    onChange={(e) => setTrialEmail(e.target.value)}
                  />
                  <Input
                    placeholder="client.com"
                    value={trialDomain}
                    onChange={(e) => setTrialDomain(e.target.value)}
                  />
                  <Input
                    placeholder="Display name (optional)"
                    value={trialName}
                    onChange={(e) => setTrialName(e.target.value)}
                  />
                </div>
                <Button
                  size="sm"
                  onClick={handleTrial}
                  disabled={isRequestingTrial || !trialEmail.trim() || !trialDomain.trim()}
                >
                  {isRequestingTrial ? (
                    <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Plus className="mr-2 h-3.5 w-3.5" />
                  )}
                  Start trial
                </Button>
              </div>

              {/* Mailboxes table */}
              {mailboxes.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  <Server className="h-10 w-10 mx-auto mb-3 opacity-20" />
                  <p className="text-sm">No hosted mailboxes yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {mailboxes.map((mb) => (
                    <div
                      key={mb.id}
                      className="flex items-center gap-3 p-3 border border-border rounded-xl"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{mb.email_address}</p>
                        <p className="text-xs text-muted-foreground">
                          {mb.domain} · ${mb.monthly_rate_usd}/mo
                          {mb.trial_expires_at &&
                            ` · Trial expires ${format(new Date(mb.trial_expires_at), 'PP')}`}
                        </p>
                      </div>
                      {hostingStatusBadge(mb.status)}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
