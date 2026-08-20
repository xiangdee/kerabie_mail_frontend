'use client';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Megaphone, Plus } from 'lucide-react';
import type { Campaign } from '@/lib/types/api.types';

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'outline'> = {
  draft: 'outline',
  sending: 'secondary',
  sent: 'default',
};

interface Props {
  campaigns: Campaign[] | undefined;
  isLoading: boolean;
}

export default function CampaignsListView({ campaigns, isLoading }: Props) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Megaphone className="h-6 w-6" /> Campaigns
          </h1>
          <p className="text-muted-foreground mt-1">Send bulk emails to a contact group or segment.</p>
        </div>
        <Button asChild>
          <Link href="/app/campaigns/new">
            <Plus className="mr-2 h-4 w-4" /> New Campaign
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : !campaigns || campaigns.length === 0 ? (
            <div className="p-10 text-center text-muted-foreground">
              <Megaphone className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>No campaigns yet</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Recipients</TableHead>
                  <TableHead>Steps</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaigns.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">
                      <Link href={`/app/campaigns/${c.id}`} className="hover:underline">
                        {c.name}
                      </Link>
                    </TableCell>
                    <TableCell><Badge variant={STATUS_VARIANT[c.status] ?? 'outline'}>{c.status}</Badge></TableCell>
                    <TableCell>{c.recipient_count}</TableCell>
                    <TableCell>{c.step_count}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
