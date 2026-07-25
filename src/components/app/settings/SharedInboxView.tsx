'use client';
import { useState } from 'react';
import {
  Users, Plus, Trash2, Crown, Eye, Edit3,
  Loader2, Mail, LogOut, ChevronDown, Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { UserEmailAccount, SharedInboxMember, SharedInboxEntry } from '@/lib/types/api.types';

interface SharedInboxViewProps {
  userEmails: UserEmailAccount[];
  emailsLoading: boolean;
  selectedEmailId: number | null;
  onSelectEmail: (id: number) => void;
  members: SharedInboxMember[];
  membersLoading: boolean;
  myInboxes: SharedInboxEntry[];
  myInboxesLoading: boolean;
  isInviting: boolean;
  isRemoving: boolean;
  isLeaving: boolean;
  onInvite: (data: { invite_email: string; role: string }) => Promise<void>;
  onChangeRole: (memberId: number, role: string) => Promise<void>;
  onRemove: (memberId: number) => void;
  onLeave: (entry: SharedInboxEntry) => void;
  isPremium: boolean;
}

const ROLE_CONFIG = {
  editor: { label: 'Editor', icon: Edit3, color: 'text-blue-600', desc: 'Can read and send emails' },
  viewer: { label: 'Viewer', icon: Eye, color: 'text-slate-500', desc: 'Can read emails only' },
};

export function SharedInboxView({
  userEmails, emailsLoading,
  selectedEmailId, onSelectEmail,
  members, membersLoading,
  myInboxes, myInboxesLoading,
  isInviting, isRemoving, isLeaving,
  onInvite, onChangeRole, onRemove, onLeave,
  isPremium,
}: SharedInboxViewProps) {
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'editor' | 'viewer'>('editor');

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onInvite({ invite_email: inviteEmail, role: inviteRole });
    setInviteOpen(false);
    setInviteEmail('');
    setInviteRole('editor');
  };

  const selectedEmail = userEmails.find(e => e.id === selectedEmailId);

  return (
    <div className="space-y-8">
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div>
        <h2 className="text-xl font-bold">Shared Inboxes</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Invite teammates to access your mailboxes, or see inboxes shared with you.
        </p>
        {!isPremium && (
          <div className="mt-3 flex items-center gap-2 text-sm text-amber-600 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg px-3 py-2.5">
            <Crown className="h-4 w-4 shrink-0" />
            Sharing mailboxes requires a Premium plan.
          </div>
        )}
      </div>

      {/* ── Manage your shared mailboxes ────────────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm">My mailboxes</h3>
          {selectedEmailId && isPremium && (
            <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-1.5">
                  <Plus className="h-4 w-4" />
                  Invite teammate
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Invite to {selectedEmail?.email_address}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleInviteSubmit} className="space-y-4 pt-2">
                  <div className="space-y-2">
                    <Label>Email address</Label>
                    <Input
                      type="email"
                      value={inviteEmail}
                      onChange={e => setInviteEmail(e.target.value)}
                      placeholder="teammate@example.com"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Role</Label>
                    <Select value={inviteRole} onValueChange={v => setInviteRole(v as 'editor' | 'viewer')}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="editor">
                          <span className="font-medium">Editor</span>
                          <span className="text-muted-foreground ml-2 text-xs">Can read and send</span>
                        </SelectItem>
                        <SelectItem value="viewer">
                          <span className="font-medium">Viewer</span>
                          <span className="text-muted-foreground ml-2 text-xs">Read-only access</span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end gap-3 pt-2">
                    <Button type="button" variant="outline" onClick={() => setInviteOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isInviting}>
                      {isInviting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Send invite
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {emailsLoading ? (
          <Skeleton className="h-10 w-full rounded-lg" />
        ) : userEmails.length === 0 ? (
          <Card className="p-8 text-center">
            <Mail className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No email accounts connected.</p>
          </Card>
        ) : (
          <Select
            value={selectedEmailId?.toString() ?? ''}
            onValueChange={v => onSelectEmail(Number(v))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a mailbox to manage…" />
            </SelectTrigger>
            <SelectContent>
              {userEmails.map(ue => (
                <SelectItem key={ue.id} value={ue.id.toString()}>
                  {ue.email_address}
                  {ue.is_managed && (
                    <span className="ml-1.5 text-xs text-muted-foreground">(managed)</span>
                  )}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Member list */}
        {selectedEmailId && (
          <>
            {membersLoading ? (
              <div className="space-y-2">
                {[1, 2].map(i => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
              </div>
            ) : members.length === 0 ? (
              <Card className="p-8 text-center">
                <Users className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  No teammates yet.{isPremium ? ' Invite someone to get started.' : ''}
                </p>
              </Card>
            ) : (
              <div className="space-y-2">
                {members.map(m => {
                  const cfg = ROLE_CONFIG[m.role as keyof typeof ROLE_CONFIG];
                  const RoleIcon = cfg?.icon ?? Eye;
                  return (
                    <Card key={m.id} className="p-4 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center shrink-0 text-sm font-semibold text-muted-foreground">
                        {m.invite_email[0].toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{m.invite_email}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {m.status === 'pending' ? (
                            <span className="flex items-center gap-1 text-xs text-amber-600">
                              <Clock className="h-3 w-3" /> Pending invite
                            </span>
                          ) : (
                            <span className={`flex items-center gap-1 text-xs ${cfg?.color}`}>
                              <RoleIcon className="h-3 w-3" /> {cfg?.label}
                            </span>
                          )}
                        </div>
                      </div>
                      {m.status === 'active' && isPremium && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 gap-1 text-xs">
                              {cfg?.label} <ChevronDown className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onChangeRole(m.id, 'editor')}>
                              <Edit3 className="h-3.5 w-3.5 mr-2" /> Editor
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onChangeRole(m.id, 'viewer')}>
                              <Eye className="h-3.5 w-3.5 mr-2" /> Viewer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive shrink-0"
                        onClick={() => onRemove(m.id)}
                        disabled={isRemoving}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </Card>
                  );
                })}
              </div>
            )}
          </>
        )}
      </section>

      {/* ── Inboxes shared with me ──────────────────────────────────── */}
      <section className="space-y-4">
        <h3 className="font-semibold text-sm">Shared with me</h3>
        {myInboxesLoading ? (
          <div className="space-y-2">
            {[1, 2].map(i => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
          </div>
        ) : myInboxes.length === 0 ? (
          <Card className="p-8 text-center">
            <Users className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              No one has shared a mailbox with you yet.
            </p>
          </Card>
        ) : (
          <div className="space-y-2">
            {myInboxes.map(entry => {
              const cfg = ROLE_CONFIG[entry.role as keyof typeof ROLE_CONFIG];
              const RoleIcon = cfg?.icon ?? Eye;
              return (
                <Card key={entry.user_email_id} className="p-4 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Mail className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{entry.email_address}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-muted-foreground">
                        Owned by {entry.owner_email}
                      </span>
                      <Badge variant="secondary" className={`text-xs gap-1 ${cfg?.color}`}>
                        <RoleIcon className="h-2.5 w-2.5" />
                        {cfg?.label}
                      </Badge>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1.5 text-muted-foreground hover:text-destructive shrink-0"
                    onClick={() => onLeave(entry)}
                    disabled={isLeaving}
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    Leave
                  </Button>
                </Card>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
