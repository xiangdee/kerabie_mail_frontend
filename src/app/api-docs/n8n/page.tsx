import type { Metadata } from 'next';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  title: 'n8n - API Docs',
  description: 'Connect Kerabie Mail to n8n: a community node package for sending mail and triggering on inbound events, plus a webhook-only fallback.',
};

export default function N8nDocsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto max-w-6xl px-4 py-12 flex gap-10">
        <aside className="hidden lg:block w-56 shrink-0">
          <div className="sticky top-8 space-y-1 text-sm">
            {[
              ['Status', 'status'], ['Right now: webhooks', 'fallback'],
              ['The community node', 'node'], ['Credential', 'credential'],
              ['Kerabie Mail node', 'action-node'], ['Trigger node', 'trigger-node'],
              ['Authentication', 'auth'], ['See also', 'see-also'],
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
            <p className="text-sm text-muted-foreground mb-2"><Link href="/api-docs" className="hover:underline">API Docs</Link> / n8n</p>
            <h1 className="text-4xl font-bold mb-3">n8n</h1>
            <p className="text-muted-foreground text-lg">
              Send email from an n8n workflow, list mailboxes, and trigger workflows on inbound Kerabie Mail events.
            </p>
          </div>

          {/* Status */}
          <section id="status" className="scroll-mt-8">
            <h2 className="text-2xl font-bold mb-4 pb-3 border-b">Status</h2>
            <div className="border rounded-xl p-4 bg-amber-50 border-amber-200">
              <p className="font-semibold mb-1 text-amber-900">The <code className="bg-amber-100 px-1 rounded text-xs">n8n-nodes-kerabie-mail</code> package builds and lints clean, but is not yet published to npm.</p>
              <p className="text-amber-900/80 text-sm">
                Publishing (<code className="bg-amber-100 px-1 rounded text-xs">npm publish</code>, plus n8n&apos;s verified-community-node review)
                is a manual step the project runs separately. Until then, use n8n&apos;s built-in Webhook and HTTP Request nodes below,
                which work today with no waiting.
              </p>
            </div>
          </section>

          {/* Fallback */}
          <section id="fallback" className="scroll-mt-8">
            <h2 className="text-2xl font-bold mb-4 pb-3 border-b">Right now: build it with webhooks</h2>
            <p className="text-muted-foreground mb-4">
              n8n ships a generic <strong>Webhook</strong> trigger node and an <strong>HTTP Request</strong> node.
              Together they cover the same ground the community node will, calling the exact same endpoints.
            </p>

            <h3 className="text-lg font-semibold mb-3">Trigger a workflow on new email</h3>
            <ol className="list-decimal list-inside text-muted-foreground space-y-2 mb-4 text-sm">
              <li>Add a <strong>Webhook</strong> trigger node to your workflow. Note the production webhook URL it generates.</li>
              <li>
                Register that URL as a Kerabie Mail webhook endpoint, from <strong>Settings &rarr; Webhooks</strong> in the console,
                or via the API:
              </li>
            </ol>
            <pre className="bg-muted rounded-xl p-4 text-sm font-mono overflow-x-auto">{`curl -X POST https://api.kerabie.email/webhooks \\
  -H "X-API-Key: $API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
        "url": "https://your-n8n-instance.com/webhook/kerabie-mail",
        "events": ["email.received"]
      }'`}</pre>
            <p className="text-muted-foreground text-sm mt-3">
              To verify the <code className="bg-muted px-1 rounded text-xs">X-Kerabie-Signature</code> header inside the workflow (recommended),
              enable the Webhook node&apos;s raw-body option and add a <strong>Code</strong> node using the same HMAC scheme as the{' '}
              <Link href="/api-docs/webhooks#signature" className="text-primary hover:underline">signature verification guide</Link>.
            </p>

            <h3 className="text-lg font-semibold mt-8 mb-3">Send email from a workflow</h3>
            <p className="text-muted-foreground mb-3 text-sm">Add an <strong>HTTP Request</strong> node configured as:</p>
            <pre className="bg-muted rounded-xl p-4 text-sm font-mono overflow-x-auto">{`Method: POST
URL:    https://api.kerabie.email/mail/send
Headers:
  X-API-Key: YOUR_API_KEY
Body (JSON):
{
  "from_email": "support@yourdomain.com",
  "to": ["{{ $json.customer_email }}"],
  "subject": "{{ $json.subject }}",
  "body_html": "{{ $json.html_body }}"
}`}</pre>
            <p className="text-muted-foreground text-sm mt-3">
              See the full field list in the <Link href="/api-docs#send" className="text-primary hover:underline">Send email API reference</Link>.
            </p>
          </section>

          {/* Node */}
          <section id="node" className="scroll-mt-8">
            <h2 className="text-2xl font-bold mb-4 pb-3 border-b">The community node (pending npm publication)</h2>
            <p className="text-muted-foreground mb-4">
              Once published, <code className="bg-muted px-1 rounded text-xs">n8n-nodes-kerabie-mail</code> replaces the manual
              wiring above with a credential, an action node, and a trigger node, still calling the exact same underlying endpoints.
            </p>
          </section>

          {/* Credential */}
          <section id="credential" className="scroll-mt-8">
            <h3 className="text-lg font-semibold mb-3">Credential: Kerabie Mail API</h3>
            <p className="text-muted-foreground mb-3 text-sm">
              Two fields: <strong>API Key</strong> (required, sent as <code className="bg-muted px-1 rounded text-xs">X-API-Key</code>) and{' '}
              <strong>API Base URL</strong> (defaults to <code className="bg-muted px-1 rounded text-xs">https://api.kerabie.email</code>,
              override only for a self-hosted/local backend). The credential is tested against{' '}
              <code className="bg-muted px-1 rounded text-xs">GET /api-keys/whoami</code>.
            </p>
          </section>

          {/* Action node */}
          <section id="action-node" className="scroll-mt-8">
            <h3 className="text-lg font-semibold mb-3">Node: Kerabie Mail</h3>
            <div className="overflow-x-auto mb-4">
              <table className="w-full border rounded-xl text-sm">
                <thead className="bg-muted"><tr>
                  <th className="text-left p-3 font-semibold">Resource</th>
                  <th className="text-left p-3 font-semibold">Operation</th>
                  <th className="text-left p-3 font-semibold">Calls</th>
                </tr></thead>
                <tbody className="divide-y text-muted-foreground">
                  <tr><td className="p-3">Message</td><td className="p-3">Send</td><td className="p-3 font-mono text-xs">POST /mail/send</td></tr>
                  <tr><td className="p-3">Mailbox</td><td className="p-3">List</td><td className="p-3 font-mono text-xs">GET /mail/mailboxes</td></tr>
                </tbody>
              </table>
            </div>
            <p className="text-muted-foreground text-sm mb-2">
              <strong>Message &rarr; Send</strong> exposes From Email, To, Subject, and Sandbox as top-level fields, with CC,
              BCC, Body HTML, Body Text, Template ID, Reply To, Track Opens, and Scheduled At grouped under &quot;Additional Fields&quot;.
            </p>
            <p className="text-muted-foreground text-sm">
              Attachments, <code className="bg-muted px-1 rounded text-xs">unsend_window</code>, and threading headers
              (<code className="bg-muted px-1 rounded text-xs">in_reply_to</code>/<code className="bg-muted px-1 rounded text-xs">references</code>)
              aren&apos;t exposed as fields yet in the node; use the HTTP Request fallback above if you need them.
            </p>
          </section>

          {/* Trigger node */}
          <section id="trigger-node" className="scroll-mt-8">
            <h3 className="text-lg font-semibold mb-3">Trigger node: Kerabie Mail Trigger</h3>
            <p className="text-muted-foreground mb-3 text-sm">
              Activating the workflow calls <code className="bg-muted px-1 rounded text-xs">POST /webhooks</code> with the events you
              picked from a dropdown (populated live from <code className="bg-muted px-1 rounded text-xs">GET /webhooks/events</code>).
              Deactivating calls <code className="bg-muted px-1 rounded text-xs">DELETE /webhooks/&#123;id&#125;</code>.
            </p>
            <p className="text-muted-foreground text-sm">
              Every delivery&apos;s <code className="bg-muted px-1 rounded text-xs">X-Kerabie-Signature</code> header is verified
              against the stored endpoint secret before the payload is handed to the workflow, using the same
              timestamp-plus-HMAC-SHA256 scheme described in the{' '}
              <Link href="/api-docs/webhooks#signature" className="text-primary hover:underline">signature verification guide</Link>.
              An invalid or missing signature returns 401 without running the workflow.
            </p>
          </section>

          {/* Auth */}
          <section id="auth" className="scroll-mt-8">
            <h2 className="text-2xl font-bold mb-4 pb-3 border-b">Authentication</h2>
            <p className="text-muted-foreground">
              Create an API key under <strong>Settings &rarr; API Keys</strong> with the scopes your workflow needs:{' '}
              <code className="bg-muted px-1 rounded text-xs">send</code> to send mail,{' '}
              <code className="bg-muted px-1 rounded text-xs">webhooks</code> to manage trigger subscriptions, and{' '}
              <code className="bg-muted px-1 rounded text-xs">mailboxes:read</code> to list mailboxes.
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
