/**
 * Booking Cache Management Utility
 *
 * Centralized cache management for booking-related data to ensure
 * real-time availability updates and prevent double-bookings.
 *
 * Cache Strategy:
 * - Availability: 1 minute TTL (real-time updates)
 * - Booked Dates: 2 minutes TTL (calendar indicators)
 * - Available Days: 24 hours TTL (rarely changes)
 */

import type { ConsultantType, ServiceType } from './airtable';

// Cache TTL constants (in milliseconds)
export const CACHE_TTL = {
  AVAILABILITY: 120 * 1000, // 2 minutes - server cache provides shared freshness, booking POST always does fresh check
  BOOKED_DATES: 2 * 60 * 1000, // 2 minutes - calendar indicators
  AVAILABLE_DAYS: 24 * 60 * 60 * 1000, // 24 hours - weekly schedules rarely change
} as const;

/**
 * Generate cache key for availability data
 */
export function getAvailabilityCacheKey(
  date: string,
  serviceType: ServiceType,
  consultant: ConsultantType
): string {
  return `availability_${date}_${serviceType}_${consultant}`;
}

/**
 * Generate cache key for booked dates
 */
export function getBookedDatesCacheKey(
  year: number,
  month: number,
  consultant?: ConsultantType
): string {
  return `booked_dates_${year}-${month}_${consultant || 'all'}`;
}

/**
 * Generate cache key for available days
 */
export function getAvailableDaysCacheKey(consultant?: ConsultantType): string {
  return `available_days_${consultant || 'all'}`;
}

/**
 * Check if cached data is still fresh
 */
export function isCacheFresh(timestamp: number, ttl: number): boolean {
  return Date.now() - timestamp < ttl;
}

/**
 * Get cached data from localStorage with TTL validation
 */
export function getCachedData<T>(key: string, ttl: number): T | null {
  try {
    const cached = localStorage.getItem(key);
    if (!cached) return null;

    const { data, timestamp } = JSON.parse(cached);
    if (!isCacheFresh(timestamp, ttl)) {
      // Cache is stale, remove it
      localStorage.removeItem(key);
      return null;
    }

    return data as T;
  } catch (error) {
    console.error(`Error reading cache key "${key}":`, error);
    return null;
  }
}

/**
 * Set cached data in localStorage with timestamp
 */
export function setCachedData<T>(key: string, data: T): void {
  try {
    localStorage.setItem(
      key,
      JSON.stringify({
        data,
        timestamp: Date.now(),
      })
    );
  } catch (error) {
    // Ignore storage errors (quota exceeded, private mode, etc.)
    console.warn(`Failed to cache data for key "${key}":`, error);
  }
}

/**
 * Invalidate all caches related to a specific booking
 * This ensures other users see updated availability immediately
 */
export function invalidateBookingCaches(
  date: string,
  consultant: ConsultantType,
  serviceType: ServiceType,
  allServices: Record<string, any>
): void {
  try {
    const keysToRemove: string[] = [];
    const otherConsultant: ConsultantType =
      consultant === 'Heidi Lynn' ? 'Illiana' : 'Heidi Lynn';

    // 1. Clear availability cache for this specific date/service/consultant
    keysToRemove.push(getAvailabilityCacheKey(date, serviceType, consultant));

    // 2. Clear availability for other consultant (they might show this slot as "available with other")
    keysToRemove.push(getAvailabilityCacheKey(date, serviceType, otherConsultant));

    // 3. Clear all service types for this date (in case user switches services)
    Object.keys(allServices).forEach((service) => {
      keysToRemove.push(
        getAvailabilityCacheKey(date, service as ServiceType, consultant)
      );
      keysToRemove.push(
        getAvailabilityCacheKey(date, service as ServiceType, otherConsultant)
      );
    });

    // 4. Clear booked dates cache for the month
    const dateObj = new Date(date);
    const year = dateObj.getFullYear();
    const month = dateObj.getMonth() + 1;

    keysToRemove.push(getBookedDatesCacheKey(year, month));
    keysToRemove.push(getBookedDatesCacheKey(year, month, consultant));
    keysToRemove.push(getBookedDatesCacheKey(year, month, otherConsultant));

    // Remove all identified cache keys
    keysToRemove.forEach((key) => {
      try {
        localStorage.removeItem(key);
      } catch (e) {
        // Ignore individual removal errors
      }
    });

    console.log(
      `✅ Cache invalidated for booking on ${date} with ${consultant} (${keysToRemove.length} keys cleared)`
    );
  } catch (error) {
    console.error('Error invalidating booking caches:', error);
    // Don't throw - cache invalidation failure shouldn't break booking flow
  }
}

/**
 * Clear all booking-related caches (use sparingly, e.g., on logout or manual refresh)
 */
export function clearAllBookingCaches(): void {
  try {
    const keys = Object.keys(localStorage);
    let clearedCount = 0;

    keys.forEach((key) => {
      if (
        key.startsWith('availability_') ||
        key.startsWith('booked_dates_') ||
        key.startsWith('available_days_')
      ) {
        localStorage.removeItem(key);
        clearedCount++;
      }
    });

    console.log(`🧹 Cleared ${clearedCount} booking cache entries`);
  } catch (error) {
    console.error('Error clearing all booking caches:', error);
  }
}
