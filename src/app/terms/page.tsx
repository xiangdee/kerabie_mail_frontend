import type { Metadata } from 'next';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'The terms governing your use of Kerabie Mail.',
};

const EFFECTIVE = 'January 1, 2026';
const UPDATED   = 'May 2026';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <section className="py-16 bg-muted/30 border-b">
        <div className="container mx-auto max-w-3xl px-4">
          <h1 className="text-4xl font-bold mb-3">Terms of Service</h1>
          <p className="text-muted-foreground">
            Effective: {EFFECTIVE} &nbsp;·&nbsp; Last updated: {UPDATED}
          </p>
        </div>
      </section>

      <section className="py-14">
        <div className="container mx-auto max-w-3xl px-4 space-y-14 text-[15px] leading-7">

          <T1 />
          <T2 />
          <T3 />
          <T4 />
          <T5 />
          <T6 />
          <T7 />
          <T8 />
          <T9 />
          <T10 />
          <T11 />
          <T12 />
          <T13 />
          <ContactSection />

        </div>
      </section>

      <Footer />
    </div>
  );
}

// ─── helpers ──────────────────────────────────────────────────────────────────

function H2({ n, children }: { n: number; children: React.ReactNode }) {
  return <h2 className="text-2xl font-bold text-foreground mb-4">{n}. {children}</h2>;
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
function Warn({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-destructive/5 border-l-4 border-destructive rounded-r-xl px-5 py-4 my-4 text-sm text-foreground/80">
      {children}
    </div>
  );
}

// ─── sections ─────────────────────────────────────────────────────────────────

function T1() {
  return (
    <div>
      <H2 n={1}>Acceptance</H2>
      <P>
        These Terms of Service ("Terms") form a binding legal agreement between you and Kerabie Mail
        ("Kerabie", "we", "us", "our"). By creating an account, accessing, or using any Kerabie Mail
        service — including the web application at kerabie.email, the webmail at webmail.kerabie.email,
        the mobile applications, or the API — you confirm that you have read, understood, and agree to
        be bound by these Terms and our{' '}
        <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
      </P>
      <P>
        If you do not agree, you must not access or use the service. If you are accepting on behalf
        of a company, you represent that you have authority to bind that organisation.
      </P>
    </div>
  );
}

function T2() {
  return (
    <div>
      <H2 n={2}>Account Registration</H2>
      <UL items={[
        'You must provide accurate, complete, and current information during registration.',
        'You must be at least 18 years old, or the age of digital consent in your jurisdiction if higher.',
        <>
          <strong>Phone verification is required.</strong> A valid phone number must be verified via
          one-time passcode (OTP) at registration. Accounts without verified phone numbers have
          restricted access.
        </>,
        'One person may maintain only one Free plan account. Creating multiple Free accounts to circumvent plan limits is prohibited.',
        'You are solely responsible for maintaining the confidentiality of your password and all activities that occur under your account.',
        'You must notify us immediately at security@kerabie.email if you suspect unauthorised access to your account.',
      ]} />
    </div>
  );
}

function T3() {
  return (
    <div>
      <H2 n={3}>Acceptable Use</H2>
      <P>You may use Kerabie Mail only for lawful purposes and in accordance with these Terms.</P>

      <Warn>
        <strong>You must not use Kerabie Mail to:</strong>
        <ul className="list-disc ml-5 mt-2 space-y-1">
          <li>Send spam, unsolicited bulk email, or messages that violate anti-spam laws (including Nigeria's Cybercrimes Act, CAN-SPAM, and CASL)</li>
          <li>Distribute malware, ransomware, viruses, or any harmful code</li>
          <li>Engage in phishing, credential harvesting, or impersonation of another person or entity</li>
          <li>Conduct, facilitate, or promote illegal activities</li>
          <li>Harass, threaten, abuse, defame, or invade the privacy of others</li>
          <li>Violate intellectual property rights of third parties</li>
          <li>Circumvent plan limits through technical manipulation or multiple accounts</li>
          <li>Resell access to Kerabie Mail without an authorised Partner agreement</li>
          <li>Probe, scan, or test the vulnerability of our systems without written authorisation</li>
        </ul>
      </Warn>

      <P>
        Violations may result in immediate account suspension without notice. We reserve the right to
        report illegal activity to Nigerian law enforcement and relevant international authorities.
      </P>
    </div>
  );
}

function T4() {
  return (
    <div>
      <H2 n={4}>Plans and Billing</H2>

      <H3>Current pricing</H3>

      {/* Free */}
      <div className="border rounded-xl overflow-hidden mb-4">
        <div className="bg-muted px-4 py-2 font-semibold text-sm">Free — 1 mailbox · 500 MB · 50 emails/day</div>
        <div className="px-4 py-3 text-muted-foreground text-sm">$0 / ₦0 — no credit card required</div>
      </div>

      {/* Pro */}
      <div className="border rounded-xl overflow-hidden mb-4">
        <div className="bg-primary/10 px-4 py-2 font-semibold text-sm text-primary">Pro — 3 mailboxes · 10 GB/mailbox · 500 emails/day</div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-3 font-medium">Billing period</th>
                <th className="text-left p-3 font-medium">USD (per month equiv.)</th>
                <th className="text-left p-3 font-medium">USD (total billed)</th>
                <th className="text-left p-3 font-medium">NGN (per month equiv.)</th>
                <th className="text-left p-3 font-medium">NGN (total billed)</th>
                <th className="text-left p-3 font-medium">Discount</th>
              </tr>
            </thead>
            <tbody className="divide-y text-muted-foreground">
              <tr><td className="p-3">Monthly</td><td className="p-3">$2.80</td><td className="p-3">$2.80</td><td className="p-3">₦3,500</td><td className="p-3">₦3,500</td><td className="p-3">—</td></tr>
              <tr><td className="p-3">Annual</td><td className="p-3">$2.24</td><td className="p-3">$26.88</td><td className="p-3">₦2,800</td><td className="p-3">₦33,600</td><td className="p-3 text-green-600 font-medium">20% off</td></tr>
              <tr><td className="p-3">2-year</td><td className="p-3">$1.96</td><td className="p-3">$47.04</td><td className="p-3">₦2,450</td><td className="p-3">₦58,800</td><td className="p-3 text-green-600 font-medium">30% off</td></tr>
              <tr><td className="p-3">3-year</td><td className="p-3">$1.68</td><td className="p-3">$60.48</td><td className="p-3">₦2,100</td><td className="p-3">₦75,600</td><td className="p-3 text-green-600 font-medium">40% off</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Premium */}
      <div className="border rounded-xl overflow-hidden mb-4">
        <div className="bg-amber-500/10 px-4 py-2 font-semibold text-sm text-amber-700 dark:text-amber-400">Premium — 10 mailboxes · 50 GB/mailbox · 2,000 emails/day</div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-3 font-medium">Billing period</th>
                <th className="text-left p-3 font-medium">USD (per month equiv.)</th>
                <th className="text-left p-3 font-medium">USD (total billed)</th>
                <th className="text-left p-3 font-medium">NGN (per month equiv.)</th>
                <th className="text-left p-3 font-medium">NGN (total billed)</th>
                <th className="text-left p-3 font-medium">Discount</th>
              </tr>
            </thead>
            <tbody className="divide-y text-muted-foreground">
              <tr><td className="p-3">Monthly</td><td className="p-3">$8.00</td><td className="p-3">$8.00</td><td className="p-3">₦7,500</td><td className="p-3">₦7,500</td><td className="p-3">—</td></tr>
              <tr><td className="p-3">Annual</td><td className="p-3">$6.40</td><td className="p-3">$76.80</td><td className="p-3">₦6,000</td><td className="p-3">₦72,000</td><td className="p-3 text-green-600 font-medium">20% off</td></tr>
              <tr><td className="p-3">2-year</td><td className="p-3">$5.60</td><td className="p-3">$134.40</td><td className="p-3">₦5,250</td><td className="p-3">₦126,000</td><td className="p-3 text-green-600 font-medium">30% off</td></tr>
              <tr><td className="p-3">3-year</td><td className="p-3">$4.80</td><td className="p-3">$172.80</td><td className="p-3">₦4,500</td><td className="p-3">₦162,000</td><td className="p-3 text-green-600 font-medium">40% off</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Add-ons */}
      <div className="border rounded-xl overflow-hidden mb-4">
        <div className="bg-muted px-4 py-2 font-semibold text-sm">Add-ons (Pro & Premium only — billed monthly)</div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/30">
              <tr>
                <th className="text-left p-3 font-medium">Add-on</th>
                <th className="text-left p-3 font-medium">USD / month</th>
                <th className="text-left p-3 font-medium">NGN / month</th>
              </tr>
            </thead>
            <tbody className="divide-y text-muted-foreground">
              <tr><td className="p-3">Extra 10 GB storage</td><td className="p-3">$1.00</td><td className="p-3">₦800</td></tr>
              <tr><td className="p-3">Extra mailbox</td><td className="p-3">$2.00</td><td className="p-3">₦1,500</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <P>
        All prices are exclusive of applicable taxes. NGN prices are indicative and may be adjusted
        periodically to reflect exchange-rate movements — always check the{' '}
        <Link href="/pricing" className="text-primary hover:underline">pricing page</Link> for
        current NGN rates. USD prices are charged through Paddle; NGN prices through Paystack.
        Pricing is subject to change with 30 days' advance notice.
      </P>

      <H3>Billing cycle</H3>
      <UL items={[
        'Subscriptions renew automatically at the end of each billing period unless cancelled.',
        'Annual, biennial, and triennial plans are billed as a single upfront payment.',
        'Add-ons (extra storage at $1/10 GB/month; extra mailboxes at $2/mailbox/month) are billed monthly and prorated.',
        'Downgrade or cancellation takes effect at the end of the current paid period.',
      ]} />

      <H3>Refund policy</H3>
      <UL items={[
        'New subscriptions: 7-day full refund, no questions asked. Contact billing@kerabie.email.',
        'Renewals: non-refundable except in cases of demonstrable billing error.',
        'Refunds for NGN payments are processed via the original Paystack payment method.',
        'Refunds for USD payments are processed via Paddle within 5–10 business days.',
      ]} />

      <H3>Failed payments</H3>
      <P>
        If a payment fails, we will retry up to three times over 7 days. After that, your account
        enters a 7-day grace period with restricted features. If payment is not resolved during the
        grace period, the account downgrades to Free.
      </P>

      <H3>Mobile App Store Subscriptions</H3>
      <P>
        If you subscribe through the Kerabie Mail app on the Apple App Store or Google Play, the
        following applies in addition to the terms above:
      </P>
      <UL items={[
        'Payment will be charged to your Apple ID or Google Play account at confirmation of purchase.',
        'Subscriptions automatically renew unless auto-renew is turned off at least 24 hours before the end of the current period.',
        'Your account will be charged for renewal within 24 hours prior to the end of the current period, at the price for your selected plan and billing period shown above.',
        'You can manage your subscription or turn off auto-renewal at any time by going to your Account Settings on the App Store or Google Play after purchase.',
        'Any unused portion of a free trial period, if one is offered, will be forfeited when you purchase a subscription.',
      ]} />
    </div>
  );
}

