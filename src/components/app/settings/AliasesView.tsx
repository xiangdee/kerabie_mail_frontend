'use client';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, AtSign, Loader2 } from 'lucide-react';
import type { EmailAlias, UserEmailAccount } from '@/lib/types/api.types';

interface Props {
  aliases: EmailAlias[];
  mailboxes: UserEmailAccount[];
  isLoading: boolean;
  isCreating: boolean;
  isDeleting: boolean;
  onCreate: (data: { mailbox: string; alias_address: string }) => void;
  onDelete: (id: number) => void;
}

export default function AliasesView({
  aliases, mailboxes, isLoading, isCreating, isDeleting, onCreate, onDelete,
}: Props) {
  const [mailbox, setMailbox] = useState('');
  const [aliasAddress, setAliasAddress] = useState('');

  const handleCreate = () => {
    if (!mailbox || !aliasAddress.trim()) return;
    onCreate({ mailbox, alias_address: aliasAddress.trim() });
    setAliasAddress('');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Email Aliases</h1>
        <p className="text-muted-foreground mt-1">
          Additional addresses that deliver to one of your mailboxes.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Create Alias</CardTitle>
          <CardDescription>
            Messages sent to the alias land in the destination mailbox.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Deliver to mailbox</Label>
              <Select value={mailbox} onValueChange={setMailbox}>
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
            <div className="space-y-1.5">
              <Label>Alias address</Label>
              <Input
                placeholder="alias@yourdomain.com"
                type="email"
                value={aliasAddress}
                onChange={(e) => setAliasAddress(e.target.value)}
              />
            </div>
          </div>
          <Button
            onClick={handleCreate}
            disabled={isCreating || !mailbox || !aliasAddress.trim()}
          >
            {isCreating
              ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              : <Plus className="mr-2 h-4 w-4" />}
            Add Alias
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Active Aliases</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
            </div>
          ) : aliases.length === 0 ? (
            <div className="py-10 text-center text-muted-foreground">
              <AtSign className="h-10 w-10 mx-auto mb-3 opacity-20" />
              <p className="text-sm">No aliases yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {aliases.map((alias) => (
                <div
                  key={alias.id}
                  className="flex items-center gap-3 p-3 border border-border rounded-xl"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{alias.alias_address}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-xs text-muted-foreground">→ {alias.mailbox}</span>
                      <Badge variant={alias.is_active ? 'default' : 'secondary'} className="text-xs">
                        {alias.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive h-8 w-8 shrink-0"
                    onClick={() => onDelete(alias.id)}
                    disabled={isDeleting}
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
