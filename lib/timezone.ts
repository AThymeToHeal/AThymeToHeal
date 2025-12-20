/**
 * Timezone utilities for booking system
 * All slots are stored in MST (Mountain Time) and converted to user's local timezone for display
 */

export type SupportedTimezone =
  | 'America/New_York'    // EST
  | 'America/Chicago'     // CST
  | 'America/Denver'      // MST
  | 'America/Los_Angeles' // PST
  | 'America/Phoenix'     // MST (no DST)
  | 'America/Anchorage'   // AKST
  | 'Pacific/Honolulu';   // HST

/**
 * Detect user's timezone from browser
 */
export function detectUserTimezone(): string {
  try {
    const detectedTz = Intl.DateTimeFormat().resolvedOptions().timeZone;

    // Normalize some common timezones to US equivalents
    const normalizedTz = normalizeTimezone(detectedTz);

    return normalizedTz;
  } catch (error) {
    console.error('Error detecting timezone:', error);
    return 'America/Denver'; // Default to MST
  }
}

/**
 * Normalize timezone names to US equivalents
 */
function normalizeTimezone(timezone: string): string {
  const mapping: Record<string, string> = {
    'America/Toronto': 'America/New_York',
    'America/Montreal': 'America/New_York',
    'America/Detroit': 'America/New_York',
    'America/Indiana/Indianapolis': 'America/New_York',
    'America/Kentucky/Louisville': 'America/New_York',
    'America/Winnipeg': 'America/Chicago',
    'America/Mexico_City': 'America/Chicago',
    'America/Edmonton': 'America/Denver',
    'America/Vancouver': 'America/Los_Angeles',
    'America/Tijuana': 'America/Los_Angeles',
  };

  return mapping[timezone] || timezone;
}

/**
 * Get friendly display name for timezone
 */
export function getTimezoneFriendlyName(timezone: string): string {
  const names: Record<string, string> = {
    'America/New_York': 'Eastern Time (EST/EDT)',
    'America/Chicago': 'Central Time (CST/CDT)',
    'America/Denver': 'Mountain Time (MST/MDT)',
    'America/Los_Angeles': 'Pacific Time (PST/PDT)',
    'America/Phoenix': 'Mountain Time (MST)',
    'America/Anchorage': 'Alaska Time (AKST/AKDT)',
    'Pacific/Honolulu': 'Hawaii Time (HST)',
  };

  return names[timezone] || timezone;
}

/**
 * Get short timezone abbreviation
 */
export function getTimezoneAbbreviation(timezone: string): string {
  const abbr: Record<string, string> = {
    'America/New_York': 'EST',
    'America/Chicago': 'CST',
    'America/Denver': 'MST',
    'America/Los_Angeles': 'PST',
    'America/Phoenix': 'MST',
    'America/Anchorage': 'AKST',
    'Pacific/Honolulu': 'HST',
  };

  return abbr[timezone] || 'EST';
}

/**
 * Convert time from MST to target timezone
 * @param date - Date in YYYY-MM-DD format
 * @param time - Time in HH:MM format (24-hour, MST)
 * @param targetTimezone - Target IANA timezone
 * @returns Time in HH:MM format in target timezone
 */
export function convertFromMST(
  date: string,
  time: string,
  targetTimezone: string
): string {
  try {
    // Create date in MST
    const [hours, minutes] = time.split(':').map(Number);
    const mstDate = new Date(`${date}T${time}:00-07:00`); // MST is UTC-7

    // Format in target timezone
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: targetTimezone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

    const parts = formatter.formatToParts(mstDate);
    const hour = parts.find((p) => p.type === 'hour')?.value || '00';
    const minute = parts.find((p) => p.type === 'minute')?.value || '00';

    return `${hour}:${minute}`;
  } catch (error) {
    console.error('Error converting timezone:', error);
    return time; // Return original time if conversion fails
  }
}

/**
 * Convert time from target timezone to MST
 * @param date - Date in YYYY-MM-DD format
 * @param time - Time in HH:MM format (24-hour) in target timezone
 * @param sourceTimezone - Source IANA timezone
 * @returns Time in HH:MM format in MST
 */
export function convertToMST(
  date: string,
  time: string,
  sourceTimezone: string
): string {
  try {
    // Parse the time in the source timezone
    const localDate = new Date(`${date}T${time}:00`);

    // Convert to MST
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Denver',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

    const parts = formatter.formatToParts(localDate);
    const hour = parts.find((p) => p.type === 'hour')?.value || '00';
    const minute = parts.find((p) => p.type === 'minute')?.value || '00';

    return `${hour}:${minute}`;
  } catch (error) {
    console.error('Error converting to MST:', error);
    return time;
  }
}

/**
 * Format time for display (12-hour format with AM/PM)
 * @param time - Time in HH:MM format (24-hour)
 * @returns Time in 12-hour format (e.g., "2:30 PM")
 */
export function formatTimeForDisplay(time: string): string {
  try {
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;

    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  } catch (error) {
    console.error('Error formatting time:', error);
    return time;
  }
}

/**
 * Get all supported US timezones
 */
export function getSupportedTimezones(): Array<{ value: string; label: string }> {
  return [
    { value: 'America/New_York', label: 'Eastern Time (EST/EDT)' },
    { value: 'America/Chicago', label: 'Central Time (CST/CDT)' },
    { value: 'America/Denver', label: 'Mountain Time (MST/MDT)' },
    { value: 'America/Phoenix', label: 'Mountain Time - Arizona (MST)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (PST/PDT)' },
    { value: 'America/Anchorage', label: 'Alaska Time (AKST/AKDT)' },
    { value: 'Pacific/Honolulu', label: 'Hawaii Time (HST)' },
  ];
}

/**
 * Generate available time slots for a day (9 AM - 5 PM MST)
 * @param duration - Duration of each slot in minutes (default: 60)
 * @param startHour - Start hour in 24-hour format (default: 9)
 * @param endHour - End hour in 24-hour format (default: 17)
 */
export function generateTimeSlots(
  duration: number = 60,
  startHour: number = 9,
  endHour: number = 17
): Array<{ start: string; end: string }> {
  const slots = [];
  let currentMinutes = startHour * 60;
  const endMinutes = endHour * 60;

  while (currentMinutes + duration <= endMinutes) {
    const startHours = Math.floor(currentMinutes / 60);
    const startMins = currentMinutes % 60;
    const endTimeMinutes = currentMinutes + duration;
    const endHours = Math.floor(endTimeMinutes / 60);
    const endMins = endTimeMinutes % 60;

    const start = `${startHours.toString().padStart(2, '0')}:${startMins
      .toString()
      .padStart(2, '0')}`;
    const end = `${endHours.toString().padStart(2, '0')}:${endMins
      .toString()
      .padStart(2, '0')}`;

    slots.push({ start, end });

    currentMinutes += duration;
  }

  return slots;
}

/**
 * Check if a date is a weekend
 */
export function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6; // Sunday or Saturday
}

/**
 * Check if a date is in the past
 */
export function isPast(date: Date): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today;
}

/**
 * Format date for display
 */
export function formatDateForDisplay(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

/**
 * Get date in YYYY-MM-DD format
 */
export function getDateString(date: Date): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}
