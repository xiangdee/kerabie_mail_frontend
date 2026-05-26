'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/context/auth.context';
import { useMailboxList } from '@/lib/hooks/useMessages';
import { useAppToast } from '@/components/ui/app-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Send, Key, ExternalLink, Loader2 } from 'lucide-react';
import { apiLink } from '@/lib/constants/links';

interface ApiResponse {
  status: number;
  body: string;
  durationMs: number;
}

export default function ApiConsolePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">API Console</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Test the Kerabie Mail API directly from your dashboard.{' '}
          <Link href="/api-docs" target="_blank" className="text-primary hover:underline inline-flex items-center gap-1">
            Full API docs <ExternalLink className="h-3 w-3" />
          </Link>
        </p>
      </div>

      <Tabs defaultValue="send">
        <TabsList className="grid grid-cols-2 max-w-xs">
          <TabsTrigger value="send">
            <Send className="h-4 w-4 mr-2" />Send test
          </TabsTrigger>
          <TabsTrigger value="raw">
            <Key className="h-4 w-4 mr-2" />Raw request
          </TabsTrigger>
        </TabsList>

        <TabsContent value="send" className="mt-6">
          <SendTestTab />
        </TabsContent>
        <TabsContent value="raw" className="mt-6">
          <RawRequestTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ─── Send test email ──────────────────────────────────────────────────────────

function SendTestTab() {
  const { token } = useAuth();
  const { data: mailboxes = [] } = useMailboxList();
  const { success, error: toastError } = useAppToast();

  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('Test email from Kerabie API');
  const [body, setBody] = useState('<p>Hello! This is a test email sent via the Kerabie Mail API.</p>');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<ApiResponse | null>(null);

  const handleSend = async () => {
    if (!from || !to) return;
    setLoading(true);
    setResponse(null);
    const start = Date.now();

    try {
      const res = await fetch(`${apiLink}/mail/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          from_email: from,
          to: [to],
          subject,
          body_html: body,
        }),
      });

      const text = await res.text();
      setResponse({ status: res.status, body: text, durationMs: Date.now() - start });

      if (res.ok) success('Email sent', { description: `Delivered to ${to}` });
      else toastError('Send failed', { description: `HTTP ${res.status}` });
    } catch (e: any) {
      setResponse({ status: 0, body: e.message, durationMs: Date.now() - start });
      toastError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Send a test email</CardTitle>
          <CardDescription>Send via the API using one of your mailboxes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>From mailbox</Label>
            <Select value={from} onValueChange={setFrom}>
              <SelectTrigger><SelectValue placeholder="Select a mailbox…" /></SelectTrigger>
              <SelectContent>
                {mailboxes.map((m: any) => (
                  <SelectItem key={m.email} value={m.email}>{m.email}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>To</Label>
            <Input
              value={to}
              onChange={e => setTo(e.target.value)}
              placeholder="recipient@example.com"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Subject</Label>
            <Input value={subject} onChange={e => setSubject(e.target.value)} />
          </div>

          <div className="space-y-1.5">
            <Label>Body (HTML)</Label>
            <Textarea
              value={body}
              onChange={e => setBody(e.target.value)}
              rows={5}
              className="font-mono text-sm"
            />
          </div>

          <Button
            onClick={handleSend}
            disabled={loading || !from || !to}
            className="w-full"
          >
            {loading
              ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Sending…</>
              : <><Send className="h-4 w-4 mr-2" />Send</>}
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <Card>
          <CardHeader><CardTitle className="text-base">Request preview</CardTitle></CardHeader>
          <CardContent>
            <pre className="text-xs font-mono bg-muted rounded-lg p-4 overflow-x-auto whitespace-pre-wrap">
{`POST ${apiLink}/mail/send
Authorization: Bearer ${token ? token.slice(0, 20) + '…' : 'YOUR_TOKEN'}
Content-Type: application/json

${JSON.stringify(
  { from_email: from || 'you@domain.com', to: [to || 'recipient@example.com'], subject, body_html: body },
  null, 2
)}`}
            </pre>
          </CardContent>
        </Card>

        {response && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                Response
                <Badge variant={response.status >= 200 && response.status < 300 ? 'default' : 'destructive'}>
                  {response.status || 'Error'}
                </Badge>
                <span className="text-xs text-muted-foreground font-normal">{response.durationMs}ms</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-xs font-mono bg-muted rounded-lg p-4 overflow-x-auto whitespace-pre-wrap">
                {formatJson(response.body)}
              </pre>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

// ─── Raw request builder ──────────────────────────────────────────────────────

function RawRequestTab() {
  const { token } = useAuth();
  const [method, setMethod] = useState('GET');
  const [endpoint, setEndpoint] = useState('/inbox?email=you@domain.com&folder=INBOX');
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<ApiResponse | null>(null);

  const hasBody = ['POST', 'PATCH', 'PUT'].includes(method);

  const handleSend = async () => {
    setLoading(true);
    setResponse(null);
    const start = Date.now();
    try {
      const res = await fetch(`${apiLink}${endpoint}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        ...(hasBody && body ? { body } : {}),
      });
      const text = await res.text();
      setResponse({ status: res.status, body: text, durationMs: Date.now() - start });
    } catch (e: any) {
      setResponse({ status: 0, body: e.message, durationMs: Date.now() - start });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Raw API request</CardTitle>
          <CardDescription>Call any endpoint with your session token</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Select value={method} onValueChange={setMethod}>
              <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
              <SelectContent>
                {['GET', 'POST', 'PATCH', 'DELETE'].map(m => (
                  <SelectItem key={m} value={m}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              value={endpoint}
              onChange={e => setEndpoint(e.target.value)}
              placeholder="/inbox?email=…"
              className="font-mono text-sm"
            />
          </div>

          {hasBody && (
            <div className="space-y-1.5">
              <Label>Request body (JSON)</Label>
              <Textarea
                value={body}
                onChange={e => setBody(e.target.value)}
                rows={8}
                className="font-mono text-sm"
                placeholder='{"key": "value"}'
              />
            </div>
          )}

          <Button onClick={handleSend} disabled={loading} className="w-full">
            {loading
              ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Sending…</>
              : 'Send request'}
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <Card>
          <CardHeader><CardTitle className="text-base">Base URL</CardTitle></CardHeader>
          <CardContent>
            <code className="text-sm bg-muted px-3 py-2 rounded-lg block break-all">{apiLink}</code>
            <p className="text-xs text-muted-foreground mt-3">
              Your session token is included automatically. For external integrations, generate a key in{' '}
              <Link href="/app/settings/api-keys" className="text-primary hover:underline">
                Settings → API Keys
              </Link>.
            </p>
          </CardContent>
        </Card>

        {response && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                Response
                <Badge variant={response.status >= 200 && response.status < 300 ? 'default' : 'destructive'}>
                  {response.status || 'Error'}
                </Badge>
                <span className="text-xs text-muted-foreground font-normal">{response.durationMs}ms</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-xs font-mono bg-muted rounded-lg p-4 overflow-x-auto max-h-96 whitespace-pre-wrap">
                {formatJson(response.body)}
              </pre>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

// ─── utils ───────────────────────────────────────────────────────────────────

function formatJson(raw: string): string {
  try { return JSON.stringify(JSON.parse(raw), null, 2); }
  catch { return raw; }
}
