'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Loader2 } from 'lucide-react';
import type { UserEmailAccount } from '@/lib/types/api.types';
import type { CampaignCreateInput } from '@/lib/hooks/useCampaigns';

interface Props {
  mailboxes: UserEmailAccount[];
  isCreating: boolean;
  onCreate: (data: CampaignCreateInput) => void;
}

export default function NewCampaignView({ mailboxes, isCreating, onCreate }: Props) {
  const [name, setName] = useState('');
  const [fromEmail, setFromEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [bodyHtml, setBodyHtml] = useState('');

  useEffect(() => {
    if (mailboxes.length > 0 && !fromEmail) {
      setFromEmail(mailboxes[0].email_address);
    }
  }, [mailboxes, fromEmail]);

  const canCreate = name.trim() && fromEmail && subject.trim() && bodyHtml.trim();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/app/campaigns"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
          <h1 className="text-xl font-bold text-foreground">New Campaign</h1>
          <p className="text-sm text-muted-foreground">You can add drip steps and a recipient segment after creating it.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Content</CardTitle>
          <CardDescription>This becomes step 1 of the sequence.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Spring Sale" />
          </div>
          <div className="space-y-1.5">
            <Label>From</Label>
            <Select value={fromEmail} onValueChange={setFromEmail}>
              <SelectTrigger><SelectValue placeholder="Select mailbox" /></SelectTrigger>
              <SelectContent>
                {mailboxes.map((m) => (
                  <SelectItem key={m.email_address} value={m.email_address}>{m.email_address}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Subject</Label>
            <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject line" />
          </div>
          <div className="space-y-1.5">
            <Label>Body (HTML)</Label>
            <Textarea value={bodyHtml} onChange={(e) => setBodyHtml(e.target.value)} className="min-h-[180px]" placeholder="<p>Hello!</p>" />
          </div>
          <Button
            disabled={!canCreate || isCreating}
            onClick={() => onCreate({ from_email: fromEmail, name, subject, body_html: bodyHtml })}
          >
            {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Draft
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