function T5() {
  return (
    <div>
      <H2 n={5}>Storage and Sending Limits</H2>
      <div className="overflow-x-auto mb-4">
        <table className="w-full border rounded-xl text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="text-left p-3 font-semibold">Feature</th>
              <th className="text-left p-3 font-semibold">Free</th>
              <th className="text-left p-3 font-semibold">Pro</th>
              <th className="text-left p-3 font-semibold">Premium</th>
            </tr>
          </thead>
          <tbody className="divide-y text-muted-foreground">
            <tr>
              <td className="p-3 font-medium text-foreground">Storage per mailbox</td>
              <td className="p-3">500 MB</td>
              <td className="p-3">10 GB</td>
              <td className="p-3">50 GB</td>
            </tr>
            <tr>
              <td className="p-3 font-medium text-foreground">Emails sent / day</td>
              <td className="p-3">50</td>
              <td className="p-3">500</td>
              <td className="p-3">2,000</td>
            </tr>
            <tr>
              <td className="p-3 font-medium text-foreground">Email aliases</td>
              <td className="p-3">—</td>
              <td className="p-3">20</td>
              <td className="p-3">Unlimited</td>
            </tr>
            <tr>
              <td className="p-3 font-medium text-foreground">Forwarding rules</td>
              <td className="p-3">—</td>
              <td className="p-3">10</td>
              <td className="p-3">Unlimited</td>
            </tr>
            <tr>
              <td className="p-3 font-medium text-foreground">AI compose requests / day</td>
              <td className="p-3">—</td>
              <td className="p-3">50</td>
              <td className="p-3">Unlimited</td>
            </tr>
            <tr>
              <td className="p-3 font-medium text-foreground">Calendar & Contacts</td>
              <td className="p-3">—</td>
              <td className="p-3">✅</td>
              <td className="p-3">✅</td>
            </tr>
            <tr>
              <td className="p-3 font-medium text-foreground">API access</td>
              <td className="p-3">—</td>
              <td className="p-3">—</td>
              <td className="p-3">✅</td>
            </tr>
            <tr>
              <td className="p-3 font-medium text-foreground">Webhooks</td>
              <td className="p-3">—</td>
              <td className="p-3">—</td>
              <td className="p-3">✅</td>
            </tr>
          </tbody>
        </table>
      </div>
      <P>
        Exceeding the daily sending limit will cause further sends to be queued or rejected for that day.
        Exceeding storage prevents receiving new email until space is freed or a plan upgrade is applied.
        Add-on storage (Pro and Premium) can be purchased in 10 GB increments at $1/month each.
      </P>
    </div>
  );
}

