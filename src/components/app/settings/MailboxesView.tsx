'use client';
import { useState } from 'react';
import { Plus, Trash2, Mail, Eye, EyeOff, Loader2, ArrowDownToLine, ArrowUpFromLine, BellOff, Pencil, Check, X, AlertTriangle, RotateCw, CloudUpload } from 'lucide-react';
import { ConvertMailboxDialog } from './ConvertMailboxDialog';
import { useAuth } from '@/lib/context/auth.context';
import { useMigrationStatus, useRetryMigration } from '@/lib/hooks/useMailMigration';

/**
 * Background mail import from a converted IMAP mailbox — see
 * useMailImportStatus.ts on mobile for the same rationale: by the time
 * this is running the mailbox has already cut over to connection_type
 * "dns", so it needs a home outside ConvertMailboxDialog (which the user
 * may have already closed).
 */
function MailImportStatus({ emailAddress }: { emailAddress: string }) {
  const { token } = useAuth();
  const { data: migration } = useMigrationStatus(token, emailAddress, true);
  const retryMutation = useRetryMigration(token);

  if (!migration || migration.status === 'completed') return null;

  if (migration.status === 'failed') {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-3 flex items-start gap-2">
        <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium">Mail import needs attention</p>
          <p className="text-xs text-muted-foreground">{migration.error || 'Something went wrong.'}</p>
        </div>
        <Button
          size="sm" variant="outline" className="h-7 text-xs gap-1 shrink-0"
          disabled={retryMutation.isPending}
          onClick={() => retryMutation.mutate(emailAddress)}
        >
          {retryMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RotateCw className="h-3.5 w-3.5" />}
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-primary/30 bg-primary/5 p-3 flex items-center gap-2">
      <CloudUpload className="h-4 w-4 text-primary shrink-0" />
      <p className="text-xs">
        Importing your mail — {migration.current_folder ?? '…'} ({migration.messages_done}/{migration.messages_total || '?'} messages)
      </p>
    </div>
  );
}
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { IMAP_HOST, SMTP_HOST } from '@/lib/constants/links';
import type { UserEmailAccount } from '@/lib/types/api.types';

interface CreateForm {
  email: string;
  display_name: string;
  password: string;
}

interface MailboxesViewProps {
  mailboxes: UserEmailAccount[];
  isLoading: boolean;
  isCreating: boolean;
  onCreate: (data: { email: string; display_name: string; password: string }) => Promise<void>;
  onToggleNoReply: (email: string, isNoReply: boolean) => void;
  togglingNoReplyEmail?: string | null;
  onUpdateSenderName: (id: number, displayName: string) => void;
  savingSenderNameId?: number | null;
  onReactivate: (email: string, password?: string) => Promise<void>;
  reactivatingEmail?: string | null;
}

