'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserX, Trash2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import type { SenderUnsubscribe, UserEmailAccount } from '@/lib/types/api.types';

interface Props {
  unsubscribes: SenderUnsubscribe[];
  total: number;
  mailboxes: UserEmailAccount[];
  activeMailbox: string;
  onMailboxChange: (email: string) => void;
  isLoading: boolean;
  isDeleting: boolean;
  onDelete: (id: number) => void;
}

export default function UnsubscribesView({
  unsubscribes, total, mailboxes, activeMailbox, onMailboxChange,
  isLoading, isDeleting, onDelete,
}: Props) {
  const fmt = (d: string) => {
    try { return format(parseISO(d), 'MMM d, yyyy'); } catch { return d; }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Unsubscribes</h1>
        <p className="text-muted-foreground mt-1">
          Recipients who opted out of mail from a specific mailbox via the
          one-click unsubscribe link. They won&apos;t receive further mail
          from that mailbox until you remove them here.
        </p>
      </div>

      <div className="max-w-xs space-y-1.5">
        <Select value={activeMailbox} onValueChange={onMailboxChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select mailbox…" />
          </SelectTrigger>
          <SelectContent>
            {mailboxes.map((mb) => (
              <SelectItem key={mb.email_address} value={mb.email_address}>
                {mb.email_address}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {total > 0 ? `${total} unsubscribed` : 'Unsubscribed recipients'}
          </CardTitle>
          <CardDescription>For {activeMailbox || 'the selected mailbox'}.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => <Skeleton key={i} className="h-14 rounded-xl" />)}
            </div>
          ) : unsubscribes.length === 0 ? (
            <div className="py-10 text-center text-muted-foreground">
              <UserX className="h-10 w-10 mx-auto mb-3 opacity-20" />
              <p className="text-sm">No unsubscribes for this mailbox</p>
            </div>
          ) : (
            <div className="space-y-3">
              {unsubscribes.map((u) => (
                <div
                  key={u.id}
                  className="flex items-center justify-between gap-3 p-3 border border-border rounded-xl"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{u.recipient_email}</p>
                    <p className="text-xs text-muted-foreground">Unsubscribed {fmt(u.unsubscribed_at)}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive h-8 w-8 shrink-0"
                    onClick={() => onDelete(u.id)}
                    disabled={isDeleting}
                    title="Remove opt-out (they'll be able to receive mail from this mailbox again)"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
