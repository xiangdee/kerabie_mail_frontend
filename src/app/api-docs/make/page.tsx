import type { Metadata } from 'next';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Make (Integromat) - API Docs',
  description: 'Connect Kerabie Mail to Make: receive events with the Webhooks app, and send mail with the HTTP app.',
};

export default function MakeDocsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto max-w-6xl px-4 py-12 flex gap-10">
        <aside className="hidden lg:block w-56 shrink-0">
          <div className="sticky top-8 space-y-1 text-sm">
            {[
              ['Status', 'status'], ['Receiving events', 'receiving'],
              ['Sending email', 'sending'], ['Authentication', 'auth'],
              ['See also', 'see-also'],
            ].map(([l, id]) => (
              <a key={id} href={`#${id}`} className="block px-3 py-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">{l}</a>
            ))}
            <div className="pt-4 border-t space-y-1">
              <Link href="/api-docs" className="block px-3 py-1.5 text-primary hover:underline text-sm">&larr; API Reference</Link>
              <Link href="/api-docs/webhooks" className="block px-3 py-1.5 text-primary hover:underline text-sm">Webhooks &rarr;</Link>
            </div>
          </div>
        </aside>

        <main className="flex-1 min-w-0 space-y-16 text-[15px]">
          <div>
            <p className="text-sm text-muted-foreground mb-2"><Link href="/api-docs" className="hover:underline">API Docs</Link> / Make</p>
            <h1 className="text-4xl font-bold mb-3">Make (Integromat)</h1>
            <p className="text-muted-foreground text-lg">
              Trigger Make scenarios from Kerabie Mail events, and send email from a scenario step, using Make&apos;s
              own built-in modules.
            </p>
          </div>

          {/* Status */}
          <section id="status" className="scroll-mt-8">
            <h2 className="text-2xl font-bold mb-4 pb-3 border-b">Status</h2>
            <p className="text-muted-foreground">
              There is no custom Kerabie Mail app in Make&apos;s app directory, and none is currently planned:
              Make&apos;s app-building tooling requires its own hosted web IDE under a paid developer account, which
              is out of scope for now. What&apos;s below, using Make&apos;s general-purpose <strong>Webhooks</strong> and{' '}
              <strong>HTTP</strong> apps, is the actual, current way to use Kerabie Mail from Make, not a placeholder
              for something coming later.
            </p>
          </section>

          {/* Receiving */}
          <section id="receiving" className="scroll-mt-8">
            <h2 className="text-2xl font-bold mb-4 pb-3 border-b">Receiving events</h2>
            <ol className="list-decimal list-inside text-muted-foreground space-y-2 mb-4 text-sm">
              <li>In a Make scenario, add <strong>Webhooks &rarr; Custom webhook</strong> as the first module and create a new webhook. Make gives you a unique URL.</li>
              <li>
                Register that URL as a Kerabie Mail webhook endpoint, from <strong>Settings &rarr; Webhooks</strong> in the console,
                or via the API:
              </li>
            </ol>
            <pre className="bg-muted rounded-xl p-4 text-sm font-mono overflow-x-auto">{`curl -X POST https://api.kerabie.email/webhooks \\
  -H "X-API-Key: $API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
        "url": "https://hook.us1.make.com/xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
        "events": ["email.received"]
      }'`}</pre>
            <p className="text-muted-foreground text-sm mt-3">
              Pick any event from the <Link href="/api-docs/webhooks#events" className="text-primary hover:underline">events table</Link>{' '}
              (mail delivered, sent, bounced, opened, clicked, and more). The custom webhook module&apos;s determined data
              structure will match the <Link href="/api-docs/webhooks#payload" className="text-primary hover:underline">payload envelope</Link>{' '}
              documented for webhooks: <code className="bg-muted px-1 rounded text-xs">event</code>,{' '}
              <code className="bg-muted px-1 rounded text-xs">timestamp</code>, <code className="bg-muted px-1 rounded text-xs">webhook_id</code>,{' '}
              and an event-specific <code className="bg-muted px-1 rounded text-xs">data</code> object.
            </p>
            <p className="text-muted-foreground text-sm mt-3">
              To verify the <code className="bg-muted px-1 rounded text-xs">X-Kerabie-Signature</code> header, add a{' '}
              <strong>Tools &rarr; Set variable</strong> / custom function step computing the same HMAC-SHA256 scheme
              described in the <Link href="/api-docs/webhooks#signature" className="text-primary hover:underline">signature verification guide</Link>,
              and route the scenario to stop if it doesn&apos;t match.
            </p>
          </section>

          {/* Sending */}
          <section id="sending" className="scroll-mt-8">
            <h2 className="text-2xl font-bold mb-4 pb-3 border-b">Sending email</h2>
            <p className="text-muted-foreground mb-3 text-sm">Add an <strong>HTTP &rarr; Make a request</strong> module configured as:</p>
            <pre className="bg-muted rounded-xl p-4 text-sm font-mono overflow-x-auto">{`URL:    https://api.kerabie.email/mail/send
Method: POST
Headers:
  X-API-Key: YOUR_API_KEY
  Content-Type: application/json
Body type: Raw / JSON (application/json)
Request content:
{
  "from_email": "support@yourdomain.com",
  "to": ["{{customer_email}}"],
  "subject": "{{subject}}",
  "body_html": "{{html_body}}"
}`}</pre>
            <p className="text-muted-foreground text-sm mt-3">
              Map values from any earlier module in the scenario. See the full field list, including templates,
              scheduling, and attachments, in the{' '}
              <Link href="/api-docs#send" className="text-primary hover:underline">Send email API reference</Link>.
            </p>
          </section>

          {/* Auth */}
          <section id="auth" className="scroll-mt-8">
            <h2 className="text-2xl font-bold mb-4 pb-3 border-b">Authentication</h2>
            <p className="text-muted-foreground">
              Create an API key under <strong>Settings &rarr; API Keys</strong> with the{' '}
              <code className="bg-muted px-1 rounded text-xs">send</code> scope for the HTTP module, and{' '}
              <code className="bg-muted px-1 rounded text-xs">webhooks</code> if you&apos;re also managing the endpoint
              from the API rather than the console. Pass it as the{' '}
              <code className="bg-muted px-1 rounded text-xs">X-API-Key</code> header on every request.
            </p>
          </section>

          {/* See also */}
          <section id="see-also" className="scroll-mt-8">
            <h2 className="text-2xl font-bold mb-4 pb-3 border-b">See also</h2>
            <div className="grid sm:grid-cols-2 gap-3 text-sm">
              <Link href="/api-docs/webhooks" className="border rounded-xl p-4 hover:bg-muted transition-colors">
                <p className="font-semibold mb-1">Webhooks</p>
                <p className="text-muted-foreground text-xs">Full event list, payload shapes, and signature verification.</p>
              </Link>
              <Link href="/api-docs/zapier" className="border rounded-xl p-4 hover:bg-muted transition-colors">
                <p className="font-semibold mb-1">Zapier</p>
                <p className="text-muted-foreground text-xs">Official app and webhook-based fallback.</p>
              </Link>
              <Link href="/api-docs/n8n" className="border rounded-xl p-4 hover:bg-muted transition-colors">
                <p className="font-semibold mb-1">n8n</p>
                <p className="text-muted-foreground text-xs">Community node package and webhook-based fallback.</p>
              </Link>
              <Link href="/api-docs/mcp" className="border rounded-xl p-4 hover:bg-muted transition-colors">
                <p className="font-semibold mb-1">MCP / Claude agents</p>
                <p className="text-muted-foreground text-xs">Live agent-tool server for Claude and other MCP clients.</p>
              </Link>
            </div>
          </section>
        </main>
      </div>

      <Footer />
    </div>
  );
}
