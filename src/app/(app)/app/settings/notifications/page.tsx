'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/context/auth.context';
import { useAppToast } from '@/components/ui/app-toast';
import { useNotificationPrefs, useUpdateNotificationPrefs } from '@/lib/hooks/useNotifications';
import type { NotificationPrefs } from '@/lib/hooks/useNotifications';
import NotificationsView from '@/components/app/settings/NotificationsView';

export default function NotificationsPage() {
  const { token } = useAuth();
  const { success, error: toastError } = useAppToast();

  const { data: serverPrefs, isLoading } = useNotificationPrefs(token);
  const updatePrefs = useUpdateNotificationPrefs(token);

  const [prefs, setPrefs] = useState<NotificationPrefs>({
    email_new_message: true,
    email_weekly_digest: true,
    email_security_alerts: true,
    email_product_updates: false,
    browser_new_message: false,
    browser_security_alerts: true,
  });

  useEffect(() => {
    if (serverPrefs) setPrefs(serverPrefs);
  }, [serverPrefs]);

  const handleChange = (key: keyof NotificationPrefs, value: boolean) => {
    setPrefs((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    const res = await updatePrefs.mutateAsync(prefs);
    if (res.status === true) {
      success('Notification preferences saved');
    } else {
      toastError('Failed to save preferences', { description: res.response?.detail });
    }
  };

  return (
    <NotificationsView
      prefs={prefs}
      isLoading={isLoading}
      isSaving={updatePrefs.isPending}
      onChange={handleChange}
      onSave={handleSave}
    />
  );
}
