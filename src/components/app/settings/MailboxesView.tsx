'use client';
import { useState } from 'react';
import { Plus, Trash2, HardDrive, Mail, Eye, EyeOff, Loader2, ToggleLeft, ToggleRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import type { Mailbox } from '@/lib/types/api.types';

interface CreateForm {
  email: string;
  display_name: string;
  password: string;
  quota: string;
}

interface MailboxesViewProps {
  mailboxes: Mailbox[];
  isLoading: boolean;
  isCreating: boolean;
  isDeleting: boolean;
  onCreate: (data: { email: string; display_name: string; password: string; quota?: number }) => Promise<void>;
  onDelete: (email: string) => void;
}

export function MailboxesView({
  mailboxes,
  isLoading,
  isCreating,
  isDeleting,
  onCreate,
  onDelete,
}: MailboxesViewProps) {
  const [open, setOpen] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [form, setForm] = useState<CreateForm>({ email: '', display_name: '', password: '', quota: '10' });

  const set = (k: keyof CreateForm) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onCreate({
      email: form.email,
      display_name: form.display_name,
      password: form.password,
      quota: parseInt(form.quota) * 1024 * 1024 * 1024, // GB → bytes
    });
    setOpen(false);
    setForm({ email: '', display_name: '', password: '', quota: '10' });
  };

  const storagePct = (mb: Mailbox) =>
    mb.quota_bytes > 0 ? Math.round((mb.used_bytes / mb.quota_bytes) * 100) : 0;

  const fmtBytes = (b: number) => {
    if (b >= 1024 ** 3) return `${(b / 1024 ** 3).toFixed(1)} GB`;
    if (b >= 1024 ** 2) return `${(b / 1024 ** 2).toFixed(0)} MB`;
    return `${(b / 1024).toFixed(0)} KB`;
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
                    placeholder="Strong password"
                    required
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
              <div className="space-y-2">
                <Label>Storage quota (GB)</Label>
                <Input
                  value={form.quota}
                  onChange={set('quota')}
                  type="number"
                  min="1"
                  max="100"
                  placeholder="10"
                />
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
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      ) : mailboxes.length === 0 ? (
        <Card className="p-12 text-center">
          <Mail className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No mailboxes yet. Create your first one above.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {mailboxes.map((mb) => {
            const pct = storagePct(mb);
            return (
              <Card key={mb.email} className="p-4 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm truncate">{mb.email}</p>
                    {mb.display_name && (
                      <span className="text-xs text-muted-foreground">({mb.display_name})</span>
                    )}
                    <Badge variant={mb.enabled ? 'default' : 'secondary'} className="ml-auto text-xs">
                      {mb.enabled ? 'Active' : 'Disabled'}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <HardDrive className="h-3 w-3" />
                        {fmtBytes(mb.used_bytes)} / {fmtBytes(mb.quota_bytes)}
                      </span>
                      <span>{pct}%</span>
                    </div>
                    <Progress
                      value={pct}
                      className="h-1.5"
                    />
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive shrink-0"
                  onClick={() => onDelete(mb.email)}
                  disabled={isDeleting}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
