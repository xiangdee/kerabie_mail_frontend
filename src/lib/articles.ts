const API_URL = process.env.API_URL ?? 'http://localhost:5000';

export interface ArticleCategory {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  display_order: number;
}

export interface ArticleListItem {
  id: number;
  slug: string;
  title: string;
  excerpt: string | null;
  cover_image_url: string | null;
  category_id: number | null;
  article_type: string;
  featured: boolean;
  view_count: number;
  published_at: string | null;
  tags: string | null;
}

export interface Article extends ArticleListItem {
  content: string;
  status: string;
  seo_title: string | null;
  seo_description: string | null;
  author_id: number | null;
  created_at: string;
  updated_at: string;
}

export interface KerabiePlan {
  name: string;
  price_usd: number;
  price_ngn?: number;
  price_usd_annual?: number;
  mailboxes: number;
  storage_gb: number;
  emails_per_day: number;
  custom_domain: boolean;
  ai_compose: boolean;
  calendar: boolean;
  contacts: boolean;
  api_access: boolean;
  webhooks: boolean;
  aliases: number | null;
  forwarding_rules: number | null;
}

export interface PricingData {
  kerabie: KerabiePlan[];
  competitors: Record<string, {
    name: string;
    plans: { name?: string; price_text: string; context?: string }[];
    url: string;
    scraped_at: string;
    stale: boolean;
  }>;
  last_updated: string | null;
}

// ─── fetchers ──────────────────────────────────────────────────────────────

export async function getCategories(): Promise<ArticleCategory[]> {
  const res = await fetch(`${API_URL}/articles/categories`, {
    next: { revalidate: 3600 },
  });
  if (!res.ok) return [];
  return res.json();
}

export async function getArticles(params?: {
  article_type?: string;
  category_id?: number;
  featured?: boolean;
  limit?: number;
  offset?: number;
}): Promise<ArticleListItem[]> {
  const qs = new URLSearchParams();
  if (params?.article_type) qs.set('article_type', params.article_type);
  if (params?.category_id) qs.set('category_id', String(params.category_id));
  if (params?.featured !== undefined) qs.set('featured', String(params.featured));
  if (params?.limit) qs.set('limit', String(params.limit));
  if (params?.offset) qs.set('offset', String(params.offset));

  const res = await fetch(`${API_URL}/articles?${qs}`, {
    next: { revalidate: 3600 },
  });
  if (!res.ok) return [];
  return res.json();
}

export async function getArticle(slug: string): Promise<Article | null> {
  const res = await fetch(`${API_URL}/articles/${slug}`, {
    next: { revalidate: 3600 },
  });
  if (!res.ok) return null;
  return res.json();
}

export async function getPricingData(): Promise<PricingData> {
  const res = await fetch(`${API_URL}/articles/pricing-data`, {
    next: { revalidate: 43200 }, // 12h — matches scrape schedule
  });
  if (!res.ok) return { kerabie: [], competitors: {}, last_updated: null };
  return res.json();
}

// ─── helpers ──────────────────────────────────────────────────────────────

export function formatDate(iso: string | null): string {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
}

export function tagsArray(tags: string | null): string[] {
  if (!tags) return [];
  return tags.split(',').map(t => t.trim()).filter(Boolean);
}
