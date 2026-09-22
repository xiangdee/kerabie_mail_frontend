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
              ['Mailboxes', 'mailboxes'], ['Domains', 'domains'], ['Clients', 'clients'],
              ['Settings', 'settings'],
              ['White-labeling', 'white-labeling'], ['Pay-as-you-go', 'pay-as-you-go'],
              ['Mailbox management', 'mailbox-management'],
              ['Add-ons', 'addons'],
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
                    ['partner:settings:write', 'Change account-wide settings (e.g. the default client lapse policy)'],
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
                ['funding_mode', 'string', 'no', '"slot" (default, draws from your prepaid pool/trial) or "pay_as_you_go" — see the Pay-as-you-go section below'],
                ['return_url', 'string', 'conditional', 'Required when funding_mode="pay_as_you_go" — where the client\'s Bachs checkout redirects after payment'],
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
              <ParamTable rows={[
                ['domain_name', 'string', 'yes', 'Domain name (e.g. yourclientdomain.com)'],
                ['client_id', 'integer', 'no', 'Attach to an existing client (see Clients below) — omit to auto-create a new one named after the domain'],
              ]} />
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
      "description": "Routes incoming mail for this domain to Kerabie's mail servers.",
      "ok": null, "found_value": null, "reason": null },
    { "type": "TXT", "host": "@", "value": "kerabie-verify=5kMm7kfncTQfgIx7lSOuLBU9",
      "description": "Proves you control this domain's DNS.",
      "ok": null, "found_value": null, "reason": null },
    { "type": "TXT", "host": "@", "value": "v=spf1 mx include:relay.kerabie.email ~all",
      "description": "Authorizes Kerabie's mail servers to send email for this domain.",
      "ok": null, "found_value": null, "reason": null },
    { "type": "TXT", "host": "_dmarc", "value": "v=DMARC1; p=none; rua=mailto:dmarc@kerabie.email",
      "description": "Protects this domain from spoofing and improves deliverability.",
      "ok": null, "found_value": null, "reason": null },
    { "type": "TXT", "host": "dkim._domainkey", "value": "v=DKIM1; k=rsa; p=MIIBIjANBgkq...",
      "description": "Enables cryptographic signing (DKIM) of outgoing messages to improve delivery.",
      "ok": null, "found_value": null, "reason": null }
  ]
}`}</pre>
                <p className="text-xs text-muted-foreground mt-3">
                  The DKIM TXT record is generated natively by Mailu the first time the domain is added,
                  and cached. <code className="bg-muted px-1 rounded text-xs">ok</code>/<code className="bg-muted px-1 rounded text-xs">found_value</code>/<code className="bg-muted px-1 rounded text-xs">reason</code> are
                  always <code className="bg-muted px-1 rounded text-xs">null</code> here — nothing has been
                  checked yet. They're populated by the <code className="bg-muted px-1 rounded text-xs">verify</code> call below.
                </p>
              </div>
            </EndpointBlock>

            <EndpointBlock method="GET" path="/v1/hosting/domains" desc="List all domains claimed under your account, with DNS records (and their last check result) for any that still need attention." />

            <EndpointBlock method="GET" path="/v1/hosting/domains/{id}" desc="Check a single domain's status — the intended target for polling while waiting on DNS propagation." />

            <EndpointBlock method="POST" path="/v1/hosting/domains/{id}/verify" desc="Re-check DNS now — every call, not just while still pending, since verifying only requires MX + the ownership TXT token but SPF/DMARC/DKIM are checked and reported too and can still be wrong on an already-verified domain. On success, the domain is registered in Mailu and ready for mailboxes. A partner_domain.verified or partner_domain.verification_failed webhook fires on the first state change.">
              <div className="border-t px-4 pt-3 pb-4 space-y-4">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Response 200 — some records still wrong
                  </p>
                  <p className="text-xs text-muted-foreground mb-2">
                    A real example: 4 of 5 records were configured correctly, but the domain's registrar
                    (Namecheap) had its own Email Forwarding feature still overriding the MX record.
                    <code className="bg-muted px-1 rounded text-xs">reason</code> names the specific
                    problem instead of a generic "not verified" — this is the whole reason these three
                    fields exist.
                  </p>
                  <pre className="bg-muted rounded-xl p-4 text-sm font-mono overflow-x-auto">{`{
  "id": 3,
  "domain_name": "yourclientdomain.com",
  "status": "failed",
  "is_verified": false,
  "dns_records": [
    { "type": "MX", "host": "@", "value": "10 mail.kerabie.email",
      "ok": false, "found_value": "10 eforward2.registrar-servers.com",
      "reason": "Found eforward2.registrar-servers.com instead of mail.kerabie.email — looks like Namecheap Email Forwarding is still enabled for this domain. Disable it (or make sure Custom MX is the selected mail-handling mode) so this record actually takes effect." },
    { "type": "TXT", "host": "@", "value": "kerabie-verify=...",
      "ok": true, "found_value": "kerabie-verify=...", "reason": null },
    { "type": "TXT", "host": "@", "value": "v=spf1 mx include:relay.kerabie.email ~all",
      "ok": true, "found_value": "v=spf1 mx include:relay.kerabie.email ~all", "reason": null },
    { "type": "TXT", "host": "_dmarc", "value": "v=DMARC1; p=none; ...",
      "ok": true, "found_value": "v=DMARC1; p=none; ...", "reason": null },
    { "type": "TXT", "host": "dkim._domainkey", "value": "v=DKIM1; k=rsa; p=...",
      "ok": true, "found_value": "v=DKIM1; k=rsa; p=...", "reason": null }
  ]
}`}</pre>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Response 200 — verified</p>
                  <pre className="bg-muted rounded-xl p-4 text-sm font-mono overflow-x-auto">{`{
  "id": 3,
  "domain_name": "yourclientdomain.com",
  "status": "verified",
  "is_verified": true,
  "mailu_added": true,
  "verified_at": "2026-07-23T18:15:05Z",
  "dns_records": null
}`}</pre>
                  <p className="text-xs text-muted-foreground mt-2">
                    <code className="bg-muted px-1 rounded text-xs">dns_records</code> goes back to{' '}
                    <code className="bg-muted px-1 rounded text-xs">null</code> once every record checks
                    out — it's non-null whenever there's something worth showing: still pending, or
                    verified but with an SPF/DMARC/DKIM record still wrong (verification itself only
                    requires MX + the ownership token).
                  </p>
                </div>
              </div>
            </EndpointBlock>

            <EndpointBlock method="DELETE" path="/v1/hosting/domains/{id}" desc="Remove a domain. Fails with 409 if any mailboxes still use it — delete those first." />
          </section>

          {/* Clients */}
          <section id="clients" className="scroll-mt-8">
            <h2 className="text-2xl font-bold mb-4 pb-3 border-b">Clients</h2>
            <p className="text-muted-foreground mb-6">
              A client is your real-world customer — the entity a domain (and, through it, every
              mailbox provisioned on that domain) belongs to. One client can own several domains.
              Every domain is attached to exactly one client; adding a domain without a{' '}
              <code className="bg-muted px-1 rounded text-xs">client_id</code> auto-creates a new
              single-domain client named after it, so you never have to think about this if you don&apos;t
              need the grouping. Each client also carries its own optional{' '}
              <code className="bg-muted px-1 rounded text-xs">lapse_action_override</code>, which takes
              priority over your account-wide default (see <a href="#settings" className="text-primary hover:underline">Settings</a> below)
              for what happens when one of that client&apos;s mailboxes lapses.
            </p>

            <EndpointBlock method="GET" path="/v1/hosting/clients" desc="List your clients, each with its domain/mailbox counts and resolved lapse override." />

            <EndpointBlock method="POST" path="/v1/hosting/clients" desc="Create a client.">
              <ParamTable rows={[['name', 'string', 'yes', 'Display name, e.g. "Acme Corp"']]} />
              <div className="border-t px-4 pt-3 pb-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Response 201</p>
                <pre className="bg-muted rounded-xl p-4 text-sm font-mono overflow-x-auto">{`{
  "id": 7,
  "name": "Acme Corp",
  "lapse_action_override": null,
  "domain_count": 0,
  "mailbox_count": 0,
  "created_at": "2026-09-22T10:00:00Z"
}`}</pre>
              </div>
            </EndpointBlock>

            <EndpointBlock method="PATCH" path="/v1/hosting/clients/{id}" desc="Rename a client and/or set its lapse policy override.">
              <ParamTable rows={[
                ['name', 'string', 'no', 'New display name'],
                ['lapse_action_override', 'string', 'no', '"suspend" | "downgrade_free" | null — null clears the override, falling back to your account default'],
              ]} />
            </EndpointBlock>

            <EndpointBlock method="DELETE" path="/v1/hosting/clients/{id}" desc="Remove a client. Fails with 409 if any domains still belong to it — reassign or delete those first." />
          </section>

          {/* Settings */}
          <section id="settings" className="scroll-mt-8">
            <h2 className="text-2xl font-bold mb-4 pb-3 border-b">Settings</h2>
            <p className="text-muted-foreground mb-6">
              Account-wide hosting settings. Today this is just the default lapse policy — what
              happens to a client&apos;s mailbox when its trial/prepaid term ends, or a pay-as-you-go
              payment fails: <code className="bg-muted px-1 rounded text-xs">suspend</code> locks it
              out entirely (the only behavior before this setting existed), while{' '}
              <code className="bg-muted px-1 rounded text-xs">downgrade_free</code> keeps it reachable
              on the Free plan instead. A client&apos;s own <code className="bg-muted px-1 rounded text-xs">lapse_action_override</code> (see{' '}
              <a href="#clients" className="text-primary hover:underline">Clients</a> above) takes priority over this default.
            </p>

            <EndpointBlock method="PATCH" path="/v1/hosting/settings" desc="Set your account-wide default lapse policy.">
              <ParamTable rows={[['default_client_lapse_action', 'string', 'yes', '"suspend" or "downgrade_free"']]} />
              <div className="border-t px-4 pt-3 pb-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Request</p>
                <pre className="bg-muted rounded-xl p-4 text-sm font-mono overflow-x-auto">{`{ "default_client_lapse_action": "downgrade_free" }`}</pre>
              </div>
            </EndpointBlock>
          </section>

          {/* White-labeling */}
          <section id="white-labeling" className="scroll-mt-8">
            <h2 className="text-2xl font-bold mb-4 pb-3 border-b">White-labeling</h2>
            <p className="text-muted-foreground mb-4">
              An active or trial hosting account can replace Kerabie&apos;s own name, logo, and colors
              with your own — shown on the sign-in page, the logged-in sidebar, and the browser tab
              icon. It only ever appears on <strong>your own custom webmail domain</strong> (below);
              logging in via the shared <code className="bg-muted px-1 rounded text-xs">webmail.kerabie.email</code>{' '}
              always shows plain Kerabie branding, even for your own clients.
            </p>
            <p className="text-muted-foreground mb-6">
              Both of these are managed from the dashboard (<strong>Settings → Branding</strong> and{' '}
              <strong>Hosting → Webmail Domain</strong>) rather than the API-key surface documented
              elsewhere on this page — they read from your logged-in session, not an{' '}
              <code className="bg-muted px-1 rounded text-xs">X-API-Key</code>.
            </p>

            <h3 className="text-lg font-semibold mt-6 mb-3">Custom webmail domain</h3>
            <p className="text-muted-foreground mb-4">
              Pick a hostname you control — e.g. <code className="bg-muted px-1 rounded text-xs">webmail.yourbrand.com</code> —
              and point it at Kerabie with a single CNAME record:
            </p>
            <pre className="bg-muted rounded-xl p-4 text-sm font-mono overflow-x-auto mb-4">{`CNAME  webmail.yourbrand.com  →  webmail.kerabie.email`}</pre>
            <p className="text-muted-foreground mb-4">
              Only one domain per account at a time — remove the existing one before adding a
              replacement. Once DNS resolves correctly the domain flips to <code className="bg-muted px-1 rounded text-xs">verified</code> automatically
              (checked on a short poll, or immediately via a manual re-check) and a TLS certificate
              is issued the first time it's actually visited over HTTPS — nothing further to configure.
            </p>

            <h3 className="text-lg font-semibold mt-6 mb-3">Branding</h3>
            <p className="text-muted-foreground mb-4">Four fields, all optional and independently settable:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 mb-4">
              <li><strong>Brand name</strong> — replaces &quot;Kerabie WebMail&quot; throughout.</li>
              <li><strong>Logo</strong> — a public image URL (upload one from the dashboard and it fills this in for you).</li>
              <li>
                <strong>Primary / secondary color</strong> — a hex color (<code className="bg-muted px-1 rounded text-xs">#7c3aed</code>) or
                a CSS gradient (<code className="bg-muted px-1 rounded text-xs">linear-gradient(90deg, #7c3aed, #db2777)</code>).
                Primary drives buttons and accents; secondary is optional and used where a second tone is needed.
              </li>
            </ul>
            <p className="text-muted-foreground">
              Saving branding requires the custom domain condition above (an active/trial hosting
              account) — attempting to save on a pending or expired account returns <code className="bg-muted px-1 rounded text-xs">403</code>.
            </p>
          </section>

          {/* Pay-as-you-go */}
          <section id="pay-as-you-go" className="scroll-mt-8">
            <h2 className="text-2xl font-bold mb-4 pb-3 border-b">Pay-as-you-go mailboxes</h2>
            <p className="text-muted-foreground mb-4">
              An alternative to buying mailbox slots upfront: the <strong>client pays Kerabie
              directly</strong>, on a recurring monthly basis, at a retail price <strong>you
              set</strong> — you never pay anything upfront, and instead earn the markup over
              Kerabie&apos;s wholesale rate as a revenue share, credited to your payout balance
              (<code className="bg-muted px-1 rounded text-xs">GET/POST /partners/me/payouts</code>{' '}
              — same balance and withdrawal flow referral commissions use).
            </p>
            <p className="text-muted-foreground mb-6">
              Currently USD and NGN only (matching the rest of the platform&apos;s billing), and
              monthly billing only — the multi-cycle terms (yearly/biennial/triennial) that the
              prepaid slot pool supports don&apos;t apply here.
            </p>

            <h3 className="text-lg font-semibold mt-6 mb-3">1. Set your retail price</h3>
            <EndpointBlock method="GET" path="/v1/hosting/retail-pricing" desc="Your current retail price per plan tier/currency, plus the wholesale floor (Kerabie's own cost) for each — retail_price is null until you've set one." />
            <EndpointBlock method="PUT" path="/v1/hosting/retail-pricing" desc="Set (or change) your retail price for one plan tier/currency. Rejected with 400 if below the wholesale floor. Creates or updates a real recurring billing product behind the scenes — takes a moment the first time.">
              <ParamTable rows={[
                ['plan_type', 'string', 'yes', '"pro" or "premium"'],
                ['currency', 'string', 'yes', '"usd" or "ngn"'],
                ['retail_price', 'number', 'yes', 'Must be ≥ the wholesale rate for this tier/currency'],
              ]} />
              <div className="border-t px-4 pt-3 pb-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Request</p>
                <pre className="bg-muted rounded-xl p-4 text-sm font-mono overflow-x-auto">{`{ "plan_type": "pro", "currency": "usd", "retail_price": 5.00 }`}</pre>
              </div>
            </EndpointBlock>

            <h3 className="text-lg font-semibold mt-6 mb-3">2. Provision with funding_mode=&quot;pay_as_you_go&quot;</h3>
            <p className="text-muted-foreground mb-4">
              Same <code className="bg-muted px-1 rounded text-xs">POST /v1/hosting/mailboxes</code> call
              as any mailbox (see Mailboxes above), with <code className="bg-muted px-1 rounded text-xs">funding_mode:
              &quot;pay_as_you_go&quot;</code> and a <code className="bg-muted px-1 rounded text-xs">return_url</code>.
              A retail price must already be set for that plan tier/currency (step 1) or this 400s.
              The mailbox account is created immediately — the client can see it&apos;s ready — but
              stays disabled and <code className="bg-muted px-1 rounded text-xs">status:
              &quot;pending_payment&quot;</code> until payment clears. The response includes a{' '}
              <code className="bg-muted px-1 rounded text-xs">checkout_url</code>: send this to your
              client to complete.
            </p>
            <div className="border-t px-4 pt-3 pb-4 border rounded-xl">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Response 201</p>
              <pre className="bg-muted rounded-xl p-4 text-sm font-mono overflow-x-auto">{`{
  "id": 8,
  "email_address": "client@yourclientdomain.com",
  "status": "pending_payment",
  "is_pay_as_you_go": true,
  "checkout_url": "https://checkout.bachs.io/c/6a5wgGmDy7coMgg"
}`}</pre>
            </div>

            <h3 className="text-lg font-semibold mt-6 mb-3">3. Get notified when payment clears</h3>
            <p className="text-muted-foreground mb-4">
              Kerabie handles all recurring billing and dunning — you never see a checkout flow or
              a raw payment status. Instead, listen for these webhook events (see Webhooks below
              for signature verification):
            </p>
            <div className="overflow-x-auto mb-4">
              <table className="w-full border rounded-xl text-sm">
                <thead className="bg-muted"><tr>
                  <th className="text-left p-3 font-semibold">Event</th>
                  <th className="text-left p-3 font-semibold">Fires when</th>
                </tr></thead>
                <tbody className="divide-y text-muted-foreground">
                  {[
                    ['partner_mailbox.payment_confirmed', 'The client\'s payment clears — the mailbox is (re-)enabled. Fires on the FIRST payment and on every monthly renewal, not just once.'],
                    ['partner_mailbox.payment_failed', 'A renewal charge fails — the mailbox is disabled until it\'s paid (Kerabie runs the retry/dunning schedule).'],
                    ['partner_mailbox.expired', 'The client cancels — the mailbox is disabled and marked expired.'],
                    ['partner_mailbox.payment_abandoned', 'The client never completed the FIRST payment and the 7-day grace period (below) ran out — the mailbox and its account are gone, not just disabled.'],
                  ].map(([e, d]) => (
                    <tr key={e}><td className="p-3 font-mono text-xs text-foreground">{e}</td><td className="p-3">{d}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-muted-foreground">
              Use <code className="bg-muted px-1 rounded text-xs">partner_mailbox.payment_confirmed</code> to
              verify a client actually paid — don&apos;t rely on the browser reaching your{' '}
              <code className="bg-muted px-1 rounded text-xs">return_url</code> alone, since a
              client can close the tab before the redirect, or the checkout page can be revisited
              without a real payment.
            </p>

            <h3 className="text-lg font-semibold mt-6 mb-3">4. Polling, as an alternative to webhooks</h3>
            <p className="text-muted-foreground mb-4">
              If you&apos;d rather poll than expose a webhook receiver,{' '}
              <code className="bg-muted px-1 rounded text-xs">GET /v1/hosting/mailboxes/{'{id}'}</code>{' '}
              returns the same <code className="bg-muted px-1 rounded text-xs">status</code> a webhook would tell
              you about, and — while <code className="bg-muted px-1 rounded text-xs">status</code> is still{' '}
              <code className="bg-muted px-1 rounded text-xs">&quot;pending_payment&quot;</code> — re-returns the
              same <code className="bg-muted px-1 rounded text-xs">checkout_url</code> from step 2, in case the
              client lost the link before you had a chance to save it.
            </p>
            <EndpointBlock method="GET" path="/v1/hosting/mailboxes/{id}" desc="Current status of a single mailbox. checkout_url is only populated while status is pending_payment; null once paid." />

            <h3 className="text-lg font-semibold mt-6 mb-3">5. Unpaid mailboxes expire automatically</h3>
            <p className="text-muted-foreground mb-4">
              A client who never completes the first payment isn&apos;t left provisioned forever: if{' '}
              <code className="bg-muted px-1 rounded text-xs">status</code> is still{' '}
              <code className="bg-muted px-1 rounded text-xs">&quot;pending_payment&quot;</code> 7 days after
              creation, Kerabie deletes the mailbox <strong>and</strong> the account behind it
              automatically and fires <code className="bg-muted px-1 rounded text-xs">partner_mailbox.payment_abandoned</code>.
              Nothing real ever activated on that account, so there&apos;s no customer data to preserve.
            </p>
            <p className="text-muted-foreground">
              This is also why{' '}
              <code className="bg-muted px-1 rounded text-xs">DELETE /v1/hosting/mailboxes/{'{id}'}</code>{' '}
              behaves differently depending on whether the mailbox ever got paid: deleting a mailbox that&apos;s
              still <code className="bg-muted px-1 rounded text-xs">&quot;pending_payment&quot;</code> deletes the
              underlying account too, same as the automatic 7-day cleanup — there&apos;s nothing to keep.
              Deleting any other mailbox (already active, whether pay-as-you-go or slot-funded) only deactivates
              the account and removes the mailbox/slot; the account&apos;s data (subscription, mail, forwarding
              rules) is left intact in case it needs to be looked up later.
            </p>

            <h3 className="text-lg font-semibold mt-6 mb-3">6. Manage a client&apos;s subscription</h3>
            <p className="text-muted-foreground mb-4">
              Once a pay-as-you-go mailbox is active, you can check its billing status, cancel it,
              move the client to a different plan tier, or sell them an add-on — all without them
              ever needing to log in anywhere themselves. These only work for{' '}
              <code className="bg-muted px-1 rounded text-xs">is_pay_as_you_go: true</code> mailboxes;
              calling any of them on a slot-funded mailbox returns <code className="bg-muted px-1 rounded text-xs">400</code>{' '}
              — manage those with <code className="bg-muted px-1 rounded text-xs">renew</code>/<code className="bg-muted px-1 rounded text-xs">DELETE</code> instead.
            </p>

            <EndpointBlock method="GET" path="/v1/hosting/mailboxes/{id}/subscription" desc="Live billing status for one mailbox's underlying subscription — plan, price, current period, next renewal date, auto_renew.">
              <div className="border-t px-4 pt-3 pb-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Response 200</p>
                <pre className="bg-muted rounded-xl p-4 text-sm font-mono overflow-x-auto">{`{
  "mailbox_id": 8,
  "plan_type": "premium",
  "billing_cycle": "monthly",
  "status": "active",
  "currency": "usd",
  "total_price": 6.0,
  "current_period_start": "2026-09-05",
  "current_period_end": "2026-10-05",
  "next_billing_date": "2026-10-05",
  "auto_renew": true,
  "payment_provider": "bachs"
}`}</pre>
              </div>
            </EndpointBlock>

            <EndpointBlock method="POST" path="/v1/hosting/mailboxes/{id}/cancel-subscription" desc="Stop future charges for this client — at the end of the current period by default, or immediately. Doesn't delete the mailbox itself; call DELETE /mailboxes/{id} separately if you want that too.">
              <ParamTable rows={[
                ['immediate', 'boolean', 'no', 'Cancel right away instead of at period end (default false)'],
              ]} />
            </EndpointBlock>

            <EndpointBlock method="POST" path="/v1/hosting/mailboxes/{id}/upgrade" desc="Move the client to a different plan tier (pro <-> premium), billed at YOUR retail price for that tier — never Kerabie's standard price. Requires a retail price already set for the target plan/currency (step 1) or this 400s.">
              <ParamTable rows={[
                ['new_plan_type', 'string', 'yes', '"pro" or "premium" — must differ from the mailbox\'s current plan'],
              ]} />
            </EndpointBlock>

            <EndpointBlock method="POST" path="/v1/hosting/mailboxes/{id}/addons/purchase" desc="Sell the client an extra mailbox or extra storage add-on, at Kerabie's standard add-on price (add-ons sit outside your retail pricing). Returns a checkout URL for the client to pay — same pattern as step 2's mailbox checkout.">
              <ParamTable rows={[
                ['type', 'string', 'yes', '"extra_mailbox" or "extra_storage"'],
                ['quantity', 'integer', 'no', 'Default 1'],
                ['return_url', 'string', 'yes', 'Where the client\'s checkout redirects after payment'],
              ]} />
              <div className="border-t px-4 pt-3 pb-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Response 200</p>
                <pre className="bg-muted rounded-xl p-4 text-sm font-mono overflow-x-auto">{`{
  "payment_method_id": 91,
  "checkout_url": "https://checkout.bachs.io/c/9fK2mQwLp0aXcRt",
  "status": "pending_payment"
}`}</pre>
              </div>
            </EndpointBlock>
          </section>

          {/* Mailbox management */}
          <section id="mailbox-management" className="scroll-mt-8">
            <h2 className="text-2xl font-bold mb-4 pb-3 border-b">Mailbox management</h2>
            <p className="text-muted-foreground mb-4">
              The full toolset a client would get if they ever logged into Kerabie directly —
              forwarding rules, aliases, signature/sender name, contacts, and campaigns — all
              available on their behalf through your own systems, since there&apos;s no
              end-customer self-service portal. Every endpoint below takes the mailbox&apos;s{' '}
              <code className="bg-muted px-1 rounded text-xs">id</code> from Mailboxes above.
            </p>

            <h3 className="text-lg font-semibold mt-6 mb-3">Forwarding</h3>
            <EndpointBlock method="GET" path="/v1/hosting/mailboxes/{id}/forwarding" desc="List forwarding rules on this mailbox." />
            <EndpointBlock method="POST" path="/v1/hosting/mailboxes/{id}/forwarding" desc="Create a forwarding rule. Only one active rule per mailbox — delete the existing one first. The destination address gets a confirmation email; mail doesn't actually forward until they confirm it.">
              <ParamTable rows={[
                ['email', 'string', 'yes', 'The mailbox to forward from (must be this mailbox\'s address)'],
                ['forward_to', 'string', 'yes', 'Destination email address'],
                ['keep_copy', 'boolean', 'no', 'Keep a copy in the original mailbox too (default true)'],
              ]} />
            </EndpointBlock>
            <EndpointBlock method="PATCH" path="/v1/hosting/mailboxes/{id}/forwarding/{rule_id}" desc="Pause or resume a rule without deleting it.">
              <ParamTable rows={[['enabled', 'boolean', 'yes', 'Mail only actually forwards while enabled AND confirmed']]} />
            </EndpointBlock>
            <EndpointBlock method="DELETE" path="/v1/hosting/mailboxes/{id}/forwarding/{rule_id}" desc="Remove a forwarding rule." />

            <h3 className="text-lg font-semibold mt-6 mb-3">Aliases</h3>
            <EndpointBlock method="GET" path="/v1/hosting/mailboxes/{id}/aliases" desc="List aliases delivering to this mailbox. Paginated.">
              <ParamTable rows={[['page', 'integer', 'no', 'Default 1'], ['page_size', 'integer', 'no', 'Default 20, max 100']]} />
            </EndpointBlock>
            <EndpointBlock method="POST" path="/v1/hosting/mailboxes/{id}/aliases" desc="Create an alias address that delivers to this mailbox.">
              <ParamTable rows={[
                ['mailbox', 'string', 'yes', 'This mailbox\'s address (the delivery target)'],
                ['alias_address', 'string', 'yes', 'The new alias address'],
              ]} />
            </EndpointBlock>
            <EndpointBlock method="DELETE" path="/v1/hosting/mailboxes/{id}/aliases/{alias_id}" desc="Remove an alias." />

            <h3 className="text-lg font-semibold mt-6 mb-3">Signature &amp; sender name</h3>
            <EndpointBlock method="PATCH" path="/v1/hosting/mailboxes/{id}/identity" desc="Update the mailbox's sender display name and/or HTML signature. Omit a field to leave it unchanged.">
              <ParamTable rows={[
                ['display_name', 'string', 'no', 'Name shown to recipients'],
                ['signature_html', 'string', 'no', 'HTML signature appended to outgoing mail'],
              ]} />
            </EndpointBlock>

            <h3 className="text-lg font-semibold mt-6 mb-3">Contacts</h3>
            <p className="text-muted-foreground mb-4">
              Requires the client&apos;s plan to include contacts (Pro and Premium both do) — 403s
              otherwise. Contacts belong to the client&apos;s account as a whole, not a specific
              mailbox.
            </p>
            <EndpointBlock method="GET" path="/v1/hosting/mailboxes/{id}/contacts" desc="List/search contacts.">
              <ParamTable rows={[
                ['group_id', 'integer', 'no', 'Filter to one group'],
                ['q', 'string', 'no', 'Search email, name, or company'],
              ]} />
            </EndpointBlock>
            <EndpointBlock method="POST" path="/v1/hosting/mailboxes/{id}/contacts" desc="Create a contact.">
              <ParamTable rows={[
                ['email', 'string', 'yes', ''],
                ['name', 'string', 'no', ''],
                ['phone', 'string', 'no', ''],
                ['company', 'string', 'no', ''],
                ['notes', 'string', 'no', ''],
                ['group_id', 'integer', 'no', ''],
              ]} />
            </EndpointBlock>
            <EndpointBlock method="PATCH" path="/v1/hosting/mailboxes/{id}/contacts/{contact_id}" desc="Update a contact. Same fields as create, all optional." />
            <EndpointBlock method="DELETE" path="/v1/hosting/mailboxes/{id}/contacts/{contact_id}" desc="Delete a contact." />
            <EndpointBlock method="GET" path="/v1/hosting/mailboxes/{id}/contacts/groups" desc="List contact groups." />
            <EndpointBlock method="POST" path="/v1/hosting/mailboxes/{id}/contacts/groups" desc="Create a contact group.">
              <ParamTable rows={[['name', 'string', 'yes', '']]} />
            </EndpointBlock>
            <EndpointBlock method="DELETE" path="/v1/hosting/mailboxes/{id}/contacts/groups/{group_id}" desc="Delete a contact group." />

            <h3 className="text-lg font-semibold mt-6 mb-3">Campaigns</h3>
            <p className="text-muted-foreground mb-4">
              Requires the client&apos;s plan to include campaigns (Pro and Premium both do) —
              403s otherwise. A campaign starts as a single-step send; add more steps to turn it
              into a drip sequence.
            </p>
            <EndpointBlock method="GET" path="/v1/hosting/mailboxes/{id}/campaigns" desc="List campaigns." />
            <EndpointBlock method="POST" path="/v1/hosting/mailboxes/{id}/campaigns" desc="Create a campaign (starts in draft status, with one step already set from subject/body_html).">
              <ParamTable rows={[
                ['from_email', 'string', 'yes', 'Must be this mailbox\'s address'],
                ['name', 'string', 'yes', 'Internal campaign name'],
                ['subject', 'string', 'yes', ''],
                ['body_html', 'string', 'yes', ''],
                ['group_id', 'integer', 'no', 'Send to one contact group'],
                ['segment_filter', 'array', 'no', 'Or send to a filtered segment — see the dashboard for the filter shape'],
              ]} />
            </EndpointBlock>
            <EndpointBlock method="GET" path="/v1/hosting/mailboxes/{id}/campaigns/{campaign_id}" desc="Get one campaign." />
            <EndpointBlock method="PUT" path="/v1/hosting/mailboxes/{id}/campaigns/{campaign_id}" desc="Edit a draft campaign. 400s once it's left draft status." />
            <EndpointBlock method="DELETE" path="/v1/hosting/mailboxes/{id}/campaigns/{campaign_id}" desc="Delete a campaign. 400s while it's actively sending or paused." />
            <EndpointBlock method="GET" path="/v1/hosting/mailboxes/{id}/campaigns/{campaign_id}/steps" desc="List drip steps." />
            <EndpointBlock method="POST" path="/v1/hosting/mailboxes/{id}/campaigns/{campaign_id}/steps" desc="Add a drip step to a draft campaign.">
              <ParamTable rows={[
                ['delay_hours', 'integer', 'no', 'Hours after the previous step (default 0)'],
                ['subject', 'string', 'yes', ''],
                ['subject_b', 'string', 'no', 'A/B variant subject'],
                ['ab_split_percent', 'integer', 'no', '0-100, default 50'],
                ['body_html', 'string', 'yes', ''],
              ]} />
            </EndpointBlock>
            <EndpointBlock method="DELETE" path="/v1/hosting/mailboxes/{id}/campaigns/{campaign_id}/steps/{step_id}" desc="Remove a drip step. Step 0 can't be deleted — edit the campaign's subject/body instead." />
            <EndpointBlock method="POST" path="/v1/hosting/mailboxes/{id}/campaigns/{campaign_id}/send" desc="Start sending a draft campaign. 429s if the recipient count exceeds today's remaining send quota on this mailbox." />
            <EndpointBlock method="POST" path="/v1/hosting/mailboxes/{id}/campaigns/{campaign_id}/pause" desc="Pause a campaign that's currently sending." />
            <EndpointBlock method="POST" path="/v1/hosting/mailboxes/{id}/campaigns/{campaign_id}/resume" desc="Resume a paused campaign." />
            <EndpointBlock method="GET" path="/v1/hosting/mailboxes/{id}/campaigns/{campaign_id}/stats" desc="Send stats: total, sent, suppressed, opened, clicked, bounced." />
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
                    ['partner_mailbox.payment_confirmed', "A pay-as-you-go client's payment clears (first payment or any renewal)"],
                    ['partner_mailbox.payment_failed', "A pay-as-you-go client's renewal charge fails"],
                    ['partner_mailbox.expired', "A pay-as-you-go client cancels"],
                    ['partner_mailbox.payment_abandoned', "A pay-as-you-go mailbox's first payment was never completed within 7 days — it and its account were deleted"],
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
