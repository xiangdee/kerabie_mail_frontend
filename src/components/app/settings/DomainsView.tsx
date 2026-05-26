'use client';
import { useState } from 'react';
import { Plus, Trash2, Globe, CheckCircle2, XCircle, Clock, RefreshCw, ChevronDown, ChevronUp, Copy, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import type { Domain, DnsRecord } from '@/lib/types/api.types';

interface DomainsViewProps {
  domains: Domain[];
  isLoading: boolean;
  isAdding: boolean;
  isVerifying: boolean;
  isDeleting: boolean;
  onAdd: (domain: string) => Promise<void>;
  onVerify: (id: number) => Promise<void>;
  onDelete: (id: number) => void;
}

const StatusBadge = ({ status }: { status: Domain['status'] }) => {
  const cfg = {
    pending: { label: 'Pending', icon: Clock, class: 'bg-amber-100 text-amber-700 border-amber-200' },
    verified: { label: 'Verified', icon: CheckCircle2, class: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    failed: { label: 'Failed', icon: XCircle, class: 'bg-red-100 text-red-700 border-red-200' },
  }[status];
  const Icon = cfg.icon;
  return (
    <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border font-medium', cfg.class)}>
      <Icon className="h-3 w-3" />
      {cfg.label}
    </span>
  );
};

const DnsRow = ({ record }: { record: DnsRecord }) => {
  const copy = () => navigator.clipboard.writeText(record.value);
  return (
    <div className="grid grid-cols-[80px_120px_1fr_24px] gap-2 items-center py-2 border-b last:border-0 text-xs">
      <span className="font-mono text-muted-foreground">{record.type}</span>
      <span className="font-mono truncate text-muted-foreground">{record.name}</span>
      <span className="font-mono truncate">{record.value}</span>
      <button onClick={copy} className="text-muted-foreground hover:text-foreground">
        <Copy className="h-3 w-3" />
      </button>
    </div>
  );
};

export function DomainsView({
  domains, isLoading, isAdding, isVerifying, isDeleting,
  onAdd, onVerify, onDelete,
}: DomainsViewProps) {
  const [newDomain, setNewDomain] = useState('');
  const [expanded, setExpanded] = useState<number | null>(null);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDomain.trim()) return;
    await onAdd(newDomain.trim().toLowerCase());
    setNewDomain('');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold">Domains</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Add your custom domains to send and receive email.
        </p>
      </div>

      {/* Add form */}
      <form onSubmit={handleAdd} className="flex gap-2">
        <Input
          value={newDomain}
          onChange={(e) => setNewDomain(e.target.value)}
          placeholder="yourdomain.com"
          className="flex-1"
        />
        <Button type="submit" disabled={isAdding || !newDomain.trim()}>
          {isAdding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          <span className="ml-1.5">Add domain</span>
        </Button>
      </form>

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
        </div>
      ) : domains.length === 0 ? (
        <Card className="p-12 text-center">
          <Globe className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No domains added yet.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {domains.map((d) => (
            <Collapsible
              key={d.id}
              open={expanded === d.id}
              onOpenChange={() => setExpanded(expanded === d.id ? null : d.id)}
            >
              <Card className="overflow-hidden">
                <div className="flex items-center gap-3 p-4">
                  <Globe className="h-5 w-5 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{d.domain}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <StatusBadge status={d.status} />
                      {d.dkim_verified && (
                        <Badge variant="outline" className="text-[10px] h-4 px-1.5">DKIM ✓</Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {d.status !== 'verified' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onVerify(d.id)}
                        disabled={isVerifying}
                        className="h-7 text-xs gap-1"
                      >
                        <RefreshCw className="h-3 w-3" />
                        Verify
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => onDelete(d.id)}
                      disabled={isDeleting}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        {expanded === d.id
                          ? <ChevronUp className="h-4 w-4" />
                          : <ChevronDown className="h-4 w-4" />
                        }
                      </Button>
                    </CollapsibleTrigger>
                  </div>
                </div>
                <CollapsibleContent>
                  {d.dns_records && d.dns_records.length > 0 && (
                    <div className="border-t px-4 py-3">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                        DNS Records
                      </p>
                      <div className="grid grid-cols-[80px_120px_1fr_24px] gap-2 mb-1 text-[10px] font-semibold text-muted-foreground">
                        <span>TYPE</span><span>NAME</span><span>VALUE</span><span />
                      </div>
                      {d.dns_records.map((r, i) => <DnsRow key={i} record={r} />)}
                    </div>
                  )}
                </CollapsibleContent>
              </Card>
            </Collapsible>
          ))}
        </div>
      )}
    </div>
  );
}
