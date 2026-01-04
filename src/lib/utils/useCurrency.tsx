/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";

const CURRENCY_STORAGE_KEY = "preferred_currency";
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