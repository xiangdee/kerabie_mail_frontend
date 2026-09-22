/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";

const CURRENCY_STORAGE_KEY = "preferred_currency";
// One-time cleanup for visitors who got auto-set to NGN before this file's
// hasRealIpData fix (previously the auto-set effect could fire on
// useGetUserIpDetails's initial NGN placeholder before the real IP ever
// resolved) or by the backend's ENVIRONMENT=="development" IP-detection bug
// (fixed server-side). Clearing lets them re-detect correctly; guarded so it
// only ever runs once per browser.
const MIGRATION_FLAG_KEY = "currency_stale_ngn_migration_v2";
export const AVAILABLE_CURRENCIES = ["usd", "ngn", "eur", "gbp", "ghs", "xaf", "xof"] as const;
export type Currency = typeof AVAILABLE_CURRENCIES[number];

// Shared display symbol per currency code (lowercase key) — used anywhere
// a plan price needs a symbol instead of just the raw ISO code.
export const CURRENCY_SYMBOLS: Record<Currency, string> = {
    usd: "$",
    ngn: "₦",
    eur: "€",
    gbp: "£",
    ghs: "₵",
    xaf: "FCFA",
    xof: "FCFA",
};

// A representative country per currency for checkout's country_code field —
// the backend accepts but doesn't actually use this today (informational
// only), so a single representative country per shared currency (e.g. one
// EUR country, one XOF country) is fine; it isn't used to pick a specific
// country's price or routing.
export const COUNTRY_CODE_BY_CURRENCY: Record<Currency, string> = {
    usd: "US",
    ngn: "NG",
    eur: "DE",
    gbp: "GB",
    ghs: "GH",
    xaf: "CM",
    xof: "BJ",
};

const getInitialCurrency = (defaultCurrency: Currency = "usd"): Currency => {
    try {
        const storedCurrency = localStorage.getItem(CURRENCY_STORAGE_KEY);
        
        if (storedCurrency && AVAILABLE_CURRENCIES.includes(storedCurrency as Currency)) {
            return storedCurrency as Currency;
        }
    } catch (error) {
        console.error("Error reading currency from localStorage:", error);
    }
    
    return defaultCurrency;
};

interface UseCurrencyOptions {
    defaultCurrency?: Currency;
    userIpDetails?: any;
    isFetchingUserIp?: boolean;
    // Whether `userIpDetails` is a genuine fetched/cached result rather than
    // useGetUserIpDetails's initial NGN placeholder (CustomIpData), which is
    // truthy from the very first render. Without this, the effect below used
    // to fire on that placeholder and permanently lock in NGN before the
    // real IP was ever known — the actual root cause of currency detection
    // getting stuck on NGN, independent of any backend fix.
    hasRealIpData?: boolean;
}

export const useCurrency = ({
    defaultCurrency = "usd",
    userIpDetails,
    isFetchingUserIp = false,
    hasRealIpData = false,
}: UseCurrencyOptions = {}) => {
    const [currency, setCurrencyState] = useState<Currency>(() => 
        getInitialCurrency(defaultCurrency)
    );
    const [hasSetFromIp, setHasSetFromIp] = useState(false);

    // Run once per browser: clear a stale NGN value left over from the
    // detection bug so affected visitors get re-detected instead of staying
    // stuck on NGN forever.
    useEffect(() => {
        try {
            if (localStorage.getItem(MIGRATION_FLAG_KEY)) return;

            if (localStorage.getItem(CURRENCY_STORAGE_KEY) === "ngn") {
                localStorage.removeItem(CURRENCY_STORAGE_KEY);
                setCurrencyState(defaultCurrency);
                setHasSetFromIp(false);
            }
            localStorage.setItem(MIGRATION_FLAG_KEY, "1");
        } catch (error) {
            console.error("Error running stale currency migration:", error);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Update currency from IP data if available and not already set by user
    useEffect(() => {
        if (hasSetFromIp || isFetchingUserIp || !hasRealIpData || !userIpDetails) return;

        const storedCurrency = localStorage.getItem(CURRENCY_STORAGE_KEY);

        // Only auto-set from IP if user hasn't manually chosen a currency
        if (!storedCurrency && userIpDetails?.currency?.code) {
            const detectedCurrency = userIpDetails.currency.code.toLowerCase();
            
            if (AVAILABLE_CURRENCIES.includes(detectedCurrency as Currency)) {
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setCurrencyState(detectedCurrency as Currency);
                try {
                    localStorage.setItem(CURRENCY_STORAGE_KEY, detectedCurrency);
                } catch (error) {
                    console.error("Error saving detected currency:", error);
                }
            }
            
            setHasSetFromIp(true);
        }
    }, [userIpDetails, isFetchingUserIp, hasSetFromIp, hasRealIpData]);

    const setCurrency = (newCurrency: Currency) => {
        if (AVAILABLE_CURRENCIES.includes(newCurrency)) {
            setCurrencyState(newCurrency);
            try {
                localStorage.setItem(CURRENCY_STORAGE_KEY, newCurrency);
            } catch (error) {
                console.error("Error saving currency to localStorage:", error);
            }
        }
    };

    return {
        currency,
        setCurrency,
        availableCurrencies: AVAILABLE_CURRENCIES
    };
};