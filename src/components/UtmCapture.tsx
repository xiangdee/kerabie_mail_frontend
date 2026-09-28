'use client';
import { useEffect } from 'react';
import { customAxiosPost } from '@/lib/utils/CustomAxiosRequest';
import { apiLink } from '@/lib/constants/links';

const COOKIE_NAME = 'kerabie_utm';
const TTL_DAYS = 30;

/**
 * Captures ?utm_source=&utm_medium=&utm_campaign= on any page load and
 * persists it in a cookie so it survives browsing before an eventual
 * signup — same shape as ReferralCapture.tsx's kerabie_ref cookie, read
 * back by auth.context.tsx's register() and sent as utm_source/medium/
 * campaign on POST /auth/register. Never overwrites an existing cookie —
 * first-touch attribution. Also pings the backend once (tied to the same
 * "cookie didn't exist yet" check, so it can't double-count across page
 * navigations) so a campaign link's raw visit count is trackable even for
 * visitors who never sign up.
 */
export default function UtmCapture() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const utm_source = params.get('utm_source');
    const utm_medium = params.get('utm_medium');
    const utm_campaign = params.get('utm_campaign');
    if (!utm_source || !utm_medium || !utm_campaign) return;

    const hasExisting = document.cookie.split('; ').some(c => c.startsWith(`${COOKIE_NAME}=`));
    if (hasExisting) return;

    const value = JSON.stringify({ utm_source, utm_medium, utm_campaign });
    const expires = new Date(Date.now() + TTL_DAYS * 24 * 60 * 60 * 1000).toUTCString();
    document.cookie = `${COOKIE_NAME}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;

    customAxiosPost(`${apiLink}/marketing/visit`, { utm_source, utm_medium, utm_campaign }, '', '').catch(() => {});
  }, []);

  return null;
}
