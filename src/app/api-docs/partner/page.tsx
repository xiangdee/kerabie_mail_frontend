import type { Metadata } from 'next';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Partner API — API Docs',
  description: 'Kerabie Mail Partner API — provision mailboxes, manage domains, and send email programmatically for your customers.',
};

const BASE = 'https://api.kerabie.email';

export default function PartnerApiPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto max-w-6xl px-4 py-12 flex gap-10">
        <aside className="hidden lg:block w-56 shrink-0">
          <div className="sticky top-8 space-y-1 text-sm">
            {[['Overview','overview'],['Authentication','auth'],['Mailboxes','mailboxes'],['Domains','domains'],['Send email','send'],['Rate limits','limits']].map(([l,id]) => (
              <a key={id} href={`#${id}`} className="block px-3 py-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">{l}</a>
            ))}
            <div className="pt-4 border-t space-y-1">
              <Link href="/api-docs" className="block px-3 py-1.5 text-primary hover:underline text-sm">← API Reference</Link>
              <Link href="/api-docs/webhooks" className="block px-3 py-1.5 text-primary hover:underline text-sm">Webhooks →</Link>
            </div>
          </div>
        </aside>

        <main className="flex-1 min-w-0 space-y-16 text-[15px]">
          <div>
            <p className="text-sm text-muted-foreground mb-2">
              <Link href="/api-docs" className="hover:underline">API Docs</Link> / Partner API
            </p>
            <h1 className="text-4xl font-bold mb-3">Partner API</h1>
            <p className="text-muted-foreground text-lg">
              The Partner API lets hosting companies and resellers provision mailboxes and domains
              for their customers programmatically. Access requires an approved Partner account.
            </p>
            <div className="mt-4 p-4 bg-primary/5 border-l-4 border-primary rounded-r-xl text-sm">
              To become a partner, apply at{' '}
              <Link href="/partner" className="text-primary hover:underline">kerabie.email/partner</Link>.
              Your partner API key is shown in the Partner dashboard after approval.
            </div>
          </div>

          {/* Auth */}
          <section id="auth" className="scroll-mt-8">
            <h2 className="text-2xl font-bold mb-4 pb-3 border-b">Authentication</h2>
            <p className="text-muted-foreground mb-4">Partner API keys are separate from user API keys. Include yours in every request:</p>
            <pre className="bg-muted rounded-xl p-4 text-sm font-mono">{`Authorization: Bearer YOUR_PARTNER_API_KEY\nContent-Type: application/json`}</pre>
          </section>

          {/* Mailboxes */}
          <section id="mailboxes" className="scroll-mt-8">
            <h2 className="text-2xl font-bold mb-4 pb-3 border-b">Mailboxes</h2>

            <EndpointBlock method="POST" path="/api/v1/partner/mailboxes" desc="Provision a new mailbox for a customer. Phone number is required for account creation.">
              <ParamTable rows={[
                ['email','string','yes','Full email address (e.g. john@yourdomain.com)'],
                ['password','string','yes','Initial mailbox password (min 8 chars)'],
                ['display_name','string','no','Friendly name shown in email clients'],
                ['phone','string','yes','Customer phone number in E.164 format — required for account'],
                ['storage_gb','number','no','Storage quota in GB (default: plan default)'],
              ]} />
              <div className="border-t px-4 pt-3 pb-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Request</p>
                <pre className="bg-muted rounded-xl p-4 text-sm font-mono overflow-x-auto">{`{
  "email": "john@yourcustomer.com",
  "password": "SecurePass123!",
  "display_name": "John Smith",
  "phone": "+2348012345678",
  "storage_gb": 10
}`}</pre>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 mt-4">Response 201</p>
                <pre className="bg-muted rounded-xl p-4 text-sm font-mono overflow-x-auto">{`{
  "id": "ue_abc123",
  "email": "john@yourcustomer.com",
  "display_name": "John Smith",
  "storage_gb": 10,
  "created_at": "2026-05-17T10:00:00Z"
}`}</pre>
              </div>
            </EndpointBlock>

            <EndpointBlock method="GET" path="/api/v1/partner/mailboxes" desc="List all mailboxes provisioned under your partner account. Results are paginated and cached for 5 minutes.">
              <ParamTable rows={[
                ['page','integer','no','Page number (default: 1)'],
                ['per_page','integer','no','Items per page (default: 50, max: 100)'],
                ['domain','string','no','Filter by domain (e.g. yourcustomer.com)'],
              ]} />
            </EndpointBlock>

            <EndpointBlock method="GET" path="/api/v1/partner/mailboxes/{id}" desc="Get a single mailbox by ID." />

            <EndpointBlock method="PATCH" path="/api/v1/partner/mailboxes/{id}" desc="Update a mailbox's display name or storage quota.">
              <ParamTable rows={[
                ['display_name','string','no','Update display name'],
                ['storage_gb','number','no','Adjust storage quota'],
                ['is_active','boolean','no','Suspend (false) or reactivate (true) the mailbox'],
              ]} />
            </EndpointBlock>

            <EndpointBlock method="DELETE" path="/api/v1/partner/mailboxes/{id}" desc="Permanently delete a mailbox and all its email. This cannot be undone. The customer should export their data first." />

            <EndpointBlock method="POST" path="/api/v1/partner/mailboxes/{id}/password" desc="Reset the mailbox password.">
              <ParamTable rows={[['new_password','string','yes','New password (min 8 chars)']]} />
            </EndpointBlock>
          </section>

          {/* Domains */}
          <section id="domains" className="scroll-mt-8">
            <h2 className="text-2xl font-bold mb-4 pb-3 border-b">Domains</h2>

            <EndpointBlock method="POST" path="/api/v1/partner/domains" desc="Add a custom domain for a customer. Returns the DNS records they need to configure.">
              <ParamTable rows={[['domain','string','yes','Domain name (e.g. yourcustomer.com)']]} />
              <div className="border-t px-4 pt-3 pb-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Response 201</p>
                <pre className="bg-muted rounded-xl p-4 text-sm font-mono overflow-x-auto">{`{
  "id": 42,
  "domain": "yourcustomer.com",
  "verified": false,
  "dns_records": {
    "mx":   { "type": "MX",  "host": "@", "value": "mail.kerabie.email", "priority": 10 },
    "spf":  { "type": "TXT", "host": "@", "value": "v=spf1 include:kerabie.email ~all" },
    "dkim": { "type": "TXT", "host": "dkim._domainkey", "value": "v=DKIM1; k=rsa; p=..." },
    "dmarc":{ "type": "TXT", "host": "_dmarc", "value": "v=DMARC1; p=quarantine;" }
  }
}`}</pre>
              </div>
            </EndpointBlock>

            <EndpointBlock method="GET" path="/api/v1/partner/domains" desc="List all domains under your partner account." />

            <EndpointBlock method="GET" path="/api/v1/partner/domains/{id}" desc="Get domain status and required DNS records.">
              <div className="border-t px-4 pt-3 pb-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Response 200</p>
                <pre className="bg-muted rounded-xl p-4 text-sm font-mono overflow-x-auto">{`{
  "id": 42,
  "domain": "yourcustomer.com",
  "verified": false,
  "checks": {
    "mx":    { "ok": true,  "found": "mail.kerabie.email" },
    "spf":   { "ok": true,  "found": "v=spf1 include:kerabie.email ~all" },
    "dkim":  { "ok": false, "found": null,  "expected": "v=DKIM1; k=rsa; p=..." },
    "dmarc": { "ok": false, "found": null }
  },
  "last_checked_at": "2026-05-17T10:05:00Z"
}`}</pre>
              </div>
            </EndpointBlock>

            <EndpointBlock method="POST" path="/api/v1/partner/domains/{id}/verify" desc="Trigger an immediate DNS check. Kerabie will re-check all 4 records (MX, SPF, DKIM, DMARC) and update the domain status. A domain.verified or domain.verification_failed webhook fires when complete." />

            <EndpointBlock method="DELETE" path="/api/v1/partner/domains/{id}" desc="Remove a domain. All mailboxes on this domain are suspended first." />
          </section>

          {/* Send */}
          <section id="send" className="scroll-mt-8">
            <h2 className="text-2xl font-bold mb-4 pb-3 border-b">Send email</h2>
            <p className="text-muted-foreground mb-6">
              Send email on behalf of a customer's mailbox. The <code className="bg-muted px-1 rounded text-xs">from</code> address
              must be a mailbox provisioned under your partner account.
            </p>

            <EndpointBlock method="POST" path="/api/v1/send" desc="Send a transactional email.">
              <ParamTable rows={[
                ['from','string','yes','Sender address (must be a provisioned mailbox)'],
                ['to','string[]','yes','Recipient addresses (max 50)'],
                ['cc','string[]','no','CC recipients'],
                ['bcc','string[]','no','BCC recipients'],
                ['subject','string','yes','Email subject'],
                ['html','string','no','HTML body'],
                ['text','string','no','Plain-text fallback body'],
                ['template_id','string','no','ID of a saved email template'],
                ['template_vars','object','no','Variables to inject into the template'],
                ['attachments','object[]','no','Array of {filename, content (base64), content_type}'],
                ['track_opens','boolean','no','Embed open-tracking pixel'],
                ['scheduled_at','string','no','ISO 8601 — deliver at this future time'],
              ]} />
              <div className="border-t px-4 pt-3 pb-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Request</p>
                <pre className="bg-muted rounded-xl p-4 text-sm font-mono overflow-x-auto">{`{
  "from": "hello@yourcustomer.com",
  "to": ["user@example.com"],
  "subject": "Your invoice is ready",
  "html": "<h1>Invoice #1042</h1><p>Due: 1 June 2026</p>",
  "text": "Invoice #1042. Due: 1 June 2026.",
  "track_opens": true,
  "attachments": [
    {
      "filename": "invoice-1042.pdf",
      "content": "JVBERi0xLjQK...",
      "content_type": "application/pdf"
    }
  ]
}`}</pre>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 mt-4">Response 201</p>
                <pre className="bg-muted rounded-xl p-4 text-sm font-mono overflow-x-auto">{`{
  "message_id": "<abc123@kerabie.email>",
  "status": "sent",
  "scheduled_at": null
}`}</pre>
              </div>
            </EndpointBlock>
          </section>

          {/* Rate limits */}
          <section id="limits" className="scroll-mt-8">
            <h2 className="text-2xl font-bold mb-4 pb-3 border-b">Rate limits</h2>
            <div className="overflow-x-auto">
              <table className="w-full border rounded-xl text-sm">
                <thead className="bg-muted"><tr>
                  <th className="text-left p-3">Tier</th>
                  <th className="text-left p-3">Default (req/min)</th>
                  <th className="text-left p-3">Send email (req/hr)</th>
                  <th className="text-left p-3">Burst</th>
                </tr></thead>
                <tbody className="divide-y text-muted-foreground">
                  <tr><td className="p-3 font-medium text-foreground">Basic</td><td className="p-3">100</td><td className="p-3">500</td><td className="p-3">2× for 30s, then throttle</td></tr>
                  <tr><td className="p-3 font-medium text-foreground">Pro</td><td className="p-3">100</td><td className="p-3">5,000</td><td className="p-3">2× for 30s, then throttle</td></tr>
                  <tr><td className="p-3 font-medium text-foreground">Enterprise</td><td className="p-3">Custom</td><td className="p-3">Unlimited</td><td className="p-3">Custom</td></tr>
                </tbody>
              </table>
            </div>
            <p className="text-sm text-muted-foreground mt-3">
              Rate limit headers are returned on every response:{' '}
              <code className="bg-muted px-1 rounded text-xs">X-RateLimit-Limit</code>,{' '}
              <code className="bg-muted px-1 rounded text-xs">X-RateLimit-Remaining</code>,{' '}
              <code className="bg-muted px-1 rounded text-xs">X-RateLimit-Reset</code>.
              When exceeded, a <code className="bg-muted px-1 rounded text-xs">429</code> is returned with a{' '}
              <code className="bg-muted px-1 rounded text-xs">Retry-After</code> header.
            </p>
          </section>
        </main>
      </div>

      <Footer />
    </div>
  );
}

