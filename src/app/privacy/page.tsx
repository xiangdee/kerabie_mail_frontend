import type { Metadata } from 'next';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How Kerabie Mail collects, stores, and uses your data.',
};

const EFFECTIVE = 'January 1, 2026';
const UPDATED   = 'May 2026';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <section className="py-16 bg-muted/30 border-b">
        <div className="container mx-auto max-w-3xl px-4">
          <h1 className="text-4xl font-bold mb-3">Privacy Policy</h1>
          <p className="text-muted-foreground">
            Effective: {EFFECTIVE} &nbsp;·&nbsp; Last updated: {UPDATED}
          </p>
        </div>
      </section>

      <section className="py-14">
        <div className="container mx-auto max-w-3xl px-4 space-y-14 text-[15px] leading-7">

          <Intro />
          <Section1 />
          <Section2 />
          <Section3 />
          <Section4 />
          <Section5 />
          <Section6 />
          <Section7 />
          <Section8 />
          <Section9 />
          <Section10 />
          <ContactSection />

        </div>
      </section>

      <Footer />
    </div>
  );
}

// ─── helpers ──────────────────────────────────────────────────────────────────

function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="text-2xl font-bold text-foreground mb-4">{children}</h2>;
}
function H3({ children }: { children: React.ReactNode }) {
  return <h3 className="text-lg font-semibold text-foreground mb-2 mt-5">{children}</h3>;
}
function P({ children }: { children: React.ReactNode }) {
  return <p className="text-muted-foreground mb-3">{children}</p>;
}
function UL({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="list-disc ml-6 space-y-1.5 text-muted-foreground mb-3">
      {items.map((item, i) => <li key={i}>{item}</li>)}
    </ul>
  );
}
function Note({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-primary/5 border-l-4 border-primary rounded-r-xl px-5 py-4 my-4 text-sm text-foreground/80">
      {children}
    </div>
  );
}

// ─── sections ─────────────────────────────────────────────────────────────────

function Intro() {
  return (
    <div>
      <P>
        Kerabie Mail ("Kerabie", "we", "us", or "our") is committed to protecting your privacy.
        This Privacy Policy describes what data we collect, how we use and store it, who we share it
        with, and the rights you have over your information.
      </P>
      <P>
        By creating an account or using any Kerabie Mail service — including the web application,
        mobile apps, or API — you agree to the practices described in this policy.
      </P>
    </div>
  );
}

function Section1() {
  return (
    <div>
      <H2>1. Information We Collect</H2>

      <H3>Account information</H3>
      <UL items={[
        'Full name and email address provided at registration',
        'Username chosen for your @kerabie.email mailbox',
        'Phone number, collected and verified via OTP (Termii) during signup',
        'Country and currency preference (used to display localised pricing)',
        'Password — stored only as a bcrypt hash; we never store plain-text passwords',
      ]} />

      <H3>Email content and metadata</H3>
      <UL items={[
        'Email messages you send and receive — stored to deliver the service',
        'Sender and recipient addresses, subject lines, timestamps, and attachment metadata',
        'IMAP folder structure and mailbox configuration',
        'Draft content saved automatically by the compose editor',
      ]} />
      <Note>
        We do <strong>not</strong> read, scan, index, or analyse your email content for advertising or any
        commercial purpose. Automated scanning occurs only to detect spam, viruses, and phishing — a
        technical necessity for email delivery.
      </Note>

      <H3>Device and technical data</H3>
      <UL items={[
        'IP address and approximate location (country / region) at login',
        'Browser type and version, or mobile OS and app version',
        'Device identifiers and Expo push token (mobile app, for push notifications)',
        'Session tokens and device IDs (stored server-side; HMAC-signed)',
        'HTTP request logs — retained for 30 days for security and debugging',
      ]} />

      <H3>Payment information</H3>
      <UL items={[
        'Subscription plan, billing cycle, and payment status',
        'Invoice history and transaction references',
        'Card-type indicator and last 4 digits (returned by our payment processors — we never store full card numbers)',
        'Nigerian bank account references for Paystack bank-transfer payments',
      ]} />

      <H3>Referral and tracking cookies</H3>
      <UL items={[
        'Referral source cookie (set when you arrive via a partner link) — 30-day TTL',
        'Partner code stored to attribute commissions accurately',
        'No third-party ad-tracking cookies are set on any Kerabie page',
      ]} />
    </div>
  );
}

