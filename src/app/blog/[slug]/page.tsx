import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { marked } from 'marked';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  getArticle, getArticles, getPricingData,
  formatDate, tagsArray,
  type PricingData,
} from '@/lib/articles';
import { ArrowLeft, Clock } from 'lucide-react';

// All blog posts — ISR at 12h for posts with live pricing, 1h for others
export const revalidate = 3600;

export const dynamicParams = true;

export async function generateStaticParams() {
  try {
    const posts = await getArticles({ article_type: 'blog', limit: 100 });
    return posts.map(p => ({ slug: p.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const post = await getArticle(slug).catch(() => null);
  if (!post) return { title: 'Not found' };
  return {
    title: post.seo_title ?? post.title,
    description: post.seo_description ?? post.excerpt ?? undefined,
    openGraph: { title: post.seo_title ?? post.title, type: 'article' },
  };
}

const LIVE_PRICING_PLACEHOLDER = '{{PRICING_TABLE}}';
const LIVE_DATE_PLACEHOLDER = '{{LAST_UPDATED}}';

// NOTE: every line below starts at column 0 with no leading whitespace —
// deliberately, not for style. This string gets spliced into markdown and
// run through marked(). CommonMark recognizes a block starting with a
// top-level tag like <div> as a raw HTML block that passes through
// unprocessed, but ONLY up to the next blank line — and a line containing
// only spaces counts as blank. Indenting these lines (as this used to)
// produced a whitespace-only line right after <tbody>, which silently
// ended the HTML block partway through; the remaining indented lines then
// got reparsed as an indented markdown code block and rendered as escaped
// text instead of a table.
function buildPricingTable(data: PricingData): string {
  const { kerabie, competitors, last_updated } = data;

  const kerabieRows = kerabie.map(p => `<tr>
<td><strong>Kerabie Mail — ${p.name}</strong></td>
<td>${p.price_usd === 0 ? 'Free' : `$${p.price_usd}/mo`}</td>
<td>${p.storage_gb < 1 ? `${p.storage_gb * 1024} MB` : `${p.storage_gb} GB`}</td>
<td>${p.mailboxes}</td>
<td>${p.custom_domain ? '✅' : '—'}</td>
</tr>`).join('\n');

  const competitorRows = Object.values(competitors).flatMap(provider =>
    provider.plans.slice(0, 1).map(plan => `<tr>
<td>${provider.name}</td>
<td>${plan.price_text}</td>
<td>—</td>
<td>—</td>
<td>✅</td>
</tr>`)
  ).join('\n');

  return `<div class="overflow-x-auto my-6">
<table>
<thead>
<tr>
<th>Provider</th>
<th>Starting price</th>
<th>Storage</th>
<th>Mailboxes</th>
<th>Custom domain</th>
</tr>
</thead>
<tbody>
${kerabieRows}
${competitorRows}
</tbody>
</table>
</div>`;
}

export default async function BlogPostPage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const post = await getArticle(slug).catch(() => null);
  if (!post || post.article_type !== 'blog') notFound();

  const needsLivePricing = post.content.includes(LIVE_PRICING_PLACEHOLDER);

  // For live-pricing articles, fetch with 12h revalidation
  let content = post.content;
  if (needsLivePricing) {
    const pricingData = await getPricingData().catch(() => null);
    const table = pricingData ? buildPricingTable(pricingData) : '';
    const lastUpdated = pricingData?.last_updated
      ? new Date(pricingData.last_updated).toLocaleString('en-US', {
          dateStyle: 'medium', timeStyle: 'short',
        })
      : 'recently';
    content = content
      .replace(LIVE_PRICING_PLACEHOLDER, table)
      .replace(new RegExp(LIVE_DATE_PLACEHOLDER.replace(/[{}]/g, '\\$&'), 'g'), lastUpdated);
  }

  const html = await marked(content, { gfm: true, breaks: false });
  const tags = tagsArray(post.tags);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-12 max-w-3xl">
        {/* Back */}
        <Link href="/blog" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-8 transition-colors">
          <ArrowLeft className="h-4 w-4" /> All posts
        </Link>

        {/* Meta */}
        <div className="mb-6 flex flex-wrap gap-2 items-center">
          {tags.map(tag => (
            <Badge key={tag} variant="outline" className="text-xs capitalize">{tag}</Badge>
          ))}
        </div>

        <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-4">{post.title}</h1>

        {post.excerpt && (
          <p className="text-lg text-muted-foreground mb-4">{post.excerpt}</p>
        )}

        <div className="flex items-center gap-1 text-sm text-muted-foreground mb-10 pb-8 border-b">
          <Clock className="h-4 w-4" />
          <span>{formatDate(post.published_at)}</span>
          {needsLivePricing && (
            <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
              Live pricing data
            </span>
          )}
        </div>

        {/* Article body */}
        <article
          className="prose prose-slate max-w-none
            prose-headings:font-bold prose-headings:text-foreground
            prose-p:text-foreground/80 prose-p:leading-relaxed
            prose-a:text-primary prose-a:no-underline hover:prose-a:underline
            prose-strong:text-foreground
            prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:before:content-none prose-code:after:content-none
            prose-pre:bg-muted prose-pre:border prose-pre:rounded-xl
            prose-table:w-full prose-th:bg-muted/50 prose-th:text-left prose-th:p-3 prose-td:p-3 prose-td:border-b
            prose-blockquote:border-l-primary prose-blockquote:bg-muted/30 prose-blockquote:rounded-r-lg prose-blockquote:py-1"
          dangerouslySetInnerHTML={{ __html: html }}
        />

        {/* CTA */}
        <div className="mt-16 p-8 bg-primary/5 border border-primary/20 rounded-2xl text-center">
          <h3 className="text-xl font-bold mb-2">Try Kerabie Mail free</h3>
          <p className="text-muted-foreground mb-4">
            1 mailbox, no credit card required. Upgrade when you're ready.
          </p>
          <Button asChild size="lg">
            <Link href="https://kerabie.email">Get started free →</Link>
          </Button>
        </div>
      </main>

      <Footer />
    </div>
  );
}
