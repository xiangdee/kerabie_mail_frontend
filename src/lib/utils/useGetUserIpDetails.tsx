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
    // CustomIpData is a hardcoded NGN/Nigeria placeholder, truthy from the
    // very first render, well before any real fetch resolves. Consumers
    // that gate a one-time action on "userIpDetails is present" (like
    // useCurrency's auto-set-from-IP effect) would otherwise fire on this
    // placeholder and permanently lock in NGN before the real IP is ever
    // known — this flag lets them wait for genuine data instead.
    const [hasRealIpData, setHasRealIpData] = useState(false);

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
                        setHasRealIpData(true);
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
                // GET /ip does exist (defined directly in app/main.py, not
                // under any router — easy to miss searching app/routes/
                // only) and returns exactly this hook's CustomIpDataType
                // shape natively. The real bug wasn't a missing endpoint:
                // it was that /pricing/currency's _get_real_ip (a different
                // endpoint some other testing briefly redirected this hook
                // to) unconditionally returned a hardcoded Nigerian test IP
                // whenever ENVIRONMENT=="development" — which production's
                // own .env is (mis)set to. /ip's own dev-fallback is
                // correctly guarded (only when the real IP truly can't be
                // determined), confirmed live returning correct geo data
                // for a real public IP even with that misconfigured flag.
                const { response, status } = await customAxiosGet(`${apiLink}/ip`);

                if (status === true && response?.currency?.code) {
                    setUserIpDetails(response);
                    setHasRealIpData(true);

                    // Store in localStorage with timestamp
                    try {
                        localStorage.setItem(IP_STORAGE_KEY, JSON.stringify(response));
                        localStorage.setItem(IP_TIMESTAMP_KEY, Date.now().toString());
                    } catch (error) {
                        console.error("Error storing IP data in localStorage:", error);
                    }

                    return true; // Success - got real IP
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
            const { response, status } = await customAxiosGet(`${apiLink}/ip`);

            if (status === true && response?.currency?.code) {
                setUserIpDetails(response);
                setHasRealIpData(true);
                localStorage.setItem(IP_STORAGE_KEY, JSON.stringify(response));
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
        hasRealIpData,
        refreshData
    };
};