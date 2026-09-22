'use client';
import { useState, type ReactElement } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  Copy, Users, DollarSign, Server, Plus, Eye, EyeOff, Dices, Building2,
  Loader2,
} from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '@/lib/context/auth.context';
import { useAppToast } from '@/components/ui/app-toast';
import type { Partner, HostingMailbox, LapseAction } from '@/lib/types/api.types';
import {
  useHostingClients, useCreateHostingClient, useUpdateHostingClient,
  useHostingDomains, useAddHostingDomain,
  useUpdateHostingSettings, useHostingPlans, useProvisionHostingMailbox,
} from '@/lib/hooks/usePartner';

// ── Status badge helpers ───────────────────────────────────────────────────────
function partnerStatusBadge(status: Partner['status']) {
  if (status === 'active') return <Badge className="bg-emerald-100 text-emerald-700 border-0 dark:bg-emerald-900/30 dark:text-emerald-400">Approved</Badge>;
  if (status === 'suspended') return <Badge variant="destructive">Suspended</Badge>;
  if (status === 'rejected') return <Badge variant="destructive">Rejected</Badge>;
  return <Badge variant="secondary">Pending review</Badge>;
}

function hostingStatusBadge(status: HostingMailbox['status']) {
  const map: Record<HostingMailbox['status'], ReactElement> = {
    active: <Badge className="bg-emerald-100 text-emerald-700 border-0 dark:bg-emerald-900/30 dark:text-emerald-400">Active</Badge>,
    trial: <Badge variant="secondary">Trial</Badge>,
    suspended: <Badge variant="destructive">Suspended</Badge>,
    expired: <Badge variant="outline">Expired</Badge>,
    pending_payment: <Badge variant="secondary">Pending payment</Badge>,
  };
  return map[status];
}

function generatePassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
  let out = '';
  for (let i = 0; i < 16; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

// ── Client lapse policy ─────────────────────────────────────────────────────────
function ClientLapsePolicyCard({ partner }: { partner: Partner }) {
  const { token } = useAuth();
  const { success, error: toastError } = useAppToast();
  const updateSettings = useUpdateHostingSettings(token);

  const handleChange = async (value: LapseAction) => {
    const res = await updateSettings.mutateAsync(value);
    if (res.status === true) {
      success('Default policy updated');
    } else {
      toastError('Could not update policy', { description: res.response?.detail });
    }
  };

  const current: LapseAction = partner.default_client_lapse_action ?? 'suspend';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Client lapse policy</CardTitle>
        <CardDescription>
          What happens to a client&apos;s mailbox when their trial/term ends or a payment fails.
          Override this for individual clients in the list below.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Select value={current} onValueChange={(v) => handleChange(v as LapseAction)} disabled={updateSettings.isPending}>
          <SelectTrigger className="w-full sm:w-64">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="suspend">Suspend the mailbox</SelectItem>
            <SelectItem value="downgrade_free">Downgrade to Free</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground mt-2">
          {current === 'downgrade_free'
            ? 'Lapsed mailboxes stay reachable on the Free plan instead of being locked out.'
            : 'Lapsed mailboxes are locked out entirely until renewed.'}
        </p>
      </CardContent>
    </Card>
  );
}