function Section2() {
  return (
    <div>
      <H2>2. How We Use Your Information</H2>

      <H3>Service delivery</H3>
      <UL items={[
        'Creating and authenticating your account',
        'Sending, receiving, storing, and delivering email messages',
        'Powering features: labels, aliases, contacts, calendar, AI compose, scheduled send, forwarding rules, autoresponders',
        'Generating and validating Expo push tokens for new-email notifications (mobile)',
        'Authenticating IMAP and SMTP sessions for connected accounts',
      ]} />

      <H3>Security and fraud prevention</H3>
      <UL items={[
        'Detecting and blocking spam, phishing, and malware in transit',
        'Verifying your phone number via OTP to prevent fake account creation',
        'Rate-limiting sending to enforce plan limits and prevent abuse',
        'Monitoring for unusual login activity and revoking compromised sessions',
        'Maintaining audit logs of account actions (Pro and Premium)',
      ]} />

      <H3>Billing and subscriptions</H3>
      <UL items={[
        'Processing payments via Paystack (NGN) and Paddle (USD/international)',
        'Generating invoices and sending payment receipts via Brevo transactional email',
        'Enforcing plan limits (storage, mailboxes, aliases, AI requests)',
        'Sending renewal reminders and payment-failure notifications via push and email',
      ]} />

      <H3>Partner and referral tracking</H3>
      <UL items={[
        'Attributing sign-ups to the correct partner for commission calculation',
        'Tracking trial activations and conversions linked to reseller accounts',
        'Reporting monthly commission summaries to hosting partners',
      ]} />

      <H3>Product improvement</H3>
      <UL items={[
        'Aggregated, anonymised usage statistics (feature adoption, session length)',
        'Error and crash reporting to diagnose bugs (no email content included)',
        'Performance monitoring to improve server response times',
      ]} />

      <H3>Billing reference — plan pricing</H3>
      <P>
        The following pricing determines what payment data we process and store. USD payments are
        handled by Paddle; NGN payments by Paystack. We store transaction references and amounts but
        never full card numbers.
      </P>

      <div className="overflow-x-auto mb-3">
        <table className="w-full border rounded-xl text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="text-left p-3 font-semibold">Plan</th>
              <th className="text-left p-3 font-semibold">USD / mo</th>
              <th className="text-left p-3 font-semibold">USD / yr</th>
              <th className="text-left p-3 font-semibold">NGN / mo</th>
              <th className="text-left p-3 font-semibold">NGN / yr</th>
            </tr>
          </thead>
          <tbody className="divide-y text-muted-foreground">
            <tr>
              <td className="p-3 font-medium text-foreground">Free</td>
              <td className="p-3">$0</td>
              <td className="p-3">$0</td>
              <td className="p-3">₦0</td>
              <td className="p-3">₦0</td>
            </tr>
            <tr>
              <td className="p-3 font-medium text-foreground">Pro</td>
              <td className="p-3">$2.80</td>
              <td className="p-3">$26.88 <span className="text-xs text-green-600">($2.24/mo)</span></td>
              <td className="p-3">₦3,500</td>
              <td className="p-3">₦33,600 <span className="text-xs text-green-600">(₦2,800/mo)</span></td>
            </tr>
            <tr>
              <td className="p-3 font-medium text-foreground">Premium</td>
              <td className="p-3">$8.00</td>
              <td className="p-3">$76.80 <span className="text-xs text-green-600">($6.40/mo)</span></td>
              <td className="p-3">₦7,500</td>
              <td className="p-3">₦72,000 <span className="text-xs text-green-600">(₦6,000/mo)</span></td>
            </tr>
          </tbody>
        </table>
      </div>
      <P>
        2-year (30% off) and 3-year (40% off) billing periods are also available. Add-ons: extra 10 GB
        storage at $1 / ₦800 per month; extra mailbox at $2 / ₦1,500 per month. Full pricing at{' '}
        <a href="/pricing" className="text-primary hover:underline">kerabie.email/pricing</a>.
      </P>
    </div>
  );
}

