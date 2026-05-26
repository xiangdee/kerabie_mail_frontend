import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import {
  ArrowRight, CheckCircle2, DollarSign, Server,
  Share2, Wallet, BarChart3, Headphones, Zap,
  ChevronDown,
} from 'lucide-react';

// ── Data ─────────────────────────────────────────────────────────────────────

const PILLARS = [
  {
    icon: DollarSign,
    color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    title: 'Referral commissions',
    description:
      'Share your unique referral link and earn up to 20% of every plan your referrals subscribe to — every month, for as long as they stay.',
  },
  {
    icon: Server,
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    title: 'Hosted mailboxes',
    description:
      'Provision and manage email accounts for your clients directly from your partner dashboard. Set your own margin and keep the difference.',
  },
  {
    icon: Wallet,
    color: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
    title: 'Flexible payouts',
    description:
      'Choose how you get paid — bank transfer, PayPal, or USDT crypto. Payouts go out monthly with no minimum threshold.',
  },
];

const STEPS = [
  {
    number: '01',
    title: 'Apply in minutes',
    description: 'Fill in your payout details and submit your partner application. Most applications are reviewed within 48 hours.',
  },
  {
    number: '02',
    title: 'Get your referral code',
    description: 'Once approved, you receive a unique referral code and shareable link to distribute anywhere — your website, newsletter, or social channels.',
  },
  {
    number: '03',
    title: 'Earn every month',
    description: 'Every time a referral subscribes to a paid plan, your commission is calculated and paid out on the monthly payout cycle.',
  },
];

const PERKS = [
  'Dedicated partner dashboard',
  'Real-time referral & earnings tracking',
  'Trial mailbox provisioning for clients',
  'Priority partner support',
  'Monthly payouts — bank, PayPal, or crypto',
  'Co-marketing & co-branding opportunities',
  'Multi-domain & reseller support',
  'No minimum referral count to start earning',
];

const FAQ = [
  {
    q: 'How much can I earn?',
    a: 'Partners earn up to 20% of every plan their referrals subscribe to, recurring monthly for as long as those customers stay subscribed. The more referrals you send, the more you earn — with no cap.',
  },
  {
    q: 'When do I get paid?',
    a: 'Payouts are processed on the first business day of each month for the previous month\'s commissions. Choose bank transfer, PayPal, or USDT crypto — whatever works best for you.',
  },
  {
    q: 'Is there a minimum referral count?',
    a: 'No. You earn from your very first referral. There\'s no minimum threshold before you can request a payout.',
  },
  {
    q: 'What are hosted mailboxes?',
    a: 'Approved partners can provision and manage Kerabie mailboxes on behalf of their own clients — great for agencies, web hosts, and IT consultants who want to offer email as part of their service stack.',
  },
  {
    q: 'How long does approval take?',
    a: 'Most applications are reviewed within 48 hours. You\'ll receive an email once your application has been approved or if we need more information.',
  },
  {
    q: 'Can I white-label or co-brand?',
    a: 'Yes. Approved partners can explore white-label and co-branding options with our partnerships team — reach out after you\'re approved.',
  },
];

// ── Page ──────────────────────────────────────────────────────────────────────

