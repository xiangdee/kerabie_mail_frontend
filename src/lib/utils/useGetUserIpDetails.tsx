import { useState, useEffect } from "react";
import { customAxiosGet } from "./CustomAxiosRequest";
import { apiLink } from "../constants/links";
import { CustomIpData, CustomIpDataType } from "../datas/CustomIpData";

const IP_STORAGE_KEY = "user_ip_details";
const IP_TIMESTAMP_KEY = "user_ip_timestamp";
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const RETRY_INTERVAL = 5 * 60 * 1000; // Retry every 5 minutes if failed

export const useGetUserIpDetails = () => {
    const [isFetchingUserIp, setIsFetchingUserIp] = useState(false);
    const [userIpDetails, setUserIpDetails] = useState<CustomIpDataType>(CustomIpData); // Start with custom data
    
    useEffect(() => {
        const loadCachedData = () => {
            try {
                const cachedData = localStorage.getItem(IP_STORAGE_KEY);
                const cachedTimestamp = localStorage.getItem(IP_TIMESTAMP_KEY);
                
                if (cachedData && cachedTimestamp) {
                    const timestamp = parseInt(cachedTimestamp, 10);
                    const now = Date.now();
                    
                    // Check if cache is still valid (within 24 hours)
                    if (now - timestamp < CACHE_DURATION) {
                        const parsedData = JSON.parse(cachedData);
                        setUserIpDetails(parsedData);
                        return true; // Real data loaded from cache
                    }
                }
            } catch (error) {
                console.error("Error loading cached IP data:", error);
            }
            return false; // No valid cache
        };
        
        const fetchData = async () => {
            setIsFetchingUserIp(true);
            try {
                // GET /ip never existed on the backend (always 404'd) — every
                // visitor silently fell back to the hardcoded CustomIpData
                // mock (Nigeria/NGN) below and had it persisted to
                // localStorage as their "detected" currency, regardless of
                // where they actually were. The real endpoint is
                // /pricing/currency, which returns {currency, country_code,
                // country, ...} rather than the fuller ip-api-style shape
                // this hook's type expects — adapted into that shape here
                // rather than changing the type everywhere it's used
                // (currency.code is the only field anything actually reads).
                const { response, status } = await customAxiosGet(`${apiLink}/pricing/currency`);

                if (status === true && response?.currency) {
                    const adapted = {
                        ...CustomIpData,
                        country_code2: response.country_code ?? null,
                        country_name: response.country ?? null,
                        currency: {
                            code: response.currency,
                            name: response.currency === 'NGN' ? 'Nigerian Naira' : 'US Dollar',
                            symbol: response.currency === 'NGN' ? '₦' : '$',
                        },
                    };
                    setUserIpDetails(adapted);

                    // Store in localStorage with timestamp
                    try {
                        localStorage.setItem(IP_STORAGE_KEY, JSON.stringify(adapted));
                        localStorage.setItem(IP_TIMESTAMP_KEY, Date.now().toString());
                    } catch (error) {
                        console.error("Error storing IP data in localStorage:", error);
                    }

                    return true; // Success - got real currency detection
                } else {
                    // Failed, keep CustomIpData and retry
                    return false;
                }
            } catch (error) {
                console.error("Error fetching IP data:", error);
                // Keep CustomIpData on error
                return false;
            } finally {
                setIsFetchingUserIp(false);
            }
        };
        
        const attemptFetch = async () => {
            // Try to load from cache first
            if (loadCachedData()) {
                return; // Successfully loaded real data from cache, stop here
            }
            
            // No cache, try fetching real data
            const success = await fetchData();
            
            if (!success) {
                // Failed to get real IP, retry after interval
                // CustomIpData is already set, so app continues working
                const retryTimer = setTimeout(() => {
                    attemptFetch();
                }, RETRY_INTERVAL);
                
                // Cleanup timer on unmount
                return () => clearTimeout(retryTimer);
            }
        };
        
        attemptFetch();
    }, []); // Only run once on mount
    
    // Optional: Manual refresh
    const refreshData = async () => {
        localStorage.removeItem(IP_STORAGE_KEY);
        localStorage.removeItem(IP_TIMESTAMP_KEY);

        setIsFetchingUserIp(true);
        try {
            const { response, status } = await customAxiosGet(`${apiLink}/pricing/currency`);

            if (status === true && response?.currency) {
                const adapted = {
                    ...CustomIpData,
                    country_code2: response.country_code ?? null,
                    country_name: response.country ?? null,
                    currency: {
                        code: response.currency,
                        name: response.currency === 'NGN' ? 'Nigerian Naira' : 'US Dollar',
                        symbol: response.currency === 'NGN' ? '₦' : '$',
                    },
                };
                setUserIpDetails(adapted);
                localStorage.setItem(IP_STORAGE_KEY, JSON.stringify(adapted));
                localStorage.setItem(IP_TIMESTAMP_KEY, Date.now().toString());
            }
        } catch (error) {
            console.error("Error refreshing IP data:", error);
            // Keep current data on error
        } finally {
            setIsFetchingUserIp(false);
        }
    };
    
    return { 
        userIpDetails, 
        isFetchingUserIp,
        refreshData 
    };
};