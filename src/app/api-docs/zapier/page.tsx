import type { Metadata } from 'next';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Zapier - API Docs',
  description: 'Connect Kerabie Mail to Zapier: trigger Zaps on new email, and send email from a Zap action.',
};

export default function ZapierDocsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto max-w-6xl px-4 py-12 flex gap-10">
        <aside className="hidden lg:block w-56 shrink-0">
          <div className="sticky top-8 space-y-1 text-sm">
            {[
              ['Status', 'status'], ['Right now: webhooks', 'fallback'],
              ['The official app', 'app'], ['Trigger: New Email', 'trigger'],
              ['Action: Send Email', 'action'], ['Authentication', 'auth'],
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
            <p className="text-sm text-muted-foreground mb-2"><Link href="/api-docs" className="hover:underline">API Docs</Link> / Zapier</p>
            <h1 className="text-4xl font-bold mb-3">Zapier</h1>
            <p className="text-muted-foreground text-lg">
              Trigger a Zap when mail arrives in a Kerabie Mail mailbox, or send email from a Zap action step.
            </p>
          </div>

          {/* Status */}
          <section id="status" className="scroll-mt-8">
            <h2 className="text-2xl font-bold mb-4 pb-3 border-b">Status</h2>
            <div className="border rounded-xl p-4 bg-amber-50 border-amber-200">
              <p className="font-semibold mb-1 text-amber-900">The official Kerabie Mail Zapier app is built and validated, but not yet published to Zapier&apos;s marketplace.</p>
              <p className="text-amber-900/80 text-sm">
                Publishing is a manual step (Zapier developer login, push, and marketplace review) the project runs
                separately. Until it&apos;s live in the marketplace, use the webhook-based integration below,
                which works today with no waiting.
              </p>
            </div>
          </section>

          {/* Fallback */}
          <section id="fallback" className="scroll-mt-8">
            <h2 className="text-2xl font-bold mb-4 pb-3 border-b">Right now: build it with webhooks</h2>
            <p className="text-muted-foreground mb-4">
              Zapier&apos;s own built-in <strong>Webhooks by Zapier</strong> connector (a generic HTTP connector, not
              Kerabie-specific) can both catch Kerabie Mail webhook events and call the Kerabie Mail API directly.
              This is the exact same event data and send endpoint the official app will use once published.
            </p>

            <h3 className="text-lg font-semibold mb-3">Trigger a Zap on new email</h3>
            <ol className="list-decimal list-inside text-muted-foreground space-y-2 mb-4 text-sm">
              <li>In your Zap, choose <strong>Webhooks by Zapier</strong> as the trigger app and pick <strong>Catch Hook</strong>.</li>
              <li>Zapier gives you a unique catch URL, e.g. <code className="bg-muted px-1 rounded text-xs">https://hooks.zapier.com/hooks/catch/123456/abcdef/</code>.</li>
              <li>
                Create a webhook endpoint in Kerabie Mail pointed at that URL, either from{' '}
                <strong>Settings &rarr; Webhooks</strong> in the console, or via the API:
              </li>
            </ol>
            <pre className="bg-muted rounded-xl p-4 text-sm font-mono overflow-x-auto">{`curl -X POST https://api.kerabie.email/webhooks \\
  -H "X-API-Key: $API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
        "url": "https://hooks.zapier.com/hooks/catch/123456/abcdef/",
        "events": ["email.received"]
      }'`}</pre>
            <p className="text-muted-foreground text-sm mt-3">
              Every new email now lands as a trigger payload in your Zap, with the same fields documented on the{' '}
              <Link href="/api-docs/webhooks#payload" className="text-primary hover:underline">Webhooks payload reference</Link>{' '}
              (<code className="bg-muted px-1 rounded text-xs">message_id</code>, <code className="bg-muted px-1 rounded text-xs">mailbox</code>,{' '}
              <code className="bg-muted px-1 rounded text-xs">from</code>, <code className="bg-muted px-1 rounded text-xs">subject</code>,{' '}
              <code className="bg-muted px-1 rounded text-xs">preview</code>, <code className="bg-muted px-1 rounded text-xs">thread_id</code>, and more).
              Swap <code className="bg-muted px-1 rounded text-xs">email.received</code> for any other event in the{' '}
              <Link href="/api-docs/webhooks#events" className="text-primary hover:underline">events table</Link> to trigger on bounces,
              opens, clicks, and so on.
            </p>

            <h3 className="text-lg font-semibold mt-8 mb-3">Send email from a Zap action</h3>
            <p className="text-muted-foreground mb-3 text-sm">
              Add a <strong>Webhooks by Zapier</strong> action step, choose <strong>Custom Request</strong>, and configure it as:
            </p>
            <pre className="bg-muted rounded-xl p-4 text-sm font-mono overflow-x-auto">{`Method: POST
URL:    https://api.kerabie.email/mail/send
Headers:
  X-API-Key: YOUR_API_KEY
  Content-Type: application/json

Data:
{
  "from_email": "support@yourdomain.com",
  "to": ["{{customer_email}}"],
  "subject": "{{subject}}",
  "body_html": "{{html_body}}"
}`}</pre>
            <p className="text-muted-foreground text-sm mt-3">
              Map any upstream Zap field into <code className="bg-muted px-1 rounded text-xs">to</code>,{' '}
              <code className="bg-muted px-1 rounded text-xs">subject</code>, or <code className="bg-muted px-1 rounded text-xs">body_html</code>. See the
              full field list in the <Link href="/api-docs#send" className="text-primary hover:underline">Send email API reference</Link>.
            </p>
          </section>

          {/* App */}
          <section id="app" className="scroll-mt-8">
            <h2 className="text-2xl font-bold mb-4 pb-3 border-b">The official app (pending publication)</h2>
            <p className="text-muted-foreground mb-4">
              Once published, the Kerabie Mail Zapier app replaces the manual webhook wiring above with a native
              trigger and action, still calling the exact same underlying endpoints.
            </p>
          </section>

          {/* Trigger */}
          <section id="trigger" className="scroll-mt-8">
            <h3 className="text-lg font-semibold mb-3">Trigger: New Email Received</h3>
            <p className="text-muted-foreground mb-3 text-sm">
              A REST Hook trigger. Selecting it in a Zap calls <code className="bg-muted px-1 rounded text-xs">POST /webhooks</code>{' '}
              with <code className="bg-muted px-1 rounded text-xs">events: [&quot;email.received&quot;]</code> to subscribe, and{' '}
              <code className="bg-muted px-1 rounded text-xs">DELETE /webhooks/&#123;id&#125;</code> to unsubscribe when the Zap is turned off or deleted.
            </p>
            <p className="text-muted-foreground mb-3 text-sm">Output fields available to later steps:</p>
            <div className="overflow-x-auto">
              <table className="w-full border rounded-xl text-sm">
                <thead className="bg-muted"><tr>
                  <th className="text-left p-3 font-semibold">Field</th>
                  <th className="text-left p-3 font-semibold">Description</th>
                </tr></thead>
                <tbody className="divide-y text-muted-foreground">
                  {[
                    ['event', '"email.received"'],
                    ['timestamp', 'When the event fired'],
                    ['webhook_id', 'The subscribed endpoint&apos;s id'],
                    ['data__message_id', 'RFC 5322 Message-ID of the received email'],
                    ['data__mailbox', 'Which mailbox received it'],
                    ['data__from', 'Sender address'],
                    ['data__subject', 'Subject line'],
                    ['data__received_at', 'Delivery timestamp'],
                    ['data__thread_id', 'Stable thread identifier, for conversation grouping'],
                    ['data__is_reply', 'Whether this continues an existing thread'],
                    ['data__preview', 'Short text preview of the body'],
                    ['data__has_attachments', 'Boolean'],
                    ['data__size_bytes', 'Message size'],
                  ].map(([f, d]) => (
                    <tr key={f}><td className="p-3 font-mono text-xs text-foreground">{f}</td><td className="p-3">{d}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Action */}
          <section id="action" className="scroll-mt-8">
            <h3 className="text-lg font-semibold mb-3">Action: Send Email</h3>
            <p className="text-muted-foreground mb-3 text-sm">
              Calls <code className="bg-muted px-1 rounded text-xs">POST /mail/send</code>. Input fields exposed in the Zap editor:
            </p>
            <div className="overflow-x-auto">
              <table className="w-full border rounded-xl text-sm">
                <thead className="bg-muted"><tr>
                  <th className="text-left p-3 font-semibold">Field</th>
                  <th className="text-left p-3 font-semibold">Required</th>
                  <th className="text-left p-3 font-semibold">Notes</th>
                </tr></thead>
                <tbody className="divide-y text-muted-foreground">
                  {[
                    ['From', 'yes', 'Must be a mailbox you own or an editor of'],
                    ['To', 'yes', 'One or more recipients'],
                    ['Subject', 'yes', ''],
                    ['HTML Body', 'no', 'Provide this and/or Plain-Text Body'],
                    ['Plain-Text Body', 'no', ''],
                    ['CC', 'no', ''],
                    ['BCC', 'no', ''],
                    ['Reply-To', 'no', ''],
                    ['Track Opens', 'no', 'Requires a plan with read-receipt support'],
                    ['Sandbox Mode', 'no', 'Runs the pipeline without an actual SMTP delivery, for testing the Zap'],
                  ].map(([f, r, n]) => (
                    <tr key={f}><td className="p-3 font-mono text-xs text-foreground">{f}</td><td className="p-3">{r}</td><td className="p-3">{n}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Auth */}
          <section id="auth" className="scroll-mt-8">
            <h2 className="text-2xl font-bold mb-4 pb-3 border-b">Authentication</h2>
            <p className="text-muted-foreground mb-3">
              Either way (the fallback webhook setup, or the official app once published), you need a Kerabie Mail
              API key. Create one under <strong>Settings &rarr; API Keys</strong> with the{' '}
              <code className="bg-muted px-1 rounded text-xs">send</code> and{' '}
              <code className="bg-muted px-1 rounded text-xs">webhooks</code> scopes (add{' '}
              <code className="bg-muted px-1 rounded text-xs">mailboxes:read</code> too if you want a mailbox-list step).
              Pass it as the <code className="bg-muted px-1 rounded text-xs">X-API-Key</code> header on any custom request.
            </p>
            <p className="text-muted-foreground text-sm">
              If you&apos;re handling raw webhook deliveries yourself (rather than letting Zapier&apos;s Catch Hook do it),
              verify the <code className="bg-muted px-1 rounded text-xs">X-Kerabie-Signature</code> header as described in the{' '}
              <Link href="/api-docs/webhooks#signature" className="text-primary hover:underline">signature verification guide</Link>.
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
              <Link href="/api-docs/n8n" className="border rounded-xl p-4 hover:bg-muted transition-colors">
                <p className="font-semibold mb-1">n8n</p>
                <p className="text-muted-foreground text-xs">Community node package and webhook-based fallback.</p>
              </Link>
              <Link href="/api-docs/make" className="border rounded-xl p-4 hover:bg-muted transition-colors">
                <p className="font-semibold mb-1">Make (Integromat)</p>
                <p className="text-muted-foreground text-xs">Webhooks + HTTP module integration.</p>
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