function T6() {
  return (
    <div>
      <H2 n={6}>Custom Domain Terms</H2>
      <UL items={[
        'You must own or have authorisation to use any domain you add to Kerabie Mail.',
        'You are responsible for adding the required DNS records (MX, SPF, DKIM, DMARC) correctly.',
        'Kerabie is not responsible for email loss resulting from incorrect DNS configuration.',
        'You may not add domains that you do not control or that impersonate another organisation.',
        'If a domain is used to send spam or violate these Terms, the domain and associated mailboxes may be suspended immediately.',
        'Custom domain email is available on Pro and Premium plans only.',
        'Kerabie generates a unique DKIM key per domain. You are responsible for adding the DKIM TXT record to your DNS.',
      ]} />
    </div>
  );
}

function T7() {
  return (
    <div>
      <H2 n={7}>Partner and Reseller Terms</H2>
      <P>
        Kerabie Mail operates a hosting partner programme that allows web hosting companies and
        resellers to provision Kerabie Mail accounts for their customers.
      </P>

      <H3>Eligibility</H3>
      <UL items={[
        'Partners must complete identity verification including a verified phone number.',
        'Partners must agree to the Partner Agreement, which supplements these Terms.',
        'Partners are responsible for ensuring their customers comply with these Terms.',
      ]} />

      <H3>Obligations</H3>
      <UL items={[
        'Partners may not misrepresent Kerabie Mail\'s capabilities to customers.',
        'Partners must not provision accounts for customers they know to be engaged in spam or fraud.',
        'Partners must maintain accurate billing records and customer contact details.',
        'Partners must promptly respond to abuse complaints forwarded by Kerabie.',
      ]} />

      <H3>Commission</H3>
      <UL items={[
        'Commission rates are defined in the Partner Agreement and subject to change with 30 days\' notice.',
        'Commissions are calculated monthly on net subscription revenue (excluding refunds and chargebacks).',
        'Commissions are forfeited for accounts suspended due to Terms violations.',
        'Minimum payout threshold applies; unpaid commissions below the threshold roll to the next period.',
      ]} />

      <H3>Termination of partnership</H3>
      <UL items={[
        'Either party may terminate the partnership with 30 days\' written notice.',
        'On termination, provisioned customer accounts continue under standard Kerabie terms.',
        'Unpaid commissions earned before termination will be paid in the next regular cycle.',
      ]} />
    </div>
  );
}

