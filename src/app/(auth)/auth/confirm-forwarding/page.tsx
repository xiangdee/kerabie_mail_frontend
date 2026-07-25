'use client';
import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, Loader2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { mailService } from '@/lib/services/mail.service';

export default function ConfirmForwardingPage() {
  return (
    <Suspense>
      <ConfirmForwardingContent />
    </Suspense>
  );
}

function ConfirmForwardingContent() {
  const params = useSearchParams();
  const token = params.get('token') ?? '';

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError('Missing or invalid confirmation link.');
      setLoading(false);
      return;
    }
    mailService.confirmForwarding(token).then(res => {
      if (res.status === true) {
        setMessage(typeof res.response === 'string' ? res.response : (res.response?.message ?? 'Forwarding confirmed.'));
      } else {
        setError(typeof res.response === 'string' ? res.response : 'This confirmation link is invalid or has expired.');
      }
      setLoading(false);
    });
  }, [token]);

  if (loading) {
    return (
      <div className="space-y-6 text-center">
        <div className="flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground">Confirming forwarding…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 text-center">
        <div className="flex justify-center">
          <div className="rounded-full bg-destructive/10 p-4">
            <XCircle className="h-8 w-8 text-destructive" />
          </div>
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Couldn&apos;t confirm forwarding</h1>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
        <Link href="/">
          <Button className="w-full">Go to Kerabie Mail</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-center">
      <div className="flex justify-center">
        <div className="rounded-full bg-green-100 dark:bg-green-950/40 p-4">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
      </div>
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Forwarding confirmed</h1>
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
      <Link href="/">
        <Button className="w-full">Go to Kerabie Mail</Button>
      </Link>
    </div>
  );
}
