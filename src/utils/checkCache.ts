import { Cache } from "cache";

export const checkCacheForDuplicateRequests = (status: string, transactionId: string,  cache: Cache<string>) => {
        const cachePayload = { status, transactionId };
	const cacheKey = JSON.stringify(cachePayload); // Convert the payload object to a string for use as the cache key
	const cachedData = cache.check(cacheKey);
	
	if (cachedData) return true
	else {
                cache.set(cacheKey, "Processed");
                return false
        }
}