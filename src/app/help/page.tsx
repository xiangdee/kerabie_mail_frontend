import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Corners } from '@/components/ui/corners';
import { NavLink } from '@/components/NavLink';
import { getArticles, getCategories } from '@/lib/articles';
import {
  Rocket, Mail, ShieldCheck, CreditCard, Code2, ChevronRight, Star, Search,
} from 'lucide-react';
import type { ComponentType } from 'react';

export const metadata: Metadata = {
  title: 'Help Center',
  description: 'Find answers, setup guides, and documentation for Kerabie Mail.',
};

export const revalidate = 3600;

const CATEGORY_ICONS: Record<string, ComponentType<{ size?: number; className?: string; strokeWidth?: number }>> = {
  'getting-started': Rocket,
  'email-features': Mail,
  'account-security': ShieldCheck,
  'billing-plans': CreditCard,
  'technical-developers': Code2,
};

export default async function HelpPage() {
  const [articles, categories] = await Promise.all([
    getArticles({ article_type: 'help', limit: 100 }).catch(() => []),
    getCategories().catch(() => []),
  ]);

  const helpCats = categories.filter(c => CATEGORY_ICONS[c.slug] !== undefined);

  const articlesByCat = Object.fromEntries(
    helpCats.map(cat => [cat.id, articles.filter(a => a.category_id === cat.id)]),
  );

  const featured = articles.filter(a => a.featured).slice(0, 4);
  const populatedCats = helpCats.filter(cat => (articlesByCat[cat.id] ?? []).length > 0);

  return (
    <div className="min-h-screen max-w-full overflow-x-hidden bg-background">
      <Header />

      <main className="mx-auto max-w-[1240px] px-4">
        {/* Hero */}
        <section className="pt-16 text-center">
          <span className="inline-flex items-center gap-2.5">
            <span className="grid h-[38px] w-[38px] place-items-center border border-border bg-muted">
              <Image src="/k-leaf-icon.png" width={18} height={18} alt="Kerabie" />
            </span>
            <span className="border border-border bg-muted px-5 py-2.5 text-xs font-semibold tracking-widest text-primary-hover">
              HELP CENTRE
            </span>
          </span>

          <h1 className="mx-auto mt-5 mb-3 max-w-[22ch] text-4xl leading-[1.08] tracking-tight sm:text-[54px]">
            How can we <span className="text-primary">help</span>?
          </h1>
          <p className="mx-auto mb-6 max-w-[52ch] text-base text-muted-foreground">
            Setup guides, DNS records and billing answers — or a human in under two hours.
          </p>
          <div className="mx-auto flex max-w-[520px] gap-2.5">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                placeholder="Search: DNS records, migration, app password…"
                readOnly
                className="h-[46px] w-full border border-border bg-white pl-10 pr-3.5 text-sm outline-none focus:border-primary"
              />
            </div>
            <NavLink
              href="/contact"
              className="inline-flex items-center gap-2 border border-primary bg-primary px-5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
            >
              Search
            </NavLink>
          </div>
        </section>

        {/* Categories */}
        {populatedCats.length > 0 && (
          <section className="pt-11">
            <div className={`grid grid-cols-1 gap-3.5 sm:grid-cols-2 ${populatedCats.length >= 4 ? "lg:grid-cols-4" : ""}`}>
              {populatedCats.map((cat, i) => {
                const Icon = CATEGORY_ICONS[cat.slug];
                return (
                  <div
                    key={cat.id}
                    className={`blueprint relative p-6 transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(26,31,30,.08)] ${i % 2 === 1 ? "bg-muted" : ""}`}
                  >
                    <Corners />
                    <Icon size={18} className="text-primary" strokeWidth={1.5} />
                    <h3 className="mb-1.5 mt-3 text-[19px]">{cat.name}</h3>
                    <p className="text-[13px] leading-relaxed text-muted-foreground">
                      {cat.description ?? `${(articlesByCat[cat.id] ?? []).length} article${(articlesByCat[cat.id] ?? []).length === 1 ? '' : 's'}`}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Articles + sidebar */}
        <section className="grid grid-cols-1 gap-3.5 pt-14 lg:grid-cols-12">
          <div className="blueprint relative col-span-1 p-8 lg:col-span-8">
            <Corners />

            {featured.length > 0 && (
              <div className="mb-7">
                <div className="mb-4 flex items-center gap-2">
                  <Star size={16} className="fill-primary text-primary" />
                  <h2 className="text-lg font-bold">Popular articles</h2>
                </div>
                <div className="grid gap-2.5 sm:grid-cols-2">
                  {featured.map(article => (
                    <Link
                      key={article.id}
                      href={`/help/${article.slug}`}
                      className="border border-border p-3.5 transition-colors hover:border-primary/50 hover:bg-muted"
                    >
                      <h3 className="line-clamp-2 text-sm font-semibold leading-snug">{article.title}</h3>
                      {article.excerpt && (
                        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{article.excerpt}</p>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {populatedCats.length > 0 ? (
              <div className="grid gap-7 sm:grid-cols-2">
                {populatedCats.map(cat => (
                  <div key={cat.id}>
                    <div className="mb-2 flex items-center gap-2 border-b border-border pb-2">
                      <h2 className="text-base font-bold">{cat.name}</h2>
                    </div>
                    <ul className="grid gap-0.5">
                      {(articlesByCat[cat.id] ?? []).map(article => (
                        <li key={article.id}>
                          <Link
                            href={`/help/${article.slug}`}
                            className="group flex items-center justify-between gap-2 py-2 text-sm transition-colors hover:text-primary"
                          >
                            {article.title}
                            <ChevronRight size={15} className="shrink-0 text-muted-foreground group-hover:text-primary" />
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Articles are on the way. In the meantime, our team answers directly —{" "}
                <NavLink href="/contact" className="text-primary underline">get in touch</NavLink>.
              </p>
            )}
          </div>

          <div className="col-span-1 grid content-start gap-3.5 lg:col-span-4">
            <div className="blueprint relative overflow-hidden bg-[#2E4A3F] p-6 text-[#E8EDEB]">
              <Corners className="text-white/50" />
              <div
                className="pointer-events-none absolute inset-y-0 w-[40%] animate-[k-sweep_8s_ease-in-out_infinite]"
                style={{ background: "linear-gradient(90deg,transparent,rgba(90,138,120,.26),transparent)" }}
              />
              <span className="relative inline-flex items-center gap-2 font-mono text-[10.5px] tracking-[.12em] text-[#8FB3A6]">
                <span className="block h-1.5 w-1.5 animate-[k-pulse_2s_infinite] bg-[#4CAF80]" />
                ALL SYSTEMS OPERATIONAL
              </span>
              <p className="relative mt-3 text-[13.5px] leading-relaxed text-[#B7CEC5]">
                Uptime and incident history are posted as they happen — nothing to report right now.
              </p>
            </div>
            <div className="blueprint relative p-6">
              <Corners />
              <span className="block font-mono text-[10.5px] tracking-[.12em] text-muted-foreground">STILL STUCK?</span>
              <p className="my-2.5 text-[13.5px] leading-relaxed">
                Support answers in under two hours, 24/7 — including on the free plan.
              </p>
              <NavLink
                href="/contact"
                className="inline-flex items-center gap-2 bg-primary px-4 py-2.5 text-[13.5px] font-semibold text-white transition-colors hover:bg-primary-hover"
              >
                Contact support
              </NavLink>
            </div>
            <div className="blueprint relative bg-primary-muted p-6">
              <Corners />
              <p className="text-[13.5px] leading-relaxed text-primary-hover">
                Manual server settings for any mail client live on the{" "}
                <NavLink href="/downloads" className="underline">downloads page</NavLink>.
              </p>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="pb-[72px] pt-14">
          <div className="blueprint relative bg-muted px-6 py-11 text-center sm:px-10">
            <Corners />
            <h2 className="mb-2.5 text-[32px] tracking-tight">Nothing to lose — start free.</h2>
            <p className="mx-auto mb-[22px] max-w-[48ch] text-[15px] text-muted-foreground">
              One mailbox, no card, and migration help included.
            </p>
            <NavLink
              href="/auth/register"
              className="inline-flex items-center gap-2 border border-primary bg-primary px-[22px] py-3.5 text-[15px] font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-primary-hover"
            >
              Get free mailbox
            </NavLink>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