export function MailboxesView({
  mailboxes,
  isLoading,
  isCreating,
  onCreate,
  onToggleNoReply,
  togglingNoReplyEmail,
  onUpdateSenderName,
  savingSenderNameId,
  onReactivate,
  reactivatingEmail,
}: MailboxesViewProps) {
  const [open, setOpen] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [form, setForm] = useState<CreateForm>({ email: '', display_name: '', password: '' });
  const [editingSenderNameId, setEditingSenderNameId] = useState<number | null>(null);
  const [senderNameDraft, setSenderNameDraft] = useState('');
  const [reactivatePasswordDraft, setReactivatePasswordDraft] = useState<Record<string, string>>({});
  const [convertEmail, setConvertEmail] = useState<string | null>(null);

  const set = (k: keyof CreateForm) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onCreate(form);
    setOpen(false);
    setForm({ email: '', display_name: '', password: '' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Mailboxes</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage email accounts on your domain.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5">
              <Plus className="h-4 w-4" />
              New mailbox
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create mailbox</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label>Email address</Label>
                <Input
                  value={form.email}
                  onChange={set('email')}
                  placeholder="name@yourdomain.com"
                  type="email"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Display name</Label>
                <Input
                  value={form.display_name}
                  onChange={set('display_name')}
                  placeholder="Full Name"
                />
              </div>
              <div className="space-y-2">
                <Label>Password</Label>
                <div className="relative">
                  <Input
                    value={form.password}
                    onChange={set('password')}
                    type={showPw ? 'text' : 'password'}
                    placeholder="Leave blank to auto-generate"
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
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isCreating}>
                  {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      ) : mailboxes.length === 0 ? (
        <Card className="p-12 text-center">
          <Mail className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No mailboxes yet. Create your first one above.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {mailboxes.map((mb) => (
            <Card key={mb.email_address} className="p-4 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-medium text-sm truncate">{mb.email_address}</p>
                  <Badge variant={mb.is_managed ? 'secondary' : 'default'} className="text-xs">
                    {mb.is_managed ? 'Managed' : 'Primary'}
                  </Badge>
                  {mb.is_no_reply && (
                    <Badge variant="outline" className="text-xs gap-1">
                      <BellOff className="h-3 w-3" /> No-reply
                    </Badge>
                  )}
                </div>

                {/* Sender name — shown in the "From" field on outgoing mail */}
                {editingSenderNameId === mb.id ? (
                  <div className="flex items-center gap-1.5">
                    <Input
                      value={senderNameDraft}
                      onChange={(e) => setSenderNameDraft(e.target.value)}
                      placeholder="Sender name"
                      className="h-7 text-xs max-w-[220px]"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') { onUpdateSenderName(mb.id, senderNameDraft); setEditingSenderNameId(null); }
                        if (e.key === 'Escape') setEditingSenderNameId(null);
                      }}
                    />
                    <Button
                      variant="ghost" size="icon" className="h-6 w-6"
                      disabled={savingSenderNameId === mb.id}
                      onClick={() => { onUpdateSenderName(mb.id, senderNameDraft); setEditingSenderNameId(null); }}
                    >
                      {savingSenderNameId === mb.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                    </Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setEditingSenderNameId(null)}>
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground group"
                    onClick={() => { setEditingSenderNameId(mb.id); setSenderNameDraft(mb.display_name ?? ''); }}
                  >
                    <span>Sender name: {mb.display_name || <span className="italic">not set</span>}</span>
                    <Pencil className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                )}

                <div className="flex items-center gap-2 pt-1">
                  <Switch
                    checked={!!mb.is_no_reply}
                    disabled={togglingNoReplyEmail === mb.email_address}
                    onCheckedChange={(checked) => onToggleNoReply(mb.email_address, checked)}
                  />
                  <span className="text-xs text-muted-foreground">
                    Reject incoming mail (no-reply mailbox)
                  </span>
                </div>

                {mb.connection_type === 'dns' && <MailImportStatus emailAddress={mb.email_address} />}

                {mb.connection_type === 'imap' && (
                  <button
                    type="button"
                    onClick={() => setConvertEmail(mb.email_address)}
                    className="w-full flex items-center gap-2 rounded-xl border border-primary/30 bg-primary/5 p-2.5 text-left hover:bg-primary/10 transition-colors"
                  >
                    <CloudUpload className="h-4 w-4 text-primary shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium">This mailbox is connected via IMAP</p>
                      <p className="text-[11px] text-muted-foreground">Connect to Kerabie to enjoy our premium features</p>
                    </div>
                  </button>
                )}

                {mb.is_active === false && (
                  <div className="mt-2 rounded-xl border border-amber-500/30 bg-amber-500/5 p-3 space-y-2">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <p className="text-xs font-medium text-foreground">Mailbox suspended</p>
                        <p className="text-xs text-muted-foreground">{mb.suspended_reason}</p>
                      </div>
                    </div>
                    {mb.can_self_reactivate ? (
                      <div className="flex items-center gap-2 pl-6">
                        {mb.connection_type === 'imap' && (
                          <Input
                            value={reactivatePasswordDraft[mb.email_address] ?? ''}
                            onChange={(e) =>
                              setReactivatePasswordDraft((prev) => ({ ...prev, [mb.email_address]: e.target.value }))
                            }
                            type="password"
                            placeholder="New password (if it changed)"
                            className="h-7 text-xs max-w-[220px]"
                          />
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs gap-1"
                          disabled={reactivatingEmail === mb.email_address}
                          onClick={() => onReactivate(mb.email_address, reactivatePasswordDraft[mb.email_address] || undefined)}
                        >
                          {reactivatingEmail === mb.email_address
                            ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            : <RotateCw className="h-3.5 w-3.5" />}
                          Try again
                        </Button>
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground pl-6">Contact support to have this cleared.</p>
                    )}
                  </div>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground/40 shrink-0 cursor-not-allowed"
                disabled
                title="Deleting mailboxes isn't available yet"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </Card>
          ))}
        </div>
      )}

      {/* IMAP/SMTP reference */}
      <div className="bg-muted/50 border rounded-2xl p-5 text-sm">
        <p className="font-medium mb-3">IMAP / SMTP settings for third-party email clients</p>
        <div className="grid sm:grid-cols-2 gap-4 text-muted-foreground text-xs">
          <div className="flex items-start gap-2.5">
            <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500 shrink-0">
              <ArrowDownToLine className="h-3.5 w-3.5" />
            </div>
            <div className="space-y-1 font-mono">
              <p className="font-semibold text-foreground not-italic font-sans">Incoming (IMAP)</p>
              <p>Server: {IMAP_HOST}</p>
              <p>Port: 993 (SSL/TLS)</p>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 shrink-0">
              <ArrowUpFromLine className="h-3.5 w-3.5" />
            </div>
            <div className="space-y-1 font-mono">
              <p className="font-semibold text-foreground not-italic font-sans">Outgoing (SMTP)</p>
              <p>Server: {SMTP_HOST}</p>
              <p>Port: 587 (STARTTLS)</p>
            </div>
          </div>
        </div>
      </div>

      {convertEmail && (
        <ConvertMailboxDialog
          open={!!convertEmail}
          onOpenChange={(next) => { if (!next) setConvertEmail(null); }}
          emailAddress={convertEmail}
        />
      )}
    </div>
  );
}
