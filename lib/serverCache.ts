/**
 * Server-side in-memory cache with TTL
 *
 * Simple Map-based cache for reducing Airtable API calls.
 * Shared across all users on the same server instance.
 */

interface CacheEntry<T> {
  data: T;
  expiry: number;
}

const cache = new Map<string, CacheEntry<unknown>>();

// TTL constants (in milliseconds)
export const SERVER_CACHE_TTL = {
  BOOKINGS: 30 * 1000, // 30 seconds - bookings change frequently
  DAYS_OFF: 15 * 60 * 1000, // 15 minutes - rarely changes intra-day
  FULLY_BOOKED: 2 * 60 * 1000, // 2 minutes - depends on bookings
} as const;

/**
 * Get cached data if it exists and hasn't expired
 */
export function serverCacheGet<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;

  if (Date.now() > entry.expiry) {
    cache.delete(key);
    return null;
  }

  return entry.data as T;
}

/**
 * Set cached data with a TTL
 */
export function serverCacheSet<T>(key: string, data: T, ttl: number): void {
  cache.set(key, {
    data,
    expiry: Date.now() + ttl,
  });
}

/**
 * Invalidate all cache entries whose keys start with the given prefix
 */
export function invalidateServerCache(prefix: string): void {
  for (const key of cache.keys()) {
    if (key.startsWith(prefix)) {
      cache.delete(key);
    }
  }
}
