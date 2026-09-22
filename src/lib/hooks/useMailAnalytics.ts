import { useQuery } from '@tanstack/react-query';
import { customAxiosGet } from '@/lib/utils/CustomAxiosRequest';
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