function Section3() {
  return (
    <div>
      <H2>3. Storage and Security</H2>

      <H3>Encryption at rest</H3>
      <UL items={[
        'All email data is stored encrypted with AES-256 on the mail server (Mailu / Dovecot)',
        'IMAP and SMTP credentials for connected external accounts are encrypted with AES-256 before being written to the database; the master wrapping key is stored separately from the data',
        'Passwords are hashed with bcrypt (cost factor 12) — never stored in recoverable form',
        'Session tokens are HMAC-SHA256 signed; refresh tokens are stored as hashed values',
      ]} />

      <H3>Encryption in transit</H3>
      <UL items={[
        'All web traffic is served over TLS 1.2 / 1.3 (HTTPS enforced, HSTS enabled)',
        'IMAP connections require SSL/TLS on port 993; SMTP requires STARTTLS on port 587 or SSL on port 465',
        'Internal service-to-service traffic (API ↔ Redis ↔ database) is within an isolated private network',
      ]} />

      <H3>Infrastructure and access controls</H3>
      <UL items={[
        'Mail server and API hosted on dedicated VPS with firewall rules; non-essential ports blocked',
        'Database access restricted to application service accounts; no direct public access',
        'Redis (session and cache store) is network-isolated and password-protected',
        'Employee access to production systems requires SSH key authentication and VPN; access is logged',
        'Automated backups run daily; backups are encrypted and retained for 30 days',
      ]} />
    </div>
  );
}

function Section4() {
  return (
    <div>
      <H2>4. Email Content Privacy</H2>
      <Note>
        <strong>We do not read your emails.</strong> Your email content belongs to you.
      </Note>
      <P>
        Automated spam and virus filtering is performed by Mailu's built-in Rspamd and ClamAV engines at
        the SMTP layer — the same way all professional mail servers work. This is a technical necessity to
        protect recipients from malware. No human at Kerabie reads the output of these filters beyond
        aggregate spam statistics.
      </P>
      <P>We will never:</P>
      <UL items={[
        'Read, index, or analyse your email content for advertising',
        'Use the content of your emails to train AI models',
        'Share the content of your emails with third parties except as required by law (see Section 5)',
        'Target ads to you based on keywords in your emails',
      ]} />
      <P>
        AI Compose (Pro and Premium plans) sends only the prompt you type — not your existing emails — to
        Google Gemini. Prompts are not stored by us beyond the request-response cycle and are not used to
        train any model.
      </P>
    </div>
  );
}

function Section5() {
  return (
    <div>
      <H2>5. Sharing Your Information</H2>
      <P>
        <strong>We do not sell your data.</strong> We share information only in the following limited
        circumstances:
      </P>

      <H3>Service providers (sub-processors)</H3>
      <div className="overflow-x-auto">
        <table className="w-full border rounded-xl text-sm mb-4">
          <thead className="bg-muted">
            <tr>
              <th className="text-left p-3 font-semibold">Provider</th>
              <th className="text-left p-3 font-semibold">Purpose</th>
              <th className="text-left p-3 font-semibold">Data shared</th>
            </tr>
          </thead>
          <tbody className="divide-y text-muted-foreground">
            <tr><td className="p-3 font-medium text-foreground">Paystack</td><td className="p-3">Payment processing (NGN)</td><td className="p-3">Name, email, payment amount</td></tr>
            <tr><td className="p-3 font-medium text-foreground">Paddle</td><td className="p-3">Payment processing (USD / international)</td><td className="p-3">Name, email, billing address, payment amount</td></tr>
            <tr><td className="p-3 font-medium text-foreground">Termii</td><td className="p-3">SMS OTP delivery</td><td className="p-3">Phone number, OTP code</td></tr>
            <tr><td className="p-3 font-medium text-foreground">Brevo (Sendinblue)</td><td className="p-3">Transactional emails (receipts, resets)</td><td className="p-3">Name, email address</td></tr>
            <tr><td className="p-3 font-medium text-foreground">Google Gemini</td><td className="p-3">AI Compose (Pro / Premium)</td><td className="p-3">Your compose prompt only</td></tr>
            <tr><td className="p-3 font-medium text-foreground">Expo (Meta)</td><td className="p-3">Mobile push notifications</td><td className="p-3">Expo push token, notification payload</td></tr>
          </tbody>
        </table>
      </div>
      <P>
        All sub-processors are bound by data processing agreements and may only use your data for the
        specified purpose.
      </P>

      <H3>Legal process</H3>
      <P>
        We may disclose information if required by a valid court order, subpoena, or applicable law.
        Where legally permitted, we will notify affected users before disclosure. We will never provide
        access to email content in bulk or in response to informal law-enforcement requests.
      </P>

      <H3>Business transfers</H3>
      <P>
        In the event of a merger, acquisition, or sale of assets, user data may be transferred. We will
        provide 30 days' advance notice via email and this page before any such transfer occurs.
      </P>
    </div>
  );
}

