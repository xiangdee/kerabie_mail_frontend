/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";

const CURRENCY_STORAGE_KEY = "preferred_currency";
// One-time cleanup for visitors who got auto-set to NGN by the backend's
// ENVIRONMENT=="development" IP-detection bug (fixed server-side) before
// they ever picked a currency themselves. Clearing lets them re-detect
// correctly; guarded so it only ever runs once per browser.
const MIGRATION_FLAG_KEY = "currency_stale_ngn_migration_v1";
export const AVAILABLE_CURRENCIES = ["usd", "ngn"] as const;
type Currency = typeof AVAILABLE_CURRENCIES[number];

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
}

export const useCurrency = ({ 
    defaultCurrency = "usd", 
    userIpDetails, 
    isFetchingUserIp = false 
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
        if (hasSetFromIp || isFetchingUserIp || !userIpDetails) return;

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
    }, [userIpDetails, isFetchingUserIp, hasSetFromIp]);

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