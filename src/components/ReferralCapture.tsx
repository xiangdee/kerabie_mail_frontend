'use client';
import { useEffect } from 'react';

const COOKIE_NAME = 'kerabie_ref';
const TTL_DAYS = 30;

/**
 * Captures ?ref=CODE on any page load and persists it in a cookie so it
 * survives browsing before an eventual signup — the "referral source
 * cookie, 30-day TTL" the privacy policy already describes. Read back by
 * the register page and sent as referral_code on POST /auth/register.
 * Never overwrites an existing cookie — first-touch attribution.
 */
export default function ReferralCapture() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (!ref) return;

    const hasExisting = document.cookie.split('; ').some(c => c.startsWith(`${COOKIE_NAME}=`));
    if (hasExisting) return;

    const expires = new Date(Date.now() + TTL_DAYS * 24 * 60 * 60 * 1000).toUTCString();
    document.cookie = `${COOKIE_NAME}=${encodeURIComponent(ref)}; expires=${expires}; path=/; SameSite=Lax`;
  }, []);

  return null;
}