// ── Clients ──────────────────────────────────────────────────────────────────
function ClientsCard() {
  const { token } = useAuth();
  const { success, error: toastError } = useAppToast();
  const { data: clients = [], isLoading } = useHostingClients(token);
  const { data: domains = [] } = useHostingDomains(token);
  const createClient = useCreateHostingClient(token);
  const updateClient = useUpdateHostingClient(token);
  const addDomain = useAddHostingDomain(token);

  const [newClientOpen, setNewClientOpen] = useState(false);
  const [newClientName, setNewClientName] = useState('');

  const [addDomainOpen, setAddDomainOpen] = useState(false);
  const [domainName, setDomainName] = useState('');
  const [domainClientId, setDomainClientId] = useState('__new__');

  const handleCreateClient = async () => {
    if (!newClientName.trim()) return;
    const res = await createClient.mutateAsync(newClientName.trim());
    if (res.status === true) {
      success('Client added');
      setNewClientOpen(false);
      setNewClientName('');
    } else {
      toastError('Could not add client', { description: res.response?.detail });
    }
  };

  const handleAddDomain = async () => {
    if (!domainName.trim()) return;
    const res = await addDomain.mutateAsync({
      domain_name: domainName.trim(),
      client_id: domainClientId === '__new__' ? undefined : Number(domainClientId),
    });
    if (res.status === true) {
      success('Domain added', { description: 'Verify its DNS records to start provisioning mailboxes on it.' });
      setAddDomainOpen(false);
      setDomainName('');
      setDomainClientId('__new__');
    } else {
      toastError('Could not add domain', { description: res.response?.detail });
    }
  };

  const handleOverrideChange = async (clientId: number, value: string) => {
    const res = await updateClient.mutateAsync({
      id: clientId,
      lapse_action_override: value === '__inherit__' ? null : (value as LapseAction),
    });
    if (res.status !== true) {
      toastError('Could not update override', { description: res.response?.detail });
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <CardTitle className="text-base">Clients</CardTitle>
            <CardDescription>Your customers — each can own several domains and mailboxes.</CardDescription>
          </div>
          <div className="flex gap-2">
            <Dialog open={addDomainOpen} onOpenChange={setAddDomainOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="gap-1.5">
                  <Plus className="h-3.5 w-3.5" /> Add domain
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader><DialogTitle>Add a client domain</DialogTitle></DialogHeader>
                <div className="space-y-4 pt-2">
                  <div className="space-y-2">
                    <Label>Domain</Label>
                    <Input value={domainName} onChange={(e) => setDomainName(e.target.value)} placeholder="client.com" />
                  </div>
                  <div className="space-y-2">
                    <Label>Client</Label>
                    <Select value={domainClientId} onValueChange={setDomainClientId}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__new__">New client (named after the domain)</SelectItem>
                        {clients.map((c) => (
                          <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end gap-3 pt-2">
                    <Button type="button" variant="outline" onClick={() => setAddDomainOpen(false)}>Cancel</Button>
                    <Button onClick={handleAddDomain} disabled={addDomain.isPending || !domainName.trim()}>
                      {addDomain.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Add
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            <Dialog open={newClientOpen} onOpenChange={setNewClientOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-1.5">
                  <Plus className="h-3.5 w-3.5" /> New client
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-sm">
                <DialogHeader><DialogTitle>New client</DialogTitle></DialogHeader>
                <div className="space-y-4 pt-2">
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input value={newClientName} onChange={(e) => setNewClientName(e.target.value)} placeholder="Acme Corp" />
                  </div>
                  <div className="flex justify-end gap-3 pt-2">
                    <Button type="button" variant="outline" onClick={() => setNewClientOpen(false)}>Cancel</Button>
                    <Button onClick={handleCreateClient} disabled={createClient.isPending || !newClientName.trim()}>
                      {createClient.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Create
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-24 rounded-xl" />
        ) : clients.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            <Building2 className="h-10 w-10 mx-auto mb-3 opacity-20" />
            <p className="text-sm">No clients yet — add a domain to create your first one.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {clients.map((c) => (
              <div key={c.id} className="flex items-center gap-3 p-3 border border-border rounded-xl flex-wrap">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{c.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {c.domain_count} domain{c.domain_count === 1 ? '' : 's'} · {c.mailbox_count} mailbox{c.mailbox_count === 1 ? '' : 'es'}
                  </p>
                </div>
                <Select value={c.lapse_action_override ?? '__inherit__'} onValueChange={(v) => handleOverrideChange(c.id, v)}>
                  <SelectTrigger className="w-[190px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__inherit__">Inherit default</SelectItem>
                    <SelectItem value="suspend">Suspend</SelectItem>
                    <SelectItem value="downgrade_free">Downgrade to Free</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ── Provision a mailbox ──────────────────────────────────────────────────────
function ProvisionMailboxDialog() {
  const { token } = useAuth();
  const { success, error: toastError } = useAppToast();
  const { data: domains = [] } = useHostingDomains(token);
  const { data: clients = [] } = useHostingClients(token);
  const { data: plans = [] } = useHostingPlans(token);
  const provision = useProvisionHostingMailbox(token);

  const [open, setOpen] = useState(false);
  const [domainId, setDomainId] = useState('');
  const [localPart, setLocalPart] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [planId, setPlanId] = useState('');

  const verifiedDomains = domains.filter((d) => d.is_verified);
  const clientNameFor = (clientId: number | null) => clients.find((c) => c.id === clientId)?.name;

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (next) {
      if (!domainId && verifiedDomains[0]) setDomainId(String(verifiedDomains[0].id));
      if (!planId && plans[0]) setPlanId(plans[0].plan_id);
      if (!password) setPassword(generatePassword());
    }
  };

  const resetForm = () => {
    setLocalPart('');
    setDisplayName('');
    setPassword('');
  };

  const handleSubmit = async () => {
    if (!domainId || !localPart.trim() || !password || !planId) return;
    const res = await provision.mutateAsync({
      domain_id: Number(domainId),
      local_part: localPart.trim(),
      display_name: displayName.trim() || undefined,
      password,
      plan_id: planId,
    });
    if (res.status === true) {
      success('Mailbox provisioned', { description: `Password: ${password} — copy it now, it won't be shown again.` });
      setOpen(false);
      resetForm();
    } else {
      toastError('Could not provision mailbox', { description: res.response?.detail });
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1.5">
          <Plus className="h-3.5 w-3.5" /> New mailbox
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>Provision a mailbox</DialogTitle></DialogHeader>
        <div className="space-y-4 pt-2">
          {verifiedDomains.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Add and verify a client domain first (under Clients above) before provisioning a mailbox.
            </p>
          ) : (
            <>
              <div className="space-y-2">
                <Label>Email address</Label>
                <div className="flex gap-2 items-center">
                  <Input value={localPart} onChange={(e) => setLocalPart(e.target.value)} placeholder="sales" className="flex-1" />
                  <span className="text-muted-foreground">@</span>
                  <Select value={domainId} onValueChange={setDomainId}>
                    <SelectTrigger className="w-[220px]"><SelectValue placeholder="Domain" /></SelectTrigger>
                    <SelectContent>
                      {verifiedDomains.map((d) => (
                        <SelectItem key={d.id} value={String(d.id)}>
                          {d.domain_name}{clientNameFor(d.client_id) ? ` (${clientNameFor(d.client_id)})` : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Display name</Label>
                <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Full Name" />
              </div>
              <div className="space-y-2">
                <Label>Plan</Label>
                <Select value={planId} onValueChange={setPlanId}>
                  <SelectTrigger><SelectValue placeholder="Plan" /></SelectTrigger>
                  <SelectContent>
                    {plans.map((p) => (
                      <SelectItem key={p.plan_id} value={p.plan_id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Password</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      type={showPw ? 'text' : 'password'}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <Button type="button" variant="outline" size="icon" onClick={() => { setPassword(generatePassword()); setShowPw(true); }} title="Generate a new password">
                    <Dices className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Share this with your client — it&apos;s also their webmail/mobile login. It&apos;s only shown once.
                </p>
              </div>
            </>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={provision.isPending || verifiedDomains.length === 0 || !localPart.trim() || !password || !planId}>
              {provision.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Provision
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Props ─────────────────────────────────────────────────────────────────────
interface Props {
  partner: Partner | null;
  mailboxes: HostingMailbox[];
  isLoading: boolean;
  isApplying: boolean;
  onApply: (data: { payout_method: string; payout_details: Record<string, string> }) => void;
}

export default function PartnerView({
  partner, mailboxes, isLoading, isApplying,
  onApply,
}: Props) {
  const [payoutMethod, setPayoutMethod] = useState('bank_transfer');
  const [payoutDetails, setPayoutDetails] = useState('');

  const handleApply = () => {
    if (!payoutDetails.trim()) return;
    onApply({
      payout_method: payoutMethod,
      payout_details: { detail: payoutDetails.trim() },
    });
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

          {partner.hosting_status !== 'none' && (
            <>
              <ClientLapsePolicyCard partner={partner} />
              <ClientsCard />
            </>
          )}

          {/* Hosted mailboxes */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <CardTitle className="text-base">Hosted Mailboxes</CardTitle>
                  <CardDescription>Mailboxes you manage on behalf of clients.</CardDescription>
                </div>
                {partner.hosting_status !== 'none' && <ProvisionMailboxDialog />}
              </div>
            </CardHeader>
            <CardContent>
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