function Section6() {
  return (
    <div>
      <H2>6. Email Open Tracking</H2>
      <P>
        Kerabie Mail offers email open tracking as a Premium plan feature. When tracking is enabled for a
        specific message, a small 1×1 pixel image is embedded in the email. When the recipient opens the
        email, the pixel load is recorded and we notify you that the email was opened.
      </P>
      <H3>What is recorded</H3>
      <UL items={[
        'Timestamp of the open event',
        'Approximate location (country) derived from the recipient\'s IP',
        'Email client / device type (from user-agent string)',
      ]} />
      <H3>How to identify tracked emails</H3>
      <P>
        Tracked emails display a tracking indicator in the compose window before sending.
        Recipients can identify tracking pixels by inspecting the raw message source for
        a link to <code>track.kerabie.email</code>.
      </P>
      <H3>How to disable tracking</H3>
      <UL items={[
        'As a sender: disable tracking per-message in the compose window, or disable it globally in Settings → Tracking',
        'As a recipient: load emails in a client that blocks remote images by default (most modern clients do this)',
      ]} />
    </div>
  );
}

function Section7() {
  return (
    <div>
      <H2>7. Advertising — Free Accounts</H2>
      <P>
        Free plan accounts are supported by advertising displayed in the webmail interface and mobile app.
      </P>
      <UL items={[
        'Ads are served by Google Mobile Ads (AdMob) in the mobile app and a partner ad network in the webmail',
        'Ads are <strong>not</strong> targeted based on your email content',
        'Ads may be contextually matched to the page you are viewing (e.g. a generic email interface ad)',
        'Standard device advertising identifiers (IDFA on iOS, GAID on Android) may be used by the ad SDK subject to your device-level ad tracking preference',
        'Upgrading to Pro or Premium removes all advertising permanently',
      ]} />
    </div>
  );
}

function Section8() {
  return (
    <div>
      <H2>8. Your Rights</H2>
      <P>
        Regardless of your location, you have the following rights over your personal data:
      </P>

      <div className="grid sm:grid-cols-2 gap-4 mb-4">
        {[
          { right: 'Access', detail: 'Request a copy of all personal data we hold about you.' },
          { right: 'Correction', detail: 'Update inaccurate or incomplete information in Settings → Profile.' },
          { right: 'Deletion', detail: 'Delete your account (Settings → Security → Delete account) or email privacy@kerabie.email.' },
          { right: 'Export', detail: 'Export your emails as .mbox via Settings → Import/Export.' },
          { right: 'Restriction', detail: 'Request that we limit processing while a complaint is under review.' },
          { right: 'Opt-out of analytics', detail: 'Contact privacy@kerabie.email to opt out of aggregated usage analytics.' },
        ].map(({ right, detail }) => (
          <div key={right} className="border rounded-xl p-4">
            <p className="font-semibold text-foreground mb-1">{right}</p>
            <p className="text-sm text-muted-foreground">{detail}</p>
          </div>
        ))}
      </div>

      <P>
        To exercise any right, contact us at{' '}
        <a href="mailto:privacy@kerabie.email" className="text-primary hover:underline">
          privacy@kerabie.email
        </a>
        . We will respond within 30 days. Account deletion requests submitted through the app are
        processed immediately.
      </P>

      <H3>Data retention after deletion</H3>
      <UL items={[
        'Account and profile data: deleted immediately on account deletion',
        'Email content: deleted from mail servers within 7 days of account deletion',
        'Encrypted backups: purged within 90 days',
        'Payment records: retained for 7 years as required by Nigerian tax law',
        'Server logs: deleted after 30 days',
      ]} />
    </div>
  );
}

