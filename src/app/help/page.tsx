import type { Metadata } from 'next';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Input } from '@/components/ui/input';
import { getArticles, getCategories } from '@/lib/articles';
import { HelpCircle, ChevronRight, Search, Star } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Help Center',
  description: 'Find answers, setup guides, and documentation for Kerabie Mail.',
};

export const revalidate = 3600;

const CATEGORY_ICONS: Record<string, string> = {
  'getting-started':      '🚀',
  'email-features':       '✉️',
  'account-security':     '🔐',
  'billing-plans':        '💳',
  'technical-developers': '⚙️',
};

export default async function HelpPage() {
  const [articles, categories] = await Promise.all([
    getArticles({ article_type: 'help', limit: 100 }).catch(() => []),
    getCategories().catch(() => []),
  ]);

  // Only show help-relevant categories
  const helpCats = categories.filter(c =>
    CATEGORY_ICONS[c.slug] !== undefined
  );

  const articlesByCat = Object.fromEntries(
    helpCats.map(cat => [
      cat.id,
      articles.filter(a => a.category_id === cat.id),
    ])
  );

  const featured = articles.filter(a => a.featured).slice(0, 4);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section className="py-16 bg-muted/30 border-b">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-2xl mb-4">
            <HelpCircle className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Help Center</h1>
          <p className="text-muted-foreground text-lg mb-8">
            Guides, tutorials, and answers for everything Kerabie Mail.
          </p>
          {/* Search hint — client-side search could be added later */}
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search help articles…"
              className="pl-10 bg-background"
              readOnly
            />
          </div>
        </div>
      </section>

      <main className="container mx-auto px-4 py-16">

        {/* Featured articles */}
        {featured.length > 0 && (
          <section className="mb-16">
            <div className="flex items-center gap-2 mb-6">
              <Star className="h-5 w-5 text-primary fill-primary" />
              <h2 className="text-xl font-bold">Popular articles</h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {featured.map(article => (
                <Link
                  key={article.id}
                  href={`/help/${article.slug}`}
                  className="group p-4 bg-card border rounded-xl hover:border-primary/50 hover:shadow-sm transition-all"
                >
                  <h3 className="font-semibold text-sm leading-snug group-hover:text-primary transition-colors line-clamp-2">
                    {article.title}
                  </h3>
                  {article.excerpt && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{article.excerpt}</p>
                  )}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Categories */}
        <div className="grid md:grid-cols-2 gap-10">
          {helpCats.map(cat => {
            const catArticles = articlesByCat[cat.id] ?? [];
            if (catArticles.length === 0) return null;
            return (
              <section key={cat.id} className="space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b">
                  <span className="text-2xl">{CATEGORY_ICONS[cat.slug]}</span>
                  <div>
                    <h2 className="font-bold text-lg">{cat.name}</h2>
                    {cat.description && (
                      <p className="text-xs text-muted-foreground">{cat.description}</p>
                    )}
                  </div>
                </div>
                <ul className="space-y-1">
                  {catArticles.map(article => (
                    <li key={article.id}>
                      <Link
                        href={`/help/${article.slug}`}
                        className="group flex items-center justify-between py-2 px-1 rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <span className="text-sm group-hover:text-primary transition-colors">
                          {article.title}
                        </span>
                        <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 group-hover:text-primary transition-colors" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>

        {/* Contact fallback */}
        <div className="mt-16 text-center p-8 bg-muted/30 rounded-2xl">
          <h3 className="font-bold text-lg mb-2">Can't find what you need?</h3>
          <p className="text-muted-foreground mb-4 text-sm">
            Our support team usually replies within a few hours.
          </p>
          <Link
            href="mailto:support@kerabie.email"
            className="text-primary font-semibold hover:underline text-sm"
          >
            Email support@kerabie.email →
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
