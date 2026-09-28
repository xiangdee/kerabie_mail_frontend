import type { Metadata } from 'next';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  title: 'MCP / Claude agents - API Docs',
  description: 'Kerabie Mail\'s Model Context Protocol server: full tool reference, auth model, and usage examples for Claude and other MCP clients.',
};

export default function McpDocsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto max-w-6xl px-4 py-12 flex gap-10">
        <aside className="hidden lg:block w-56 shrink-0">
          <div className="sticky top-8 space-y-1 text-sm">
            {[
              ['Overview', 'overview'], ['Install', 'install'], ['Authentication', 'auth'],
              ['Tools', 'tools'], ['send_email', 'send_email'], ['list_mailboxes', 'list_mailboxes'],
              ['search_emails', 'search_emails'], ['list_recent_messages', 'list_recent_messages'],
              ['Usage examples', 'examples'], ['See also', 'see-also'],
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
            <p className="text-sm text-muted-foreground mb-2"><Link href="/api-docs" className="hover:underline">API Docs</Link> / MCP</p>
            <h1 className="text-4xl font-bold mb-3">MCP / Claude agents</h1>
            <p className="text-muted-foreground text-lg">
              A live Model Context Protocol server at <code className="bg-muted px-1 rounded text-sm">POST /mcp</code>. Point
              Claude, or any other MCP-compatible agent, at it to send email, list mailboxes, and search an inbox as tools.
              Available today, no pending steps, gated on a plan with <strong>AI agent tools</strong>.
            </p>
          </div>

          {/* Overview */}
          <section id="overview" className="scroll-mt-8">
            <h2 className="text-2xl font-bold mb-4 pb-3 border-b">Overview</h2>
            <div className="grid sm:grid-cols-3 gap-4 text-sm">
              {[
                { title: 'Transport', desc: 'Streamable HTTP, JSON-RPC 2.0 over a single POST /mcp endpoint. No SSE, no separate connection setup.' },
                { title: 'Auth', desc: 'Reuses the existing X-API-Key mechanism instead of MCP\'s own OAuth flow, since the transport allows custom headers.' },
                { title: 'Tools', desc: 'Four tools today: send_email, list_mailboxes, search_emails, list_recent_messages. Each delegates to the same code path the REST API uses.' },
              ].map(({ title, desc }) => (
                <div key={title} className="border rounded-xl p-4">
                  <p className="font-semibold mb-1">{title}</p>
                  <p className="text-muted-foreground">{desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Install */}
          <section id="install" className="scroll-mt-8">
            <h2 className="text-2xl font-bold mb-4 pb-3 border-b">Install</h2>
            <p className="text-muted-foreground mb-4">
              Copy-paste install snippets, with a real API key filled in, are also available from{' '}
              <strong>Tools</strong> in the console sidebar. The same three options:
            </p>

            <h3 className="text-lg font-semibold mb-3">Claude Code CLI</h3>
            <pre className="bg-muted rounded-xl p-4 text-sm font-mono overflow-x-auto">{`claude mcp add --transport http kerabie-mail https://api.kerabie.email/mcp \\
  --header "X-API-Key: YOUR_API_KEY"`}</pre>

            <h3 className="text-lg font-semibold mt-6 mb-3">Claude Desktop / any MCP client reading the mcpServers shape</h3>
            <pre className="bg-muted rounded-xl p-4 text-sm font-mono overflow-x-auto">{`{
  "mcpServers": {
    "kerabie-mail": {
      "url": "https://api.kerabie.email/mcp",
      "headers": { "X-API-Key": "YOUR_API_KEY" }
    }
  }
}`}</pre>

            <h3 className="text-lg font-semibold mt-6 mb-3">Test with curl</h3>
            <pre className="bg-muted rounded-xl p-4 text-sm font-mono overflow-x-auto">{`curl -X POST https://api.kerabie.email/mcp \\
  -H "X-API-Key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'`}</pre>
          </section>

          {/* Auth */}
          <section id="auth" className="scroll-mt-8">
            <h2 className="text-2xl font-bold mb-4 pb-3 border-b">Authentication and scopes</h2>
            <p className="text-muted-foreground mb-3">
              Every request must carry an <code className="bg-muted px-1 rounded text-sm">X-API-Key</code> header. Missing it
              returns 401 before any JSON-RPC method runs. The key is resolved the same way as any other API call
              (<code className="bg-muted px-1 rounded text-sm">get_api_key_user</code>), and the account must be on a plan with the{' '}
              <strong>AI agent tools</strong> feature enabled, checked once per request.
            </p>
            <p className="text-muted-foreground mb-3">
              Beyond that account-level gate, each individual tool also requires its own scope on the key, checked at{' '}
              <code className="bg-muted px-1 rounded text-sm">tools/call</code> time. Create the key under{' '}
              <strong>Settings &rarr; API Keys</strong> with whichever scopes below your agent needs:
            </p>
            <div className="overflow-x-auto">
              <table className="w-full border rounded-xl text-sm">
                <thead className="bg-muted"><tr>
                  <th className="text-left p-3 font-semibold">Tool</th>
                  <th className="text-left p-3 font-semibold">Required scope</th>
                </tr></thead>
                <tbody className="divide-y text-muted-foreground">
                  {[
                    ['send_email', 'send'],
                    ['list_mailboxes', 'mailboxes:read'],
                    ['search_emails', 'mailboxes:read'],
                    ['list_recent_messages', 'mailboxes:read'],
                  ].map(([t, s]) => (
                    <tr key={t}><td className="p-3 font-mono text-xs text-foreground">{t}</td><td className="p-3 font-mono text-xs">{s}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-muted-foreground text-sm mt-3">
              A call to a tool the key isn&apos;t scoped for returns a JSON-RPC error (code -32603) rather than a bare HTTP
              403, so a well-behaved MCP client surfaces it to the agent as a normal tool-call failure instead of a
              broken connection.
            </p>
          </section>

          {/* Tools intro */}
          <section id="tools" className="scroll-mt-8">
            <h2 className="text-2xl font-bold mb-4 pb-3 border-b">Tools</h2>
            <p className="text-muted-foreground">
              <code className="bg-muted px-1 rounded text-sm">tools/list</code> returns all four with their full JSON
              Schema input shapes, as MCP expects. The reference below is the same schema, described in prose.
            </p>
          </section>

          {/* send_email */}
          <section id="send_email" className="scroll-mt-8">
            <h3 className="text-lg font-semibold mb-3">send_email</h3>
            <p className="text-muted-foreground mb-3 text-sm">
              Send an email from one of the authenticated account&apos;s connected mailboxes. Defaults to a sandboxed
              send (no real delivery, doesn&apos;t count against quota) unless <code className="bg-muted px-1 rounded text-xs">sandbox: false</code> is
              explicitly passed, which the MCP tool description itself tells the calling agent to only do once the
              user has clearly confirmed a real send is wanted.
            </p>
            <div className="overflow-x-auto mb-3">
              <table className="w-full border rounded-xl text-sm">
                <thead className="bg-muted"><tr>
                  <th className="text-left p-3 font-semibold">Input</th>
                  <th className="text-left p-3 font-semibold">Type</th>
                  <th className="text-left p-3 font-semibold">Required</th>
                </tr></thead>
                <tbody className="divide-y text-muted-foreground">
                  {[
                    ['from_email', 'string', 'yes'],
                    ['to', 'string[]', 'yes'],
                    ['subject', 'string', 'yes'],
                    ['cc', 'string[]', 'no'],
                    ['bcc', 'string[]', 'no'],
                    ['body_html', 'string', 'no'],
                    ['body_text', 'string', 'no'],
                    ['sandbox', 'boolean (default true)', 'no'],
                  ].map(([f, t, r]) => (
                    <tr key={f}><td className="p-3 font-mono text-xs text-foreground">{f}</td><td className="p-3">{t}</td><td className="p-3">{r}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-muted-foreground text-sm">Delegates to the same handler as <code className="bg-muted px-1 rounded text-xs">POST /mail/send</code>, so the response shape matches the <Link href="/api-docs#send" className="text-primary hover:underline">Send email API reference</Link>.</p>
          </section>

          {/* list_mailboxes */}
          <section id="list_mailboxes" className="scroll-mt-8">
            <h3 className="text-lg font-semibold mb-3">list_mailboxes</h3>
            <p className="text-muted-foreground text-sm">
              No input. Lists the authenticated account&apos;s connected mailboxes, same data as the console&apos;s
              mailbox switcher.
            </p>
          </section>

          {/* search_emails */}
          <section id="search_emails" className="scroll-mt-8">
            <h3 className="text-lg font-semibold mb-3">search_emails</h3>
            <div className="overflow-x-auto mb-3">
              <table className="w-full border rounded-xl text-sm">
                <thead className="bg-muted"><tr>
                  <th className="text-left p-3 font-semibold">Input</th>
                  <th className="text-left p-3 font-semibold">Type</th>
                  <th className="text-left p-3 font-semibold">Required</th>
                </tr></thead>
                <tbody className="divide-y text-muted-foreground">
                  {[
                    ['email', 'string', 'yes'],
                    ['q', 'string', 'yes'],
                    ['folder', 'string (default "INBOX")', 'no'],
                  ].map(([f, t, r]) => (
                    <tr key={f}><td className="p-3 font-mono text-xs text-foreground">{f}</td><td className="p-3">{t}</td><td className="p-3">{r}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-muted-foreground text-sm">
              Requires either a Kerabie-managed mailbox, or a DNS-connected mailbox with a recently cached IMAP
              session, since an agent has no way to supply an IMAP password interactively. A DNS mailbox with no
              cached session returns 403; that&apos;s a hard stop for the agent, not something worth retrying.
            </p>
          </section>

          {/* list_recent_messages */}
          <section id="list_recent_messages" className="scroll-mt-8">
            <h3 className="text-lg font-semibold mb-3">list_recent_messages</h3>
            <div className="overflow-x-auto mb-3">
              <table className="w-full border rounded-xl text-sm">
                <thead className="bg-muted"><tr>
                  <th className="text-left p-3 font-semibold">Input</th>
                  <th className="text-left p-3 font-semibold">Type</th>
                  <th className="text-left p-3 font-semibold">Required</th>
                </tr></thead>
                <tbody className="divide-y text-muted-foreground">
                  {[
                    ['email', 'string', 'yes'],
                    ['folder', 'string (default "INBOX")', 'no'],
                    ['per_page', 'integer (default 20)', 'no'],
                  ].map(([f, t, r]) => (
                    <tr key={f}><td className="p-3 font-mono text-xs text-foreground">{f}</td><td className="p-3">{t}</td><td className="p-3">{r}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-muted-foreground text-sm">Same IMAP-session caveat as <code className="bg-muted px-1 rounded text-xs">search_emails</code> above.</p>
          </section>

          {/* Examples */}
          <section id="examples" className="scroll-mt-8">
            <h2 className="text-2xl font-bold mb-4 pb-3 border-b">Usage examples</h2>
            <div className="space-y-6">
              <div className="border rounded-xl p-4">
                <p className="font-semibold mb-2">Draft and send a sandboxed test email</p>
                <p className="text-muted-foreground text-sm mb-2">Prompt Claude with something like:</p>
                <pre className="bg-muted rounded-xl p-3 text-sm font-mono overflow-x-auto">{`Using the Kerabie Mail tools, draft a short reply from support@yourdomain.com
to test@example.com confirming their refund was processed, and send it as
a sandbox test first so I can see it before it goes out for real.`}</pre>
                <p className="text-muted-foreground text-sm mt-2">
                  Claude calls <code className="bg-muted px-1 rounded text-xs">send_email</code> with{' '}
                  <code className="bg-muted px-1 rounded text-xs">sandbox: true</code> by default, since it wasn&apos;t
                  told the real send is confirmed. Nothing is actually delivered and nothing counts against quota.
                </p>
              </div>
              <div className="border rounded-xl p-4">
                <p className="font-semibold mb-2">Summarize your last 10 emails</p>
                <pre className="bg-muted rounded-xl p-3 text-sm font-mono overflow-x-auto">{`Summarize the last 10 messages in my support@yourdomain.com inbox and
flag any that look urgent.`}</pre>
                <p className="text-muted-foreground text-sm mt-2">
                  Claude calls <code className="bg-muted px-1 rounded text-xs">list_recent_messages</code> with{' '}
                  <code className="bg-muted px-1 rounded text-xs">email: &quot;support@yourdomain.com&quot;</code>,{' '}
                  <code className="bg-muted px-1 rounded text-xs">per_page: 10</code>, then reasons over the returned
                  subjects and previews.
                </p>
              </div>
            </div>
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
              <Link href="/api-docs/make" className="border rounded-xl p-4 hover:bg-muted transition-colors">
                <p className="font-semibold mb-1">Make (Integromat)</p>
                <p className="text-muted-foreground text-xs">Webhooks + HTTP module integration.</p>
              </Link>
            </div>
          </section>
        </main>
      </div>

      <Footer />
    </div>
  );
}