export default function PartnerPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* ── Hero ── */}
      <section className="relative overflow-hidden pt-24 pb-20">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,hsl(var(--primary)/0.12),transparent)]" />
        <div className="container mx-auto px-4 text-center">
          <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            Partner Program
          </span>
          <h1 className="mt-4 mb-6 text-4xl font-extrabold tracking-tight text-foreground md:text-6xl lg:leading-[1.1]">
            Turn your audience<br />
            <span className="text-primary">into recurring income</span>
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground md:text-xl">
            Refer businesses to Kerabie Mail and earn up to{' '}
            <strong className="text-foreground">20% commission</strong> on every plan they subscribe
            to — every month, forever. No cap. No expiry.
          </p>

          {/* Stats row */}
          <div className="mb-10 flex flex-wrap justify-center gap-6 text-sm">
            {[
              'Up to 20% recurring commission',
              'Lifetime referral tracking',
              'Monthly payouts',
              'No minimum threshold',
            ].map((item) => (
              <div key={item} className="flex items-center gap-2 text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                {item}
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button size="lg" className="px-8 h-12 text-base" asChild>
              <Link href="/auth/register">
                Apply now <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="px-8 h-12 text-base" asChild>
              <Link href="/auth/login">Already a partner? Sign in</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── Three pillars ── */}
      <section className="border-t border-b py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">Three ways to earn</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              The Kerabie partner program is built for agencies, developers, and content creators who want a
              reliable, growing income stream.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {PILLARS.map(({ icon: Icon, color, title, description }) => (
              <div key={title} className="flex flex-col items-center text-center p-8 rounded-2xl border bg-background space-y-4">
                <div className={`p-4 rounded-2xl ${color}`}>
                  <Icon className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold">{title}</h3>
                <p className="text-muted-foreground leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-3">How it works</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Getting started takes less than five minutes.
            </p>
          </div>
          <div className="relative grid gap-8 md:grid-cols-3 max-w-4xl mx-auto">
            {STEPS.map(({ number, title, description }, i) => (
              <div key={number} className="relative flex flex-col items-center text-center space-y-4">
                {i < STEPS.length - 1 && (
                  <div className="hidden md:block absolute top-6 left-[calc(50%+2rem)] w-[calc(100%-4rem)] h-px border-t-2 border-dashed border-border" />
                )}
                <div className="relative z-10 flex items-center justify-center h-12 w-12 rounded-full bg-primary text-primary-foreground text-lg font-bold shrink-0">
                  {number}
                </div>
                <h3 className="text-lg font-semibold">{title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Commission callout ── */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold">Your earnings add up fast</h2>
              <p className="text-primary-foreground/80 text-lg leading-relaxed">
                Send 20 referrals on a $12/month plan and you pocket{' '}
                <strong className="text-primary-foreground">$2.40 per customer every month</strong> — that&apos;s{' '}
                <strong className="text-primary-foreground">$576 a year</strong> from a single batch of referrals. And it keeps compounding.
              </p>
              <Button size="lg" variant="secondary" className="px-8 h-12 text-base" asChild>
                <Link href="/auth/register">
                  Start earning <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Commission rate', value: 'Up to 20%' },
                { label: 'Referral tracking', value: 'Lifetime' },
                { label: 'Payout cycle', value: 'Monthly' },
                { label: 'Minimum payout', value: '$0' },
              ].map(({ label, value }) => (
                <div key={label} className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 text-center space-y-1">
                  <p className="text-2xl font-bold">{value}</p>
                  <p className="text-sm text-primary-foreground/70">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Partner perks ── */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold">Everything partners get</h2>
              <p className="text-muted-foreground">
                From day one you have access to a full suite of tools to track, grow, and monetize your referrals.
              </p>
              <div className="grid gap-3">
                {PERKS.map((perk) => (
                  <div key={perk} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                    <span className="text-foreground">{perk}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid gap-6">
              {[
                { icon: BarChart3, title: 'Real-time dashboard', description: 'Track clicks, signups, and commissions from a single panel.' },
                { icon: Share2, title: 'Shareable referral link', description: 'One unique link — drop it anywhere and Kerabie handles the rest.' },
                { icon: Headphones, title: 'Priority support', description: 'Partners jump the queue. Our team is ready when you need us.' },
                { icon: Zap, title: 'Instant mailbox provisioning', description: 'Spin up trial mailboxes for your clients in seconds.' },
              ].map(({ icon: Icon, title, description }) => (
                <div key={title} className="flex items-start gap-4 p-5 rounded-2xl border bg-muted/20">
                  <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm mb-1">{title}</p>
                    <p className="text-sm text-muted-foreground">{description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-20 border-t bg-muted/30">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">Frequently asked questions</h2>
            <p className="text-muted-foreground">Everything you need to know before applying.</p>
          </div>
          <div className="space-y-4">
            {FAQ.map(({ q, a }) => (
              <details
                key={q}
                className="group rounded-2xl border bg-background px-6 py-5 cursor-pointer"
              >
                <summary className="flex items-center justify-between gap-4 font-medium list-none select-none">
                  {q}
                  <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
                </summary>
                <p className="mt-4 text-muted-foreground leading-relaxed text-sm">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="py-24 text-center">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto bg-linear-to-br from-primary/10 to-blue-500/10 rounded-3xl p-10 md:p-14 border space-y-6">
            <div className="inline-flex items-center justify-center p-4 bg-primary/10 rounded-2xl">
              <DollarSign className="h-10 w-10 text-primary" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold">Ready to start earning?</h2>
            <p className="text-muted-foreground text-lg">
              Create a free account, apply for the partner program, and have your referral link ready in under five minutes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
              <Button size="lg" className="px-8 h-12 text-base" asChild>
                <Link href="/auth/register">
                  Apply now — it&apos;s free <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="px-8 h-12 text-base" asChild>
                <Link href="/contact">Talk to partnerships</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