function Section9() {
  return (
    <div>
      <H2>9. Cookie Policy</H2>

      <div className="overflow-x-auto">
        <table className="w-full border rounded-xl text-sm mb-4">
          <thead className="bg-muted">
            <tr>
              <th className="text-left p-3 font-semibold">Cookie</th>
              <th className="text-left p-3 font-semibold">Type</th>
              <th className="text-left p-3 font-semibold">Purpose</th>
              <th className="text-left p-3 font-semibold">TTL</th>
            </tr>
          </thead>
          <tbody className="divide-y text-muted-foreground">
            <tr>
              <td className="p-3 font-mono text-xs">kerabie_access_token</td>
              <td className="p-3">Essential</td>
              <td className="p-3">Authenticates your session</td>
              <td className="p-3">15 minutes</td>
            </tr>
            <tr>
              <td className="p-3 font-mono text-xs">kerabie_refresh_token</td>
              <td className="p-3">Essential</td>
              <td className="p-3">Renews expired access tokens</td>
              <td className="p-3">30 days</td>
            </tr>
            <tr>
              <td className="p-3 font-mono text-xs">kerabie_device_id</td>
              <td className="p-3">Essential</td>
              <td className="p-3">Identifies your device for session management</td>
              <td className="p-3">1 year</td>
            </tr>
            <tr>
              <td className="p-3 font-mono text-xs">kerabie_ref</td>
              <td className="p-3">Referral</td>
              <td className="p-3">Tracks partner referral for commission attribution</td>
              <td className="p-3">30 days</td>
            </tr>
            <tr>
              <td className="p-3 font-mono text-xs">_analytics</td>
              <td className="p-3">Analytics (opt-in)</td>
              <td className="p-3">Aggregated page-view and feature-use statistics</td>
              <td className="p-3">1 year</td>
            </tr>
          </tbody>
        </table>
      </div>

      <P>
        Essential cookies are required for the service to function and cannot be disabled. Analytics
        cookies require your explicit opt-in. You can manage cookie preferences at any time via
        Settings → Privacy, or by clearing cookies in your browser.
      </P>
    </div>
  );
}

function Section10() {
  return (
    <div>
      <H2>10. Changes to This Policy</H2>
      <P>
        We will provide at least <strong>30 days' advance notice</strong> before any material change to
        this Privacy Policy takes effect. Notice will be given by:
      </P>
      <UL items={[
        'Email to the address associated with your account',
        'An in-app banner in the webmail and mobile app',
        'An update to the "Last updated" date at the top of this page',
      ]} />
      <P>
        For non-material changes (corrections, clarifications), we may update the policy without prior
        notice. Continued use of Kerabie Mail after a material change takes effect constitutes
        acceptance of the updated policy.
      </P>
    </div>
  );
}

function ContactSection() {
  return (
    <div className="border rounded-2xl p-8 bg-muted/30">
      <h2 className="text-xl font-bold mb-2">Questions about privacy?</h2>
      <p className="text-muted-foreground mb-4">
        Our privacy team is available to answer questions, process data requests, and handle complaints.
      </p>
      <div className="space-y-1 text-sm text-muted-foreground">
        <p>Privacy: <a href="mailto:privacy@kerabie.email" className="text-primary hover:underline">privacy@kerabie.email</a></p>
        <p>Support: <a href="mailto:support@kerabie.email" className="text-primary hover:underline">support@kerabie.email</a></p>
        <p>Legal: <a href="mailto:legal@kerabie.email" className="text-primary hover:underline">legal@kerabie.email</a></p>
      </div>
    </div>
  );
}