function EndpointBlock({ method, path, desc, children }: { method: string; path: string; desc: string; children?: React.ReactNode }) {
  const colors: Record<string, string> = {
    GET: 'bg-blue-100 text-blue-700', POST: 'bg-green-100 text-green-700',
    PATCH: 'bg-yellow-100 text-yellow-700', DELETE: 'bg-red-100 text-red-700',
  };
  return (
    <div className="border rounded-xl overflow-hidden mb-6">
      <div className="flex items-center gap-3 px-4 py-3 bg-muted/50 border-b">
        <span className={`text-xs font-bold px-2 py-1 rounded ${colors[method] ?? 'bg-muted'}`}>{method}</span>
        <code className="text-sm font-mono">{BASE}{path}</code>
      </div>
      <div className="px-4 py-3 text-sm text-muted-foreground border-b">{desc}</div>
      {children}
    </div>
  );
}

function ParamTable({ rows }: { rows: [string, string, string, string][] }) {
  return (
    <div className="overflow-x-auto px-4 py-3">
      <table className="w-full text-sm">
        <thead><tr className="border-b">
          <th className="text-left pb-2 font-semibold">Parameter</th>
          <th className="text-left pb-2 font-semibold">Type</th>
          <th className="text-left pb-2 font-semibold">Required</th>
          <th className="text-left pb-2 font-semibold">Description</th>
        </tr></thead>
        <tbody className="divide-y text-muted-foreground">
          {rows.map(([name, type, req, desc]) => (
            <tr key={name}>
              <td className="py-2 font-mono text-xs text-foreground">{name}</td>
              <td className="py-2">{type}</td>
              <td className="py-2">{req === 'yes' ? <span className="text-red-500">required</span> : <span>optional</span>}</td>
              <td className="py-2">{desc}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
