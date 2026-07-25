import type { Metadata } from 'next';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Badge } from '@/components/ui/badge';
import { getArticles, getCategories, formatDate, tagsArray } from '@/lib/articles';
import { BookOpen, Clock, TrendingUp } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Tips, product news, comparisons, and insights from the Kerabie Mail team.',
};

export const revalidate = 3600;

export default async function BlogPage() {
  const [all, featured, categories] = await Promise.all([
    getArticles({ article_type: 'blog', limit: 100 }).catch(() => []),
    getArticles({ article_type: 'blog', featured: true, limit: 3 }).catch(() => []),
    getCategories().catch(() => []),
  ]);

  const catMap = Object.fromEntries(categories.map(c => [c.id, c]));

  const rest = all.filter(a => !featured.some(f => f.id === a.id));

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section className="py-16 bg-muted/30 border-b">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-2xl mb-4">
            <BookOpen className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Kerabie Mail Blog</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Product updates, email tips, comparisons, and thoughts from the team.
          </p>
        </div>
      </section>

      <main className="container mx-auto px-4 py-16">

        {/* Featured posts */}
        {featured.length > 0 && (
          <section className="mb-16">
            <div className="flex items-center gap-2 mb-8">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold">Featured</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {featured.map(post => (
                <ArticleCard key={post.id} post={post} catMap={catMap} featured />
              ))}
            </div>
          </section>
        )}

        {/* All posts */}
        {rest.length > 0 && (
          <section>
            <h2 className="text-xl font-bold mb-8">All posts</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rest.map(post => (
                <ArticleCard key={post.id} post={post} catMap={catMap} />
              ))}
            </div>
          </section>
        )}

        {all.length === 0 && (
          <div className="text-center py-24 text-muted-foreground">
            No posts yet. Check back soon.
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

function ArticleCard({
  post,
  catMap,
  featured = false,
}: {
  post: Awaited<ReturnType<typeof getArticles>>[0];
  catMap: Record<number, { name: string; slug: string }>;
  featured?: boolean;
}) {
  const tags = tagsArray(post.tags).slice(0, 2);
  const category = post.category_id ? catMap[post.category_id] : null;

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex flex-col bg-card border rounded-2xl overflow-hidden hover:shadow-md transition-shadow"
    >
      {/* Colour band instead of image */}
      <div className="h-2 bg-primary/60 group-hover:bg-primary transition-colors" />

      <div className="flex flex-col flex-1 p-6 gap-3">
        <div className="flex flex-wrap gap-2">
          {featured && (
            <Badge variant="secondary" className="text-xs">Featured</Badge>
          )}
          {tags.map(tag => (
            <Badge key={tag} variant="outline" className="text-xs capitalize">{tag}</Badge>
          ))}
        </div>

        <h3 className="font-bold text-lg leading-snug group-hover:text-primary transition-colors line-clamp-2">
          {post.title}
        </h3>

        {post.excerpt && (
          <p className="text-sm text-muted-foreground line-clamp-3">{post.excerpt}</p>
        )}

        <div className="mt-auto flex items-center gap-1 text-xs text-muted-foreground pt-2">
          <Clock className="h-3 w-3" />
          <span>{formatDate(post.published_at)}</span>
          {category && (
            <>
              <span className="mx-1">·</span>
              <span className="capitalize">{category.name}</span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}
