'use client';
import { useGetUserIpDetails } from '@/lib/utils/useGetUserIpDetails';
import { useCurrency } from '@/lib/utils/useCurrency';

/**
 * Runs IP-based currency auto-detection on every page load, mounted at the
 * root — not just wherever usePricingDisplay happens to be used (the
 * homepage's pricing section). A visitor landing first on /auth/login,
 * /auth/register, or anywhere else never touched that page, so
 * preferred_currency in localStorage was never set for them until/unless
 * they separately visited the homepage — this fixes that by giving
 * useCurrency's auto-set-from-IP effect a chance to run everywhere.
 * useCurrency itself guards on "not already set by the user" and
 * useGetUserIpDetails is self-caching (24h), so mounting this alongside
 * a page that also calls these hooks directly (e.g. usePricingDisplay) is
 * harmless — at most one extra independent effect, no duplicate network
 * cost once the IP cache is warm.
 */
export default function CurrencyDetector() {
  const { userIpDetails, isFetchingUserIp, hasRealIpData } = useGetUserIpDetails();
  useCurrency({ userIpDetails, isFetchingUserIp, hasRealIpData });
  return null;
}
