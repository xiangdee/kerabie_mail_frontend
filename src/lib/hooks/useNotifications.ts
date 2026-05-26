import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { customAxiosGet, customAxiosRequest } from '@/lib/utils/CustomAxiosRequest';
import { apiLink } from '@/lib/constants/links';

const base = apiLink;

export interface NotificationPrefs {
  email_new_message: boolean;
  email_weekly_digest: boolean;
  email_security_alerts: boolean;
  email_product_updates: boolean;
  browser_new_message: boolean;
  browser_security_alerts: boolean;
}

const DEFAULT_PREFS: NotificationPrefs = {
  email_new_message: true,
  email_weekly_digest: true,
  email_security_alerts: true,
  email_product_updates: false,
  browser_new_message: false,
  browser_security_alerts: true,
};

export function useNotificationPrefs(token: string | null) {
  return useQuery({
    queryKey: ['notification-prefs', token],
    queryFn: async () => {
      if (!token) return DEFAULT_PREFS;
      const res = await customAxiosGet(`${base}/notifications/preferences`, undefined, token);
      return res.status === true ? (res.response as NotificationPrefs) : DEFAULT_PREFS;
    },
    enabled: !!token,
    staleTime: 5 * 60_000,
  });
}

export function useUpdateNotificationPrefs(token: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<NotificationPrefs>) =>
      customAxiosRequest('put', `${base}/notifications/preferences`, data, '', token ?? ''),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notification-prefs'] }),
  });
}
