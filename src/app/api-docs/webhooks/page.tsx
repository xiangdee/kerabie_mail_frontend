import type { Metadata } from 'next';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Webhooks — API Docs',
  description: 'Real-time event notifications via webhooks. Email, mailbox, and domain events with HMAC signature verification.',
};

const HOSTING_PARTNER_EVENTS: [string, string][] = [
  ['partner_mailbox.created', 'A hosting partner provisions a client mailbox'],
  ['partner_mailbox.deleted', 'A hosting partner deletes a client mailbox'],
  ['partner_mailbox.renewed', "A mailbox's prepaid term is renewed"],
  ['partner_mailbox.expiring_soon', "A paid mailbox's term ends in ~7 days"],
  ['partner_domain.added', 'A hosting partner claims a client domain'],
  ['partner_domain.verified', 'A client domain passes DNS verification'],
  ['partner_domain.verification_failed', 'A client domain fails DNS verification'],
  ['partner_pool.purchased', 'A mailbox-slot pool purchase completes'],
  ['partner_addon.purchased', 'A domain-slot or storage add-on purchase completes'],
  ['partner_trial.expiring_soon', "A hosting partner's trial ends in ~7 days"],
];

export default function WebhooksDocsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto max-w-6xl px-4 py-12 flex gap-10">
        <aside className="hidden lg:block w-56 shrink-0">
          <div className="sticky top-8 space-y-1 text-sm">
            {[
              ['Overview','overview'],['Events','events'],['Payload','payload'],
              ['Threading','threading'],['Signature','signature'],['Retries','retries'],
              ['Use cases','usecases'],
            ].map(([l,id]) => (
              <a key={id} href={`#${id}`} className="block px-3 py-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">{l}</a>
            ))}
            <div className="pt-4 border-t space-y-1">
              <Link href="/api-docs" className="block px-3 py-1.5 text-primary hover:underline text-sm">← API Reference</Link>
              <Link href="/api-docs/partner" className="block px-3 py-1.5 text-primary hover:underline text-sm">Partner API →</Link>
            </div>
          </div>
        </aside>

        <main className="flex-1 min-w-0 space-y-16 text-[15px]">
          <div>
            <p className="text-sm text-muted-foreground mb-2"><Link href="/api-docs" className="hover:underline">API Docs</Link> / Webhooks</p>
            <h1 className="text-4xl font-bold mb-3">Webhooks</h1>
            <p className="text-muted-foreground text-lg">
              Webhooks deliver real-time HTTP POST notifications to your server when events happen in Kerabie Mail.
              Available on the <strong>Premium plan</strong>. Configure endpoints in <strong>Settings → Webhooks</strong>.
            </p>
            <p className="text-sm text-muted-foreground mt-3">
              Hosting partner? The <code className="bg-muted px-1 rounded text-xs">partner_*</code> events below use this exact
              same signing and retry mechanism — see the{' '}
              <Link href="/api-docs/partner#webhooks" className="text-primary hover:underline">Hosting Partner API docs</Link>{' '}
              for the full event list and create endpoints from <strong>Partner Dashboard → Developer</strong>.
            </p>
          </div>

          {/* Overview */}
          <section id="overview" className="scroll-mt-8">
            <h2 className="text-2xl font-bold mb-4 pb-3 border-b">Overview</h2>
            <div className="grid sm:grid-cols-3 gap-4 text-sm">
              {[
                { title: 'Endpoints', desc: 'Add up to 10 HTTPS endpoints per account. Each endpoint subscribes to a subset of events.' },
                { title: 'Delivery', desc: 'Payloads are delivered within seconds of the event. Retries run for up to 8 minutes on failure.' },
                { title: 'Security', desc: 'Every request is signed with HMAC-SHA256. Verify the signature before processing.' },
              ].map(({ title, desc }) => (
                <div key={title} className="border rounded-xl p-4">
                  <p className="font-semibold mb-1">{title}</p>
                  <p className="text-muted-foreground">{desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Events */}
          <section id="events" className="scroll-mt-8">
            <h2 className="text-2xl font-bold mb-4 pb-3 border-b">Events</h2>
            <div className="overflow-x-auto">
              <table className="w-full border rounded-xl text-sm">
                <thead className="bg-muted"><tr>
                  <th className="text-left p-3 font-semibold">Event</th>
                  <th className="text-left p-3 font-semibold">Triggered when</th>
                </tr></thead>
                <tbody className="divide-y text-muted-foreground">
                  {[
                    ['email.received','An email arrives in a mailbox (includes threading fields)'],
                    ['email.sent','An email is successfully sent'],
                    ['email.failed','Sending fails permanently (all retries exhausted)'],
                    ['email.opened','A tracked email is opened by the recipient'],
                    ['email.bounced','A sent email hard-bounces'],
                    ['email.spam_reported','Recipient marks the email as spam'],
                    ['email.forwarded','A forwarding rule delivers an email to another address'],
                    ['mailbox.created','A new mailbox is provisioned'],
                    ['mailbox.deleted','A mailbox is deleted'],
                    ['mailbox.quota_reached','Storage exceeds 90% of the mailbox quota'],
                    ['domain.verified','A custom domain passes DNS verification'],
                    ['domain.verification_failed','DNS verification fails after 3 attempts'],
                  ].map(([e, d]) => (
                    <tr key={e}>
                      <td className="p-3 font-mono text-xs text-foreground">{e}</td>
                      <td className="p-3">{d}</td>
                    </tr>
                  ))}
                  {HOSTING_PARTNER_EVENTS.map(([e, d]) => (
                    <tr key={e}>
                      <td className="p-3 font-mono text-xs text-foreground">{e}</td>
                      <td className="p-3">{d}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Payload */}
          <section id="payload" className="scroll-mt-8">
            <h2 className="text-2xl font-bold mb-4 pb-3 border-b">Payload structure</h2>
            <p className="text-muted-foreground mb-4">Every webhook POST has this envelope:</p>
            <pre className="bg-muted rounded-xl p-4 text-sm font-mono overflow-x-auto">{`{
  "event": "email.received",
  "timestamp": "2026-05-17T10:00:00Z",
  "webhook_id": "wh_1042",
  "data": { ... event-specific fields ... }
}`}</pre>

            <h3 className="text-lg font-semibold mt-8 mb-3">email.received data</h3>
            <pre className="bg-muted rounded-xl p-4 text-sm font-mono overflow-x-auto">{`{
  "message_id": "<abc123@kerabie.email>",
  "mailbox": "john@yourdomain.com",
  "from": "sender@example.com",
  "subject": "Re: Project update",
  "received_at": "2026-05-17T10:00:00Z",

  // Threading — use these to group conversations
  "thread_id": "a3f1c29d8e7b4012",     // stable 16-char SHA-256 prefix
  "in_reply_to": "<prev@example.com>", // Message-ID this replies to (null if new thread)
  "references": "<root@x.com> <prev@x.com>",  // full thread chain
  "is_reply": true,

  // Content preview — use for AI auto-respond without a separate inbox call
  "preview": "Hey John, just following up on...",

  "has_attachments": false,
  "size_bytes": 4200
}`}</pre>

            <h3 className="text-lg font-semibold mt-8 mb-3">email.opened data</h3>
            <pre className="bg-muted rounded-xl p-4 text-sm font-mono overflow-x-auto">{`{
  "message_id": "<abc123@kerabie.email>",
  "opened_at": "2026-05-17T11:30:00Z",
  "location_country": "NG",
  "client": "Apple Mail / macOS"
}`}</pre>

            <h3 className="text-lg font-semibold mt-8 mb-3">domain.verified data</h3>
            <pre className="bg-muted rounded-xl p-4 text-sm font-mono overflow-x-auto">{`{
  "domain": "yourdomain.com",
  "verified_at": "2026-05-17T10:05:00Z",
  "checks": { "mx": true, "spf": true, "dkim": true, "dmarc": true }
}`}</pre>
          </section>

          {/* Threading */}
          <section id="threading" className="scroll-mt-8">
            <h2 className="text-2xl font-bold mb-4 pb-3 border-b">Conversation threading</h2>
            <p className="text-muted-foreground mb-4">
              The <code className="bg-muted px-1 rounded text-xs">thread_id</code> field is a stable 16-character identifier
              derived from the email's <code className="bg-muted px-1 rounded text-xs">References</code> and{' '}
              <code className="bg-muted px-1 rounded text-xs">In-Reply-To</code> headers (or the normalised subject for
              new threads). Use it to group webhook events into conversations in your database.
            </p>

            <h3 className="text-lg font-semibold mb-3">CRM example — group emails by thread</h3>
            <pre className="bg-muted rounded-xl p-4 text-sm font-mono overflow-x-auto">{`// Receive webhook
const { event, data } = req.body

if (event === 'email.received') {
  const thread = await db.threads.upsert({
    where:  { id: data.thread_id },
    create: { id: data.thread_id, subject: data.subject, mailbox: data.mailbox },
    update: { last_received_at: data.received_at },
  })

  await db.messages.create({
    data: {
      thread_id:   thread.id,
      message_id:  data.message_id,
      from:        data.from,
      preview:     data.preview,
      received_at: data.received_at,
      is_reply:    data.is_reply,
    }
  })
}`}</pre>

            <h3 className="text-lg font-semibold mt-8 mb-3">AI auto-respond example</h3>
            <pre className="bg-muted rounded-xl p-4 text-sm font-mono overflow-x-auto">{`if (event === 'email.received' && data.is_reply) {
  // Fetch thread history from your DB for context
  const history = await db.messages
    .findMany({ where: { thread_id: data.thread_id }, orderBy: { received_at: 'asc' } })

  // Ask AI to draft a reply using the preview + history
  const draft = await generateReply({ preview: data.preview, history })

  // Send via Kerabie API
  await fetch('https://api.kerabie.email/mail/send', {
    method: 'POST',
    headers: { Authorization: \`Bearer \${API_KEY}\` },
    body: JSON.stringify({
      from_email: data.mailbox,
      to: [data.from],
      subject: 'Re: ' + data.subject,
      body_html: draft,
    })
  })
}`}</pre>
          </section>

          {/* Signature */}
          <section id="signature" className="scroll-mt-8">
            <h2 className="text-2xl font-bold mb-4 pb-3 border-b">Signature verification</h2>
            <p className="text-muted-foreground mb-4">
              Every webhook request includes an <code className="bg-muted px-1 rounded text-xs">X-Kerabie-Signature</code> header.
              Always verify this before processing the payload to prevent spoofed events.
            </p>
            <p className="text-muted-foreground mb-4">
              The signature format is <code className="bg-muted px-1 rounded text-xs">t=&#123;unix_timestamp&#125;,v1=&#123;hmac_hex&#125;</code>.
              The signed payload is <code className="bg-muted px-1 rounded text-xs">&#123;timestamp&#125;.&#123;json_body&#125;</code> (compact, no spaces).
              This prevents replay attacks — reject requests where <code className="bg-muted px-1 rounded text-xs">t</code> is more than 300 seconds old.
            </p>

            <h3 className="text-lg font-semibold mb-3">Node.js / TypeScript</h3>
            <pre className="bg-muted rounded-xl p-4 text-sm font-mono overflow-x-auto">{`import crypto from 'crypto'

function verifyWebhook(
  rawBody: Buffer,
  signatureHeader: string,
  secret: string
): boolean {
  const parts = Object.fromEntries(
    signatureHeader.split(',').map(p => p.split('='))
  ) as Record<string, string>

  const timestamp = parts['t']
  const receivedSig = parts['v1']

  // Reject stale requests (> 5 minutes)
  if (Math.abs(Date.now() / 1000 - Number(timestamp)) > 300) return false

  const sigPayload = \`\${timestamp}.\${rawBody.toString()}\`
  const expected = crypto
    .createHmac('sha256', secret)
    .update(sigPayload)
    .digest('hex')

  return crypto.timingSafeEqual(
    Buffer.from(expected),
    Buffer.from(receivedSig)
  )
}`}</pre>

            <h3 className="text-lg font-semibold mt-6 mb-3">Python</h3>
            <pre className="bg-muted rounded-xl p-4 text-sm font-mono overflow-x-auto">{`import hmac, hashlib, time

def verify_webhook(raw_body: bytes, signature_header: str, secret: str) -> bool:
    parts = dict(p.split('=', 1) for p in signature_header.split(','))
    timestamp = parts.get('t', '')
    received  = parts.get('v1', '')

    if abs(time.time() - float(timestamp)) > 300:
        return False  # Stale

    sig_payload = f"{timestamp}.".encode() + raw_body
    expected = hmac.new(secret.encode(), sig_payload, hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, received)`}</pre>
          </section>

          {/* Retries */}
          <section id="retries" className="scroll-mt-8">
            <h2 className="text-2xl font-bold mb-4 pb-3 border-b">Retry schedule</h2>
            <p className="text-muted-foreground mb-4">
              If your endpoint returns a non-2xx response or times out (10s), Kerabie retries with
              exponential backoff. After 5 failures the delivery is marked <strong>dead</strong> and
              no further retries occur. Dead deliveries appear in <strong>Settings → Webhooks → Delivery log</strong>.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full border rounded-xl text-sm">
                <thead className="bg-muted"><tr>
                  <th className="text-left p-3">Attempt</th>
                  <th className="text-left p-3">Delay after previous failure</th>
                  <th className="text-left p-3">Cumulative time</th>
                </tr></thead>
                <tbody className="divide-y text-muted-foreground">
                  {[['1','Immediate','0s'],['2','1 minute','1 min'],['3','2 minutes','3 min'],['4','4 minutes','7 min'],['5','8 minutes','15 min'],['Dead','—','15 min+']].map(([a,d,c]) => (
                    <tr key={a}><td className="p-3 font-medium text-foreground">{a}</td><td className="p-3">{d}</td><td className="p-3">{c}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-sm text-muted-foreground mt-3">
              Your endpoint must respond within <strong>10 seconds</strong>. For slow processing, respond immediately with 200 and handle the payload asynchronously.
            </p>
          </section>

          {/* Use cases */}
          <section id="usecases" className="scroll-mt-8">
            <h2 className="text-2xl font-bold mb-4 pb-3 border-b">Integration examples</h2>
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              {[
                { event: 'email.received', target: 'Slack', action: 'Post new email to #sales channel with sender, subject, and preview' },
                { event: 'email.received', target: 'CRM', action: 'Attach email to contact record; group by thread_id for conversation view' },
                { event: 'email.received', target: 'AI auto-responder', action: 'Use preview + thread history to draft and send a reply via the API' },
                { event: 'email.received', target: 'Notion / Airtable', action: 'Log incoming leads to a database row' },
                { event: 'email.opened', target: 'Mobile push', action: '"John opened your email" — close the feedback loop on important messages' },
                { event: 'email.bounced', target: 'Mailing list tool', action: 'Remove bounced addresses from future campaigns automatically' },
                { event: 'domain.verified', target: 'Onboarding flow', action: 'Trigger next onboarding step once DNS is confirmed' },
                { event: 'mailbox.quota_reached', target: 'Alert system', action: 'Notify admin before the mailbox stops receiving email' },
              ].map(({ event, target, action }) => (
                <div key={event + target} className="border rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{event}</code>
                    <span className="text-muted-foreground text-xs">→</span>
                    <span className="font-semibold text-sm">{target}</span>
                  </div>
                  <p className="text-muted-foreground text-xs">{action}</p>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>

      <Footer />
    </div>
  );
}
