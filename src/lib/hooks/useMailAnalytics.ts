import { useMutation, useQuery } from '@tanstack/react-query';
import { customAxiosGet, customAxiosPost } from '@/lib/utils/CustomAxiosRequest';
import { apiLink } from '@/lib/constants/links';

const base = apiLink;

export interface MailAnalytics {
  days: number;
  total_sent: number;
  total_opened: number;
  open_rate: number;
  opens_per_day: Array<{ date: string; opens: number }>;
  top_links: Array<{ url: string; clicks: number }>;
}

export interface SpamCheckIssue {
  rule: string;
  severity: 'low' | 'medium' | 'high';
  message: string;
}

export interface SpamCheckResult {
  score: number;
  risk_level: 'low' | 'medium' | 'high';
  issues: SpamCheckIssue[];
}

// Heuristic pre-send check, ungated on every plan -- see the backend's
// app/utils/spam_check.py for what it actually checks.
export function useSpamCheck(token: string | null) {
  return useMutation({
    mutationFn: async (data: { subject: string; body_html?: string; body_text?: string }) => {
      const res = await customAxiosPost(`${base}/mail/spam-check`, data, '', token ?? '');
      return res.status === true ? (res.response as SpamCheckResult) : null;
    },
  });
}

export type MailActivityEventType = 'sent' | 'failed' | 'opened' | 'clicked' | 'bounced' | 'complained' | 'unsubscribed';

export interface MailActivityEvent {
  type: MailActivityEventType;
  at: string;
  scheduled_id: number;
  subject: string;
  to: string[];
  url?: string;
  detail?: string | null;
}

// Polled on a short interval rather than pushed over a socket — same
// tradeoff useCampaignStats already makes (15s) for its "live" campaign
// send progress. Ungated on the backend (GET /mail/activity), unlike
// useMailAnalytics above, since it's per-message timestamps the sender
// already owns rather than an aggregated Premium analytics product.
export function useMailActivity(token: string | null, email: string | null, limit = 50) {
  return useQuery({
    queryKey: ['mail-activity', email, token],
    queryFn: async () => {
      const res = await customAxiosGet(`${base}/mail/activity`, { email, limit }, token ?? undefined);
      return res.status === true ? ((res.response as { events: MailActivityEvent[] }).events ?? []) : [];
    },
    enabled: email != null,
    refetchInterval: 8000,
  });
}

// Gated the same as GET /mail/sent/{id}/heatmap (has_heatmaps, Premium) —
// a 403 is a real, expected response here, not an error, so the caller
// checks `forbidden` rather than treating every non-200 the same way.
export function useMailAnalytics(token: string | null, email: string | null, days: number) {
  return useQuery({
    queryKey: ['mail-analytics', email, days, token],
    queryFn: async () => {
      const res = await customAxiosGet(`${base}/mail/analytics`, { email, days }, token ?? undefined);
      return {
        data: res.status === true ? (res.response as MailAnalytics) : null,
        // On failure, extractErrorMessage (CustomAxiosRequest.ts) puts the
        // numeric HTTP status on statusCode and the extracted detail STRING
        // directly on `response` — not an object with its own .detail.
        forbidden: res.statusCode === 403,
      };
    },
    enabled: email != null,
  });
}
