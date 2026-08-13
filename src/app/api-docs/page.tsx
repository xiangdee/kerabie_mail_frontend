import type { Metadata } from 'next';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  title: 'API Documentation',
  description: 'Kerabie Mail REST API reference — send email, manage mailboxes, contacts, calendar, and more.',
};

const BASE = 'https://api.kerabie.email';

export default function ApiDocsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto max-w-6xl px-4 py-12 flex gap-10">
        {/* Sidebar nav */}
        <aside className="hidden lg:block w-56 shrink-0">
          <div className="sticky top-8 space-y-1 text-sm">
            {NAV.map(({ label, id }) => (
              <a key={id} href={`#${id}`} className="block px-3 py-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                {label}
              </a>
            ))}
            <div className="pt-4 space-y-1 border-t">
              <Link href="/api-docs/webhooks" className="block px-3 py-1.5 rounded-lg text-primary hover:underline text-sm">Webhooks →</Link>
              <Link href="/api-docs/partner" className="block px-3 py-1.5 rounded-lg text-primary hover:underline text-sm">Partner API →</Link>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0 space-y-16">
          <div>
            <h1 className="text-4xl font-bold mb-3">API Reference</h1>
            <p className="text-muted-foreground text-lg">
              The Kerabie Mail REST API lets you send emails, manage mailboxes, contacts, calendar
              events, and more. Available on every plan tier, including <strong>Free</strong> —
              generate a key under Settings → API Keys.
            </p>
            <div className="flex flex-wrap gap-3 mt-4">
              <Link href="/api-docs/webhooks" className="text-sm text-primary hover:underline">Webhooks docs →</Link>
              <Link href="/api-docs/partner" className="text-sm text-primary hover:underline">Partner API →</Link>
            </div>
          </div>

          <AuthSection />
          <ErrorsSection />
          <SendSection />
          <TemplatesSection />
          <InboxSection />
          <ContactsSection />
          <CalendarSection />
          <LabelsSection />
          <UsageSection />
        </main>
      </div>

      <Footer />
    </div>
  );
}

const NAV = [
  { label: 'Authentication', id: 'auth' },
  { label: 'Errors', id: 'errors' },
  { label: 'Send email', id: 'send' },
  { label: 'Templates', id: 'templates' },
  { label: 'Inbox', id: 'inbox' },
  { label: 'Contacts', id: 'contacts' },
  { label: 'Calendar', id: 'calendar' },
  { label: 'Labels', id: 'labels' },
  { label: 'Usage', id: 'usage' },
];

// ─── helpers ──────────────────────────────────────────────────────────────────

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-8">
      <h2 className="text-2xl font-bold mb-6 pb-3 border-b">{title}</h2>
      <div className="space-y-8">{children}</div>
    </section>
  );
}

function Endpoint({ method, path, desc, children }: { method: string; path: string; desc: string; children?: React.ReactNode }) {
  const colors: Record<string, string> = {
    GET: 'bg-blue-100 text-blue-700', POST: 'bg-green-100 text-green-700',
    PATCH: 'bg-yellow-100 text-yellow-700', DELETE: 'bg-red-100 text-red-700',
  };
  return (
    <div className="border rounded-xl overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3 bg-muted/50 border-b">
        <span className={`text-xs font-bold px-2 py-1 rounded ${colors[method] ?? 'bg-muted'}`}>{method}</span>
        <code className="text-sm font-mono">{BASE}{path}</code>
      </div>
      <div className="px-4 py-3 text-sm text-muted-foreground">{desc}</div>
      {children && <div className="border-t">{children}</div>}
    </div>
  );
}

