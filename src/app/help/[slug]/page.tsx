import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { marked } from 'marked';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getArticle, getArticles, getCategories, formatDate, tagsArray } from '@/lib/articles';
import { ArrowLeft, ChevronRight, Clock } from 'lucide-react';

export const revalidate = 3600;

export const dynamicParams = true;

export async function generateStaticParams() {
  try {
    const articles = await getArticles({ article_type: 'help', limit: 200 });
    return articles.map(a => ({ slug: a.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug).catch(() => null);
  if (!article) return { title: 'Not found' };
  return {
    title: article.seo_title ?? article.title,
    description: article.seo_description ?? article.excerpt ?? undefined,
  };
}

export default async function HelpArticlePage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const [article, categories, allHelp] = await Promise.all([
    getArticle(slug).catch(() => null),
    getCategories().catch(() => []),
    getArticles({ article_type: 'help', limit: 200 }).catch(() => []),
  ]);

  if (!article || article.article_type !== 'help') notFound();

  const html = await marked(article.content, { gfm: true, breaks: false });
  const tags = tagsArray(article.tags);

  const category = categories.find(c => c.id === article.category_id);

  // Related: same category, exclude current
  const related = allHelp
    .filter(a => a.category_id === article.category_id && a.id !== article.id)
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-10 max-w-6xl">
        <div className="flex flex-col lg:flex-row gap-12">

          {/* Main content */}
          <main className="flex-1 min-w-0">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-1 text-sm text-muted-foreground mb-8">
              <Link href="/help" className="hover:text-primary transition-colors">Help Center</Link>
              {category && (
                <>
                  <ChevronRight className="h-3 w-3" />
                  <span>{category.name}</span>
                </>
              )}
              <ChevronRight className="h-3 w-3" />
              <span className="text-foreground truncate">{article.title}</span>
            </nav>

            <div className="mb-3 flex flex-wrap gap-2">
              {tags.map(tag => (
                <Badge key={tag} variant="outline" className="text-xs capitalize">{tag}</Badge>
              ))}
            </div>

            <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-3">{article.title}</h1>

            {article.excerpt && (
              <p className="text-lg text-muted-foreground mb-4">{article.excerpt}</p>
            )}

            <div className="flex items-center gap-1 text-sm text-muted-foreground mb-10 pb-8 border-b">
              <Clock className="h-4 w-4" />
              <span>Updated {formatDate(article.updated_at)}</span>
            </div>

            <article
              className="prose prose-slate max-w-none
                prose-headings:font-bold prose-headings:text-foreground
                prose-p:text-foreground/80 prose-p:leading-relaxed
                prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                prose-strong:text-foreground
                prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:before:content-none prose-code:after:content-none
                prose-pre:bg-muted prose-pre:border prose-pre:rounded-xl
                [&_pre_code]:bg-transparent [&_pre_code]:text-foreground [&_pre_code]:p-0
                prose-table:w-full prose-th:bg-muted/50 prose-th:text-left prose-th:p-3 prose-td:p-3 prose-td:border-b
                prose-blockquote:border-l-primary prose-blockquote:bg-muted/30 prose-blockquote:rounded-r-lg prose-blockquote:py-1
                prose-li:text-foreground/80"
              dangerouslySetInnerHTML={{ __html: html }}
            />

            {/* CTA */}
            <div className="mt-12 p-6 bg-primary/5 border border-primary/20 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="font-bold mb-1">Still need help?</h3>
                <p className="text-sm text-muted-foreground">Our team is here for you.</p>
              </div>
              <Button asChild variant="outline">
                <Link href="mailto:support@kerabie.email">Contact support</Link>
              </Button>
            </div>

            {/* Back */}
            <div className="mt-8">
              <Link href="/help" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors">
                <ArrowLeft className="h-4 w-4" /> Back to Help Center
              </Link>
            </div>
          </main>

          {/* Sidebar */}
          {related.length > 0 && (
            <aside className="lg:w-72 shrink-0">
              <div className="sticky top-8">
                <h2 className="font-bold text-sm text-muted-foreground uppercase tracking-wider mb-4">
                  {category ? `More in ${category.name}` : 'Related articles'}
                </h2>
                <ul className="space-y-1">
                  {related.map(rel => (
                    <li key={rel.id}>
                      <Link
                        href={`/help/${rel.slug}`}
                        className="group flex items-center gap-2 py-2 px-2 rounded-lg hover:bg-muted/50 transition-colors text-sm"
                      >
                        <ChevronRight className="h-3 w-3 shrink-0 text-muted-foreground group-hover:text-primary transition-colors" />
                        <span className="group-hover:text-primary transition-colors">{rel.title}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