function T8() {
  return (
    <div>
      <H2 n={8}>API Terms</H2>
      <P>
        Access to the Kerabie Mail REST API is available on Premium plan accounts. Use of the API is
        subject to these additional terms.
      </P>

      <H3>Rate limits</H3>
      <div className="overflow-x-auto mb-4">
        <table className="w-full border rounded-xl text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="text-left p-3 font-semibold">Plan</th>
              <th className="text-left p-3 font-semibold">Requests / minute</th>
              <th className="text-left p-3 font-semibold">Requests / day</th>
            </tr>
          </thead>
          <tbody className="divide-y text-muted-foreground">
            <tr><td className="p-3">Pro</td><td className="p-3">60</td><td className="p-3">10,000</td></tr>
            <tr><td className="p-3">Premium</td><td className="p-3">300</td><td className="p-3">Unlimited</td></tr>
          </tbody>
        </table>
      </div>

      <H3>Prohibited API uses</H3>
      <UL items={[
        'Building competing email hosting services using Kerabie infrastructure',
        'Using the API to send bulk email beyond your plan\'s daily limit',
        'Automated scraping of contacts, messages, or metadata at scale',
        'Sharing API keys with third parties not authorised to access your account',
        'Circumventing rate limits by rotating API keys or using multiple accounts',
      ]} />

      <H3>Key responsibility</H3>
      <P>
        You are responsible for all activity carried out using your API keys. Store keys securely
        (environment variables or a secrets manager — never in version control). Revoke and rotate
        keys immediately if you suspect compromise via Settings → API Keys.
      </P>

      <H3>API availability</H3>
      <P>
        The API is provided without a specific uptime guarantee beyond the general 99.9% SLA. We may
        deprecate API endpoints with 90 days' notice. Breaking changes will not be made without a
        versioned migration path.
      </P>
    </div>
  );
}