function CodeBlock({ lang, children }: { lang: string; children: string }) {
  return (
    <pre className="bg-muted text-foreground text-sm font-mono p-4 overflow-x-auto leading-relaxed">
      <code>{children.trim()}</code>
    </pre>
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
              <td className="py-2">{req === 'yes' ? <span className="text-red-500">required</span> : <span className="text-muted-foreground">optional</span>}</td>
              <td className="py-2">{desc}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── sections ─────────────────────────────────────────────────────────────────

function AuthSection() {
  return (
    <Section id="auth" title="Authentication">
      <p className="text-muted-foreground">
        API requests are authenticated with an API key in the <code className="bg-muted px-1 rounded text-sm">X-API-Key</code> header
        — not <code className="bg-muted px-1 rounded text-sm">Authorization: Bearer</code> (that&apos;s used for browser/mobile session
        tokens instead, obtained via <code className="bg-muted px-1 rounded text-sm">/auth/login</code>, not for API keys).
        Generate keys with the <code className="bg-muted px-1 rounded text-sm">send</code> scope in <strong>Settings → API Keys</strong>
        — available on every plan tier, including Free.
      </p>
      <CodeBlock lang="http">{`X-API-Key: YOUR_API_KEY\nContent-Type: application/json`}</CodeBlock>
      <p className="text-muted-foreground text-sm">
        Sending isn&apos;t rate-limited by requests-per-minute — each mailbox has its own daily send quota (with an hourly
        sub-limit to catch bursts) that scales with the mailbox owner&apos;s plan, visible via <code className="bg-muted px-1 rounded text-sm">GET /subscriptions/me</code>.
        Exceeding it returns <code className="bg-muted px-1 rounded text-sm">429</code>. Mailboxes connected over plain IMAP relay
        through your own external provider and aren&apos;t subject to this quota at all.
      </p>
    </Section>
  );
}

function ErrorsSection() {
  return (
    <Section id="errors" title="Errors">
      <p className="text-muted-foreground">All errors return JSON with a <code className="bg-muted px-1 rounded text-sm">detail</code> field.</p>
      <CodeBlock lang="json">{`{ "detail": "Incorrect password." }`}</CodeBlock>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border rounded-xl">
          <thead className="bg-muted"><tr>
            <th className="text-left p-3">Code</th><th className="text-left p-3">Meaning</th>
          </tr></thead>
          <tbody className="divide-y text-muted-foreground">
            {[['200','Success'],['201','Created'],['204','Deleted (no body)'],['400','Bad request — check payload'],['401','Missing or invalid API key'],['403','Feature not available on your plan'],['404','Resource not found'],['422','Validation error — check field types'],['429','Rate limit exceeded'],['500','Server error — contact support']].map(([c,m]) => (
              <tr key={c}><td className="p-3 font-mono font-medium text-foreground">{c}</td><td className="p-3">{m}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </Section>
  );
}

function SendSection() {
  return (
    <Section id="send" title="Send email">
      <Endpoint method="POST" path="/mail/send" desc="Send an email from a mailbox you own — inline content, or a saved template. Attachments are base64-encoded.">
        <ParamTable rows={[
          ['from_email','string','yes','Sender address (must be a mailbox you own)'],
          ['to','string[]','yes','Recipient email addresses (max 50)'],
          ['cc','string[]','no','CC recipients'],
          ['bcc','string[]','no','BCC recipients'],
          ['subject','string','required unless template_id is set','Email subject line — defaults to the template’s own subject when template_id is given'],
          ['body_html','string','no','HTML body. At least one of body_html/body_text/template_id must resolve to content'],
          ['body_text','string','no','Plain-text body (fallback)'],
          ['template_id','integer','no','Send using a saved template (see Templates below) instead of inline subject/body_html'],
          ['variables','object','no','{{placeholder}} substitutions applied to the template’s subject and body — ignored without template_id'],
          ['reply_to','string','no','Reply-To address'],
          ['track_opens','boolean','no','Embed a read-receipt tracking pixel — requires a plan with read-receipt support, silently ignored otherwise'],
          ['scheduled_at','string','no','ISO 8601 datetime (future, UTC) — queues instead of sending immediately'],
          ['unsend_window','integer','no','Seconds to hold before dispatch (max 30), for an "undo send" window'],
          ['attachments','object[]','no','Array of {filename, content_base64, content_type}. Total size capped by the sender’s plan'],
        ]} />
        <div className="border-t px-4 pt-3 pb-1">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Request — inline content</p>
          <CodeBlock lang="bash">{`curl -X POST https://api.kerabie.email/mail/send \\
  -H "X-API-Key: $API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
        "from_email": "hello@yourdomain.com",
        "to": ["user@example.com"],
        "subject": "Hello from the API",
        "body_html": "<p>This was sent via the Kerabie Mail API.</p>"
      }'`}</CodeBlock>
        </div>
        <div className="border-t px-4 pt-3 pb-1">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Request — using a saved template</p>
          <CodeBlock lang="json">{`{
  "from_email": "hello@yourdomain.com",
  "to": ["user@example.com"],
  "template_id": 1,
  "variables": { "first_name": "Ada", "order_id": "12345" }
}`}</CodeBlock>
        </div>
        <div className="border-t px-4 pt-3 pb-1">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Response 200</p>
          <CodeBlock lang="json">{`{
  "message_id": "3fa31ded-d28f-4973-af7b-9ed56ef842d1",
  "status": "sent",
  "scheduled_at": null,
  "scheduled_id": null
}`}</CodeBlock>
          <p className="text-xs text-muted-foreground mt-2">
            <code className="bg-muted px-1 rounded">status</code> is <code className="bg-muted px-1 rounded">&quot;scheduled&quot;</code> instead
            of <code className="bg-muted px-1 rounded">&quot;sent&quot;</code> when <code className="bg-muted px-1 rounded">scheduled_at</code> or <code className="bg-muted px-1 rounded">unsend_window</code> is set —
            track or cancel it with the endpoints below, using the returned <code className="bg-muted px-1 rounded">scheduled_id</code>.
          </p>
        </div>
      </Endpoint>

      <Endpoint method="GET" path="/mail/scheduled" desc="List all emails scheduled for future delivery." />
      <Endpoint method="DELETE" path="/mail/scheduled/{id}" desc="Cancel a scheduled email before it is sent." />
    </Section>
  );
}

function TemplatesSection() {
  return (
    <Section id="templates" title="Templates">
      <p className="text-muted-foreground">
        Reusable HTML emails with <code className="bg-muted px-1 rounded text-sm">{'{{placeholder}}'}</code> tags — manage them under
        <strong> Settings → Templates</strong> (three starter designs included), then send with them via <code className="bg-muted px-1 rounded text-sm">template_id</code> on
        <code className="bg-muted px-1 rounded text-sm"> POST /mail/send</code> above.
      </p>
      <Endpoint method="GET" path="/mail/templates" desc="List your templates (paginated)." />
      <Endpoint method="POST" path="/mail/templates" desc="Create a template.">
        <ParamTable rows={[
          ['name','string','yes','Template name'],
          ['subject','string','no','Default subject — can contain {{placeholder}} tags'],
          ['body_html','string','yes','HTML body — can contain {{placeholder}} tags'],
          ['is_shared','boolean','no','Whether other users on a shared inbox can use this template'],
        ]} />
      </Endpoint>
      <Endpoint method="GET" path="/mail/templates/{id}" desc="Fetch a single template." />
      <Endpoint method="PATCH" path="/mail/templates/{id}" desc="Update a template's name, subject, body_html, or is_shared." />
      <Endpoint method="DELETE" path="/mail/templates/{id}" desc="Delete a template." />
    </Section>
  );
}

function InboxSection() {
  return (
    <Section id="inbox" title="Inbox">
      <Endpoint method="GET" path="/inbox" desc="List messages in a mailbox folder.">
        <ParamTable rows={[
          ['email','string','yes','Mailbox address'],
          ['folder','string','no','IMAP folder name (default: INBOX)'],
          ['page','integer','no','Page number (default: 1)'],
          ['per_page','integer','no','Items per page (default: 50, max: 100)'],
          ['starred_only','boolean','no','Return only starred messages'],
          ['unseen_only','boolean','no','Return only unread messages'],
        ]} />
        <div className="border-t px-4 pt-3 pb-1">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Response 200</p>
          <CodeBlock lang="json">{`{
  "messages": [
    {
      "uid": 42,
      "subject": "Hello",
      "from": "sender@example.com",
      "date": "2026-05-17T09:30:00Z",
      "seen": false,
      "starred": false,
      "has_attachments": false,
      "size": 4200
    }
  ],
  "total": 87,
  "page": 1,
  "per_page": 50
}`}</CodeBlock>
        </div>
      </Endpoint>

      <Endpoint method="GET" path="/inbox/{uid}" desc="Fetch a single message including full HTML/text body." >
        <ParamTable rows={[['email','string','yes','Mailbox address']]} />
      </Endpoint>

      <Endpoint method="PATCH" path="/inbox/{uid}" desc="Mark a message as read/unread or starred/unstarred, or move it to a folder.">
        <ParamTable rows={[
          ['email','string','yes','Mailbox address'],
          ['seen','boolean','no','Mark read (true) or unread (false)'],
          ['starred','boolean','no','Star or unstar the message'],
          ['folder','string','no','Move to this IMAP folder (e.g. Archive, Trash)'],
        ]} />
      </Endpoint>

      <Endpoint method="DELETE" path="/inbox/{uid}" desc="Permanently delete a message." >
        <ParamTable rows={[['email','string','yes','Mailbox address']]} />
      </Endpoint>

      <Endpoint method="GET" path="/inbox/folders" desc="List all IMAP folders for a mailbox.">
        <ParamTable rows={[['email','string','yes','Mailbox address']]} />
      </Endpoint>
    </Section>
  );
}

function ContactsSection() {
  return (
    <Section id="contacts" title="Contacts">
      <p className="text-muted-foreground text-sm">Contacts require a Pro or Premium plan.</p>
      <Endpoint method="GET" path="/contacts" desc="List contacts, optionally filtering by search term.">
        <ParamTable rows={[['search','string','no','Filter by name, email, or company']]} />
      </Endpoint>
      <Endpoint method="POST" path="/contacts" desc="Create a new contact.">
        <ParamTable rows={[
          ['name','string','yes','Contact full name'],
          ['email','string','yes','Email address'],
          ['phone','string','no','Phone number'],
          ['company','string','no','Company name'],
        ]} />
      </Endpoint>
      <Endpoint method="PATCH" path="/contacts/{id}" desc="Update an existing contact. All fields optional." />
      <Endpoint method="DELETE" path="/contacts/{id}" desc="Delete a contact permanently." />
    </Section>
  );
}

function CalendarSection() {
  return (
    <Section id="calendar" title="Calendar">
      <p className="text-muted-foreground text-sm">Calendar requires a Pro or Premium plan.</p>
      <Endpoint method="GET" path="/calendar" desc="List calendar events in a date range.">
        <ParamTable rows={[
          ['from','string','no','ISO 8601 start date'],
          ['to','string','no','ISO 8601 end date'],
        ]} />
      </Endpoint>
      <Endpoint method="POST" path="/calendar" desc="Create a calendar event.">
        <ParamTable rows={[
          ['title','string','yes','Event title'],
          ['start','string','yes','ISO 8601 start datetime'],
          ['end','string','yes','ISO 8601 end datetime'],
          ['all_day','boolean','no','All-day event (default: false)'],
          ['description','string','no','Event notes'],
          ['location','string','no','Physical or virtual location'],
          ['color','string','no','Hex color code for display'],
          ['attendees','string[]','no','Attendee email addresses'],
        ]} />
      </Endpoint>
      <Endpoint method="PATCH" path="/calendar/{id}" desc="Update an event. All fields optional." />
      <Endpoint method="DELETE" path="/calendar/{id}" desc="Delete an event permanently." />
    </Section>
  );
}

function LabelsSection() {
  return (
    <Section id="labels" title="Labels">
      <Endpoint method="GET" path="/labels" desc="List all labels for the authenticated account." />
      <Endpoint method="POST" path="/labels" desc="Create a label.">
        <ParamTable rows={[
          ['name','string','yes','Label name'],
          ['color','string','yes','Hex color (e.g. #416758)'],
        ]} />
      </Endpoint>
      <Endpoint method="DELETE" path="/labels/{id}" desc="Delete a label and remove it from all messages." />
    </Section>
  );
}

function UsageSection() {
  return (
    <Section id="usage" title="Usage">
      <Endpoint method="GET" path="/mail/mailbox-usage" desc="Get per-mailbox usage statistics — storage, emails today, AI requests today.">
        <ParamTable rows={[['email','string','yes','Mailbox address']]} />
        <div className="border-t px-4 pt-3 pb-1">
          <CodeBlock lang="json">{`{
  "email": "you@example.com",
  "plan": "Pro",
  "storage": { "used_mb": 234.5, "limit_mb": 10240, "percentage": 2.3 },
  "emails_today": { "sent": 12, "limit": 500, "percentage": 2.4 },
  "ai_today": { "used": 5, "limit": 50, "unlimited": false, "percentage": 10.0 }
}`}</CodeBlock>
        </div>
      </Endpoint>
    </Section>
  );
}
