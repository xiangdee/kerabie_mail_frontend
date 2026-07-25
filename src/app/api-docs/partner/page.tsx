import type { Metadata } from 'next';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Hosting Partner API — API Docs',
  description: 'Kerabie Mail Hosting Partner API — provision mailboxes and domains for your clients, buy add-ons, and get notified via webhooks, all programmatically.',
};

const BASE = 'https://api.kerabie.email';

export default function PartnerApiPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto max-w-6xl px-4 py-12 flex gap-10">
        <aside className="hidden lg:block w-56 shrink-0">
          <div className="sticky top-8 space-y-1 text-sm">
            {[
              ['Overview', 'overview'], ['Authentication', 'auth'], ['IP restrictions', 'ip'],
              ['Mailboxes', 'mailboxes'], ['Domains', 'domains'], ['Add-ons', 'addons'],
              ['Stats', 'stats'], ['Webhooks', 'webhooks'], ['Errors', 'errors'],
            ].map(([l, id]) => (
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
              <Link href="/api-docs" className="hover:underline">API Docs</Link> / Hosting Partner API
            </p>
            <h1 className="text-4xl font-bold mb-3">Hosting Partner API</h1>
            <p className="text-muted-foreground text-lg">
              The Hosting Partner API lets resellers provision mailboxes and domains for their own
              clients programmatically — the same actions available in the Partner dashboard, just
              callable from your own systems. Requires an approved, active or trial Hosting Partner account.
            </p>
            <div className="mt-4 p-4 bg-primary/5 border-l-4 border-primary rounded-r-xl text-sm">
              Apply for a hosting partner account, then create API keys from{' '}
              <strong>Partner Dashboard → Developer</strong>. Every request needs one client domain
              added and verified before you can provision a mailbox on it — see{' '}
              <a href="#domains" className="text-primary hover:underline">Domains</a> below.
            </div>
          </div>

          {/* Auth */}
          <section id="auth" className="scroll-mt-8">
            <h2 className="text-2xl font-bold mb-4 pb-3 border-b">Authentication</h2>
            <p className="text-muted-foreground mb-4">
              Include your API key in the <code className="bg-muted px-1 rounded text-xs">X-API-Key</code> header on every request:
            </p>
            <pre className="bg-muted rounded-xl p-4 text-sm font-mono overflow-x-auto">{`X-API-Key: ker_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx\nContent-Type: application/json`}</pre>

            <h3 className="text-lg font-semibold mt-6 mb-3">Scopes</h3>
            <p className="text-muted-foreground mb-4">
              Each key is created with one or more scopes. A request 403s if the key is missing a
              scope it needs — read-only integrations should only request <code className="bg-muted px-1 rounded text-xs">:read</code> scopes.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full border rounded-xl text-sm">
                <thead className="bg-muted"><tr>
                  <th className="text-left p-3 font-semibold">Scope</th>
                  <th className="text-left p-3 font-semibold">Grants</th>
                </tr></thead>
                <tbody className="divide-y text-muted-foreground">
                  {[
                    ['partner:mailboxes:read', 'List mailboxes'],
                    ['partner:mailboxes:write', 'Create, delete, and renew mailboxes'],
                    ['partner:domains:read', 'List domains and check verification status'],
                    ['partner:domains:write', 'Add, verify, and delete domains'],
                    ['partner:addons:read', 'Read add-on pricing and purchase status'],
                    ['partner:addons:write', 'Purchase domain-slot and storage add-ons'],
                    ['partner:stats:read', 'Read aggregate stats and account summary'],
                  ].map(([s, d]) => (
                    <tr key={s}><td className="p-3 font-mono text-xs text-foreground">{s}</td><td className="p-3">{d}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* IP restrictions */}
          <section id="ip" className="scroll-mt-8">
            <h2 className="text-2xl font-bold mb-4 pb-3 border-b">IP restrictions</h2>
            <p className="text-muted-foreground mb-4">
              Optionally lock a key down to specific source IPs (or CIDR ranges) when you create it.
              Both an allowlist and a blocklist can be set at once — the blocklist is checked first,
              so an IP that matches both is denied.
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 mb-4">
              <li><strong>allowed_ips</strong> — if set, only these IPs/CIDRs may use the key (everyone else gets <code className="bg-muted px-1 rounded text-xs">403</code>). Leave unset to allow any IP.</li>
              <li><strong>blocked_ips</strong> — these IPs/CIDRs are always rejected, even if also present in the allowlist.</li>
            </ul>
            <pre className="bg-muted rounded-xl p-4 text-sm font-mono overflow-x-auto">{`POST ${BASE}/api-keys
{
  "name": "Reseller panel integration",
  "scopes": ["partner:mailboxes:write", "partner:domains:read"],
  "allowed_ips": ["203.0.113.0/24"],
  "blocked_ips": ["198.51.100.0/24"]
}`}</pre>
          </section>

          {/* Mailboxes */}
          <section id="mailboxes" className="scroll-mt-8">
            <h2 className="text-2xl font-bold mb-4 pb-3 border-b">Mailboxes</h2>

            <EndpointBlock method="POST" path="/v1/hosting/mailboxes" desc="Provision a mailbox for a client. The domain must already be added and verified (see Domains below) — this fails with 400 otherwise.">
              <ParamTable rows={[
                ['domain_id', 'integer', 'yes', 'ID of one of your verified domains'],
                ['local_part', 'string', 'yes', "Part before the @ — full address is local_part@domain"],
                ['password', 'string', 'yes', 'Initial mailbox password (min 8 chars)'],
                ['display_name', 'string', 'no', 'Friendly name shown in email clients'],
                ['plan_id', 'string', 'yes', '"pro" (5GB) or "premium" (20GB) — drives the wholesale rate and storage tier'],
              ]} />
              <div className="border-t px-4 pt-3 pb-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Request</p>
                <pre className="bg-muted rounded-xl p-4 text-sm font-mono overflow-x-auto">{`{
  "domain_id": 3,
  "local_part": "john",
  "password": "SecurePass123!",
  "display_name": "John Smith",
  "plan_id": "premium"
}`}</pre>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 mt-4">Response 201</p>
                <pre className="bg-muted rounded-xl p-4 text-sm font-mono overflow-x-auto">{`{
  "id": 42,
  "email_address": "john@yourclientdomain.com",
  "domain": "yourclientdomain.com",
  "plan_type": "premium",
  "status": "active",
  "is_trial": false,
  "monthly_rate_usd": 6.0,
  "monthly_rate_ngn": 4500.0,
  "expires_at": "2026-08-23T18:17:16Z",
  "mailu_provisioned": true,
  "created_at": "2026-07-23T18:17:12Z"
}`}</pre>
              </div>
            </EndpointBlock>

            <EndpointBlock method="GET" path="/v1/hosting/mailboxes" desc="List mailboxes provisioned under your account.">
              <ParamTable rows={[['status', 'string', 'no', 'Filter by status: trial | active | expired | suspended']]} />
            </EndpointBlock>

            <EndpointBlock method="DELETE" path="/v1/hosting/mailboxes/{id}" desc="Permanently delete a mailbox and all its email. A prepaid slot already consumed by this mailbox is forfeited, not refunded." />

            <EndpointBlock method="POST" path="/v1/hosting/mailboxes/{id}/renew" desc="Consume one unused slot from your pool to extend a mailbox whose term has ended (or is ending soon), and re-enable it if it was disabled." />
          </section>

          {/* Domains */}
          <section id="domains" className="scroll-mt-8">
            <h2 className="text-2xl font-bold mb-4 pb-3 border-b">Domains</h2>
            <p className="text-muted-foreground mb-6">
              A client's domain has to be added and pass DNS verification before you can provision
              mailboxes on it — this proves you (or your client) actually control that domain's DNS,
              and confirms mail sent to it will actually reach Kerabie's mail servers. New accounts
              get 2 free domain slots; buy more via the <a href="#addons" className="text-primary hover:underline">add-ons</a> endpoint.
            </p>

            <EndpointBlock method="POST" path="/v1/hosting/domains" desc="Claim a client domain. Returns the DNS records to configure — the domain isn't usable until it's verified.">
              <ParamTable rows={[['domain_name', 'string', 'yes', 'Domain name (e.g. yourclientdomain.com)']]} />
              <div className="border-t px-4 pt-3 pb-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Response 201</p>
                <pre className="bg-muted rounded-xl p-4 text-sm font-mono overflow-x-auto">{`{
  "id": 3,
  "domain_name": "yourclientdomain.com",
  "status": "pending",
  "is_verified": false,
  "mailu_added": false,
  "dns_records": [
    { "type": "MX",  "host": "@", "value": "10 mail.kerabie.email",
      "description": "Routes incoming mail for this domain to Kerabie's mail servers." },
    { "type": "TXT", "host": "@", "value": "kerabie-verify=5kMm7kfncTQfgIx7lSOuLBU9",
      "description": "Proves you control this domain's DNS." },
    { "type": "TXT", "host": "@", "value": "v=spf1 mx include:sendinblue.com ~all",
      "description": "Authorizes Kerabie's mail servers (relayed via Brevo) to send email for this domain." },
    { "type": "TXT", "host": "_dmarc", "value": "v=DMARC1; p=none; rua=mailto:rua@dmarc.brevo.com",
      "description": "Protects this domain from spoofing and improves deliverability." },
    { "type": "CNAME", "host": "brevo1._domainkey", "value": "b1.yourclientdomain-com.dkim.brevo.com",
      "description": "Enables cryptographic signing (DKIM) of outgoing messages to improve delivery." },
    { "type": "CNAME", "host": "brevo2._domainkey", "value": "b2.yourclientdomain-com.dkim.brevo.com",
      "description": "Enables cryptographic signing (DKIM) of outgoing messages to improve delivery." }
  ]
}`}</pre>
                <p className="text-xs text-muted-foreground mt-3">
                  The two DKIM CNAME records are fetched from Brevo (this platform's outbound relay) the first
                  time the domain is added, and cached. If Brevo's API is briefly unreachable when you add a
                  domain, they'll be missing at first — every <code className="bg-muted px-1 rounded text-xs">verify</code> call
                  retries fetching them until they succeed, so re-checking verification will pick them up.
                </p>
              </div>
            </EndpointBlock>

            <EndpointBlock method="GET" path="/v1/hosting/domains" desc="List all domains claimed under your account, with DNS records for any that aren't verified yet." />

            <EndpointBlock method="GET" path="/v1/hosting/domains/{id}" desc="Check a single domain's status — the intended target for polling while waiting on DNS propagation." />

            <EndpointBlock method="POST" path="/v1/hosting/domains/{id}/verify" desc="Re-check DNS now. On success, the domain is registered in Mailu and ready for mailboxes. A partner_domain.verified or partner_domain.verification_failed webhook fires on the first state change.">
              <div className="border-t px-4 pt-3 pb-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Response 200 (verified)</p>
                <pre className="bg-muted rounded-xl p-4 text-sm font-mono overflow-x-auto">{`{
  "id": 3,
  "domain_name": "yourclientdomain.com",
  "status": "verified",
  "is_verified": true,
  "mailu_added": true,
  "verified_at": "2026-07-23T18:15:05Z",
  "dns_records": null
}`}</pre>
              </div>
            </EndpointBlock>

            <EndpointBlock method="DELETE" path="/v1/hosting/domains/{id}" desc="Remove a domain. Fails with 409 if any mailboxes still use it — delete those first." />
          </section>

          {/* Add-ons */}
          <section id="addons" className="scroll-mt-8">
            <h2 className="text-2xl font-bold mb-4 pb-3 border-b">Add-ons</h2>
            <p className="text-muted-foreground mb-6">
              Two purchasable add-ons, billed once via Flutterwave (card or, for NGN accounts, direct
              bank transfer): extra domain slots, and extra per-mailbox storage. Mailbox <em>count</em>{' '}
              is a separate thing — see the slot pool purchase flow in the Partner dashboard.
            </p>

            <EndpointBlock method="GET" path="/v1/hosting/addons/pricing" desc="Current unit prices in your account's currency, plus your current domain limit/usage and storage bonus.">
              <div className="border-t px-4 pt-3 pb-4">
                <pre className="bg-muted rounded-xl p-4 text-sm font-mono overflow-x-auto">{`{
  "currency_code": "NGN",
  "domain_slot_unit_price": 4000.0,
  "storage_gb_unit_price": 800.0,
  "domain_limit": 2,
  "domains_used": 1,
  "extra_storage_mb": 0
}`}</pre>
              </div>
            </EndpointBlock>

            <EndpointBlock method="POST" path="/v1/hosting/addons/purchase" desc="Buy N domain slots or N GB of extra storage. Returns a checkout URL (card) or a bank account to transfer to (bank_transfer, NGN only). The add-on activates once payment confirms — poll the verify endpoint below, or subscribe to partner_addon.purchased.">
              <ParamTable rows={[
                ['addon_type', 'string', 'yes', '"domain_slot" or "storage"'],
                ['quantity', 'integer', 'yes', 'Number of slots (domain_slot) or GB (storage)'],
                ['payment_method', 'string', 'no', '"card" (default) or "bank_transfer"'],
                ['return_url', 'string', 'yes', 'Where the card checkout redirects back to'],
              ]} />
            </EndpointBlock>

            <EndpointBlock method="POST" path="/v1/hosting/addons/purchase/verify" desc="Fallback check if a webhook hasn't landed yet — pass the purchase reference to re-check payment status directly.">
              <ParamTable rows={[['reference', 'string', 'yes', 'The reference returned from the purchase call']]} />
            </EndpointBlock>
          </section>

          {/* Stats */}
          <section id="stats" className="scroll-mt-8">
            <h2 className="text-2xl font-bold mb-4 pb-3 border-b">Stats</h2>
            <EndpointBlock method="GET" path="/v1/hosting/stats" desc="Aggregate counts for dashboards — also surfaces DNS setup records for any domain still waiting on verification.">
              <div className="border-t px-4 pt-3 pb-4">
                <pre className="bg-muted rounded-xl p-4 text-sm font-mono overflow-x-auto">{`{
  "mailboxes_total": 12,
  "mailboxes_by_status": { "active": 10, "expired": 2 },
  "mailboxes_by_plan": { "pro": 8, "premium": 4 },
  "slots_unused": 3,
  "slots_assigned": 10,
  "slots_expired": 2,
  "domains_total": 4,
  "domains_verified": 3,
  "domains_pending": 1,
  "domain_limit": 5,
  "extra_storage_mb": 2048,
  "pending_domain_setup": [
    { "domain_id": 7, "domain_name": "pending-client.com", "status": "pending", "dns_records": [ /* ... */ ] }
  ]
}`}</pre>
              </div>
            </EndpointBlock>
            <EndpointBlock method="GET" path="/v1/hosting/summary" desc="Trial status, wholesale plan rates, and unused-slot count — the same data the dashboard overview page shows." />
          </section>

          {/* Webhooks */}
          <section id="webhooks" className="scroll-mt-8">
            <h2 className="text-2xl font-bold mb-4 pb-3 border-b">Webhooks</h2>
            <p className="text-muted-foreground mb-4">
              Hosting-partner events use the exact same delivery mechanism as the rest of the
              platform — HMAC-SHA256 signed, retried with exponential backoff. See the{' '}
              <Link href="/api-docs/webhooks#signature" className="text-primary hover:underline">Webhooks docs</Link>{' '}
              for signature verification code and the retry schedule. Create endpoints from{' '}
              <strong>Partner Dashboard → Developer</strong> or <code className="bg-muted px-1 rounded text-xs">POST /webhooks</code>.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full border rounded-xl text-sm">
                <thead className="bg-muted"><tr>
                  <th className="text-left p-3 font-semibold">Event</th>
                  <th className="text-left p-3 font-semibold">Triggered when</th>
                </tr></thead>
                <tbody className="divide-y text-muted-foreground">
                  {[
                    ['partner_mailbox.created', 'A mailbox is provisioned (dashboard or API)'],
                    ['partner_mailbox.deleted', 'A mailbox is deleted'],
                    ['partner_mailbox.renewed', 'A mailbox\'s term is renewed'],
                    ['partner_mailbox.expiring_soon', "A paid mailbox's term ends in ~7 days"],
                    ['partner_domain.added', 'A client domain is claimed'],
                    ['partner_domain.verified', 'A domain passes DNS verification (first time only)'],
                    ['partner_domain.verification_failed', 'A verification check fails'],
                    ['partner_pool.purchased', 'A mailbox-slot pool purchase completes'],
                    ['partner_addon.purchased', 'A domain-slot or storage add-on purchase completes'],
                    ['partner_trial.expiring_soon', "Your hosting trial ends in ~7 days"],
                  ].map(([e, d]) => (
                    <tr key={e}>
                      <td className="p-3 font-mono text-xs text-foreground">{e}</td>
                      <td className="p-3">{d}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Errors */}
          <section id="errors" className="scroll-mt-8">
            <h2 className="text-2xl font-bold mb-4 pb-3 border-b">Errors</h2>
            <div className="overflow-x-auto">
              <table className="w-full border rounded-xl text-sm">
                <thead className="bg-muted"><tr>
                  <th className="text-left p-3">Code</th><th className="text-left p-3">Meaning</th>
                </tr></thead>
                <tbody className="divide-y text-muted-foreground">
                  {[
                    ['400', 'Bad request — e.g. invalid domain name, or provisioning on an unverified domain'],
                    ['401', 'Missing, invalid, revoked, or expired API key'],
                    ['402', 'Payment required — no mailbox slots, or domain limit reached'],
                    ['403', 'IP blocked/not allowlisted for this key, missing scope, or hosting account not active/trial'],
                    ['404', 'Resource not found (or not yours)'],
                    ['409', "Domain already claimed, mailbox already exists, or domain still has mailboxes on it"],
                  ].map(([c, m]) => (
                    <tr key={c}><td className="p-3 font-mono font-medium text-foreground">{c}</td><td className="p-3">{m}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
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