function T9() {
  return (
    <div>
      <H2 n={9}>Intellectual Property</H2>
      <H3>Your content</H3>
      <P>
        You retain all intellectual property rights in emails you send and receive, contacts, calendar
        events, and other content you create using Kerabie Mail. You grant Kerabie a limited, worldwide,
        royalty-free licence to store, transmit, and display your content solely to provide the service.
        This licence ends when you delete your content or close your account.
      </P>

      <H3>Kerabie's intellectual property</H3>
      <P>
        The Kerabie Mail name, logo, product design, software, and documentation are owned by Kerabie
        or its licensors. You may not copy, modify, distribute, reverse-engineer, or create derivative
        works of any part of the service without prior written permission.
      </P>

      <H3>Feedback</H3>
      <P>
        If you submit feedback, suggestions, or ideas about the service, you grant Kerabie an
        irrevocable, perpetual, royalty-free right to use them for any purpose without compensation
        or attribution.
      </P>
    </div>
  );
}

function T10() {
  return (
    <div>
      <H2 n={10}>Limitation of Liability</H2>
      <Note>
        To the maximum extent permitted by applicable law, Kerabie's total liability to you for any
        claim arising from or related to these Terms or the service — whether in contract, tort, or
        otherwise — is limited to the greater of (a) the amounts you paid to Kerabie in the 12 months
        preceding the claim, or (b) ₦50,000 (fifty thousand naira).
      </Note>
      <P>
        In no event will Kerabie be liable for any indirect, incidental, special, consequential, or
        punitive damages, including loss of profits, data, goodwill, or business interruption, even
        if advised of the possibility of such damages.
      </P>
      <P>
        The service is provided "as is" and "as available." We do not warrant that the service will be
        uninterrupted, error-free, or free of harmful components. We are not responsible for the content
        of emails sent by third parties to your mailbox.
      </P>
    </div>
  );
}

