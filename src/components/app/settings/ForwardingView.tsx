'use client';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, ArrowRight, Loader2 } from 'lucide-react';
import type { ForwardingRule, Mailbox } from '@/lib/types/api.types';

interface Props {
  rules: ForwardingRule[];
  mailboxes: Mailbox[];
  isLoading: boolean;
  isCreating: boolean;
  isDeleting: boolean;
  isToggling: boolean;
  onCreate: (data: { mailbox: string; destination: string; keep_copy: boolean }) => void;
  onDelete: (id: number) => void;
  onToggle: (id: number, enabled: boolean) => void;
}

export default function ForwardingView({
  rules, mailboxes, isLoading, isCreating, isDeleting, isToggling,
  onCreate, onDelete, onToggle,
}: Props) {
  const [mailbox, setMailbox] = useState('');
  const [destination, setDestination] = useState('');
  const [keepCopy, setKeepCopy] = useState(true);

  const handleCreate = () => {
    if (!mailbox || !destination.trim()) return;
    onCreate({ mailbox, destination: destination.trim(), keep_copy: keepCopy });
    setDestination('');
    setKeepCopy(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Email Forwarding</h1>
        <p className="text-muted-foreground mt-1">
          Automatically forward incoming mail to another address.
        </p>
      </div>

      {/* Create Rule */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Add Forwarding Rule</CardTitle>
          <CardDescription>New messages will be forwarded instantly.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>From mailbox</Label>
              <Select value={mailbox} onValueChange={setMailbox}>
                <SelectTrigger>
                  <SelectValue placeholder="Select mailbox…" />
                </SelectTrigger>
                <SelectContent>
                  {mailboxes.map((mb) => (
                    <SelectItem key={mb.email} value={mb.email}>
                      {mb.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Forward to</Label>
              <Input
                placeholder="recipient@example.com"
                type="email"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Switch id="keep-copy" checked={keepCopy} onCheckedChange={setKeepCopy} />
            <Label htmlFor="keep-copy" className="cursor-pointer">
              Keep a copy in this mailbox
            </Label>
          </div>
          <Button
            onClick={handleCreate}
            disabled={isCreating || !mailbox || !destination.trim()}
          >
            {isCreating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
            Add Rule
          </Button>
        </CardContent>
      </Card>

      {/* Rules List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Active Rules</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
            </div>
          ) : rules.length === 0 ? (
            <div className="py-10 text-center text-muted-foreground">
              <ArrowRight className="h-10 w-10 mx-auto mb-3 opacity-20" />
              <p className="text-sm">No forwarding rules yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {rules.map((rule) => (
                <div
                  key={rule.id}
                  className="flex items-center gap-3 p-3 border border-border rounded-xl"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium truncate">{rule.mailbox}</span>
                      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <span className="text-sm truncate">{rule.destination}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={rule.enabled ? 'default' : 'secondary'} className="text-xs">
                        {rule.enabled ? 'Active' : 'Paused'}
                      </Badge>
                      {rule.keep_copy && (
                        <span className="text-xs text-muted-foreground">keeps copy</span>
                      )}
                    </div>
                  </div>
                  <Switch
                    checked={rule.enabled}
                    onCheckedChange={(v) => onToggle(rule.id, v)}
                    disabled={isToggling}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive h-8 w-8"
                    onClick={() => onDelete(rule.id)}
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