function T11() {
  return (
    <div>
      <H2 n={11}>Termination</H2>

      <H3>Termination by you</H3>
      <UL items={[
        'You may cancel your subscription at any time from Settings → Billing.',
        'You may permanently delete your account from Settings → Security → Delete account.',
        'Before deleting, we recommend exporting your data via Settings → Import/Export.',
        'After deletion, you have 0 days to request data recovery — deletion is immediate and permanent.',
      ]} />

      <H3>Termination by Kerabie</H3>
      <UL items={[
        'We may suspend or terminate accounts that violate these Terms immediately and without notice.',
        'We may terminate accounts for non-payment after the grace period described in Section 4.',
        'We may terminate the Free plan with 30 days\' notice if the account has been inactive for 12 months.',
        'On termination by Kerabie for a Terms violation, no refund is due.',
      ]} />

      <H3>Effect of termination</H3>
      <P>
        Upon termination, your right to access the service ceases immediately. Email delivery to your
        addresses will stop. All your data will be permanently deleted from our servers within 7 days
        (email content) and within 90 days (encrypted backups). Payment records are retained as
        required by law.
      </P>
    </div>
  );
}

function T12() {
  return (
    <div>
      <H2 n={12}>Governing Law</H2>
      <P>
        These Terms are governed by and construed in accordance with the laws of the{' '}
        <strong>Federal Republic of Nigeria</strong>, including the Cybercrimes (Prohibition, Prevention,
        etc.) Act 2015 and the Nigeria Data Protection Act 2023 (NDPA), without regard to conflict of
        law principles.
      </P>
      <P>
        Any dispute arising from these Terms will be subject to the exclusive jurisdiction of the courts
        of the Federal Republic of Nigeria. You agree to submit to the personal jurisdiction of such
        courts. Before initiating any legal proceedings, both parties agree to attempt good-faith
        resolution by contacting legal@kerabie.email.
      </P>
    </div>
  );
}

function T13() {
  return (
    <div>
      <H2 n={13}>Changes to These Terms</H2>
      <P>
        We may update these Terms from time to time. For material changes, we will provide at least
        30 days' advance notice by email and via an in-app notification. Non-material changes (e.g.
        corrections, clarifications) may be made without notice.
      </P>
      <P>
        Continued use of the service after the effective date of a material change constitutes your
        acceptance of the updated Terms. If you do not accept the changes, you must stop using the
        service and cancel your subscription before the effective date.
      </P>
    </div>
  );
}

function ContactSection() {
  return (
    <div className="border rounded-2xl p-8 bg-muted/30">
      <h2 className="text-xl font-bold mb-2">Contact</h2>
      <p className="text-muted-foreground mb-4">
        For legal enquiries, data requests, or questions about these Terms:
      </p>
      <div className="space-y-1 text-sm text-muted-foreground">
        <p>Legal: <a href="mailto:legal@kerabie.email" className="text-primary hover:underline">legal@kerabie.email</a></p>
        <p>Privacy: <a href="mailto:privacy@kerabie.email" className="text-primary hover:underline">privacy@kerabie.email</a></p>
        <p>Billing: <a href="mailto:billing@kerabie.email" className="text-primary hover:underline">billing@kerabie.email</a></p>
        <p>Abuse: <a href="mailto:abuse@kerabie.email" className="text-primary hover:underline">abuse@kerabie.email</a></p>
      </div>
    </div>
  );
}
