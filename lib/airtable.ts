import Airtable from 'airtable';
import { serverCacheGet, serverCacheSet, SERVER_CACHE_TTL } from './serverCache';

// Lazy initialization of Airtable - only runs when actually needed
let _base: ReturnType<Airtable['base']> | null = null;

// HARDCODED ADVISOR SCHEDULES - No API calls needed!
// Schedule format: DayOfWeek -> { start: 'HH:MM', end: 'HH:MM' }
// Available days: Tuesday, Wednesday, Thursday, Saturday
// Heidi Lynn: 1 PM - 6 PM MT (weekdays), 10 AM - 4 PM MT (Saturday)
// Illiana: 9 AM - 1 PM MT (weekdays), 10 AM - 4 PM MT (Saturday)
const ADVISOR_SCHEDULES: Record<
  ConsultantType,
  Record<string, { start: string; end: string; isActive: boolean } | null>
> = {
  'Heidi Lynn': {
    Monday: null,
    Tuesday: { start: '13:00', end: '18:00', isActive: true },
    Wednesday: { start: '13:00', end: '18:00', isActive: true },
    Thursday: { start: '13:00', end: '18:00', isActive: true },
    Friday: null,
    Saturday: { start: '10:00', end: '16:00', isActive: true },
    Sunday: null,
  },
  'Illiana': {
    Monday: null,
    Tuesday: { start: '09:00', end: '13:00', isActive: true },
    Wednesday: { start: '09:00', end: '13:00', isActive: true },
    Thursday: { start: '09:00', end: '13:00', isActive: true },
    Friday: null,
    Saturday: { start: '10:00', end: '16:00', isActive: true },
    Sunday: null,
  },
};

// Booking constraints per consultant per day
export const BOOKING_LIMITS = {
  MAX_CLIENT_BOOKINGS_PER_DAY: 2,
  MAX_BUSINESS_BOOKINGS_PER_DAY: 3,
  BUFFER_MINUTES: 30, // 30-minute buffer between client appointments
} as const;

function getBase() {
  if (_base) return _base;

  const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
  const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;

  if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
    throw new Error('Missing Airtable configuration. Check .env.local file.');
  }

  _base = new Airtable({ apiKey: AIRTABLE_API_KEY }).base(AIRTABLE_BASE_ID);
  return _base;
}

// Table names
export const TABLES = {
  CONTACT: 'contact',
  BOOKED: 'Booked',
  CLIENTS: 'Clients',
  TESTIMONIALS: 'Testimonials',
  FAQS: 'FAQs',
  FAQ_CLICKS: 'FAQ Clicks',
  NEWSLETTER: 'Newsletter Signups',
  COMING_SOON: 'Coming Soon Features',
  ADVISOR_AVAILABILITY: 'Advisor Schedules',  // NEW: Updated to use new table
  ADVISOR_DAYS_OFF: 'Advisor Days Off',
};

// ============================================================================
// TYPES
// ============================================================================

export interface ContactSubmission {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  message: string;
  subject?: string;
  source?: string;
}

export interface Consultation {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  bookingType: string; // Keep for backwards compatibility
  serviceType: ServiceType;
  consultant: ConsultantType;
  dateBooked: string; // YYYY-MM-DD
  timeSlotStart: string; // HH:MM
  timeSlotEnd: string; // HH:MM
  userTimezone: string;
  userLocalTime: string;
}

export interface ClientFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  healthGoals?: string;
  dietaryRestrictions?: string;
  currentMedications?: string;
  healthConditions?: string;
  preferredContactMethod?: string;
  consent: boolean;
  bookedRecordId?: string;
}

export interface Testimonial {
  name: string;
  text: string;
  rating?: number;
  approved?: boolean;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category?: string;
  order?: number;
  clickCount?: number;
}

export interface ComingSoonFeature {
  id: string;
  title: string;
  description: string;
  icon: string;
  eta: string;
  status?: string;
  priority?: string;
  displayOrder?: number;
  isVisible?: boolean;
}

export interface TimeSlot {
  start: string;
  end: string;
  available: boolean;
  availableWithOther?: boolean;
  otherConsultant?: ConsultantType;
}

export interface AdvisorDaysOffResult {
  isFullDayOff: boolean;
  partialTimeOffRanges: Array<{ start: string; end: string }>;
}

// Service Types
export type ServiceType =
  | 'Health Consult'
  | 'Essential Emotions'
  | 'Symphony of Cells'
  | 'Business Consultation'
  | 'Tier 1 - Back to Basics'
  | 'Tier 2 - A Thyme to Heal'
  | 'Tier 3 - Deep Roots Healing';
export type ConsultantType = 'Heidi Lynn' | 'Illiana';

export interface ServiceConfig {
  name: ServiceType;
  duration: number; // in minutes
  price: number;
  description: string;
  availableConsultants?: ConsultantType[]; // Optional: restrict service to specific consultants
}

// Service configuration constant
export const SERVICES: Record<ServiceType, ServiceConfig> = {
  'Health Consult': {
    name: 'Health Consult',
    duration: 60,
    price: 30,
    description: 'A consultation to start you on your health journey',
  },
  'Symphony of Cells': {
    name: 'Symphony of Cells',
    duration: 30,
    price: 45,
    description: 'Essential oils and therapeutic massage for detox and healing',
  },
  'Essential Emotions': {
    name: 'Essential Emotions',
    duration: 60,
    price: 60,
    description: 'Identify emotions and create new neuropathways',
  },
  'Business Consultation': {
    name: 'Business Consultation',
    duration: 60,
    price: 0,
    description: 'Turn your health journey into a thriving business',
    availableConsultants: ['Illiana'], // Only Illiana offers this service
  },
  'Tier 1 - Back to Basics': {
    name: 'Tier 1 - Back to Basics',
    duration: 60,
    price: 350,
    description: '6-week foundational wellness program with weekly Symphony of Cells sessions',
  },
  'Tier 2 - A Thyme to Heal': {
    name: 'Tier 2 - A Thyme to Heal',
    duration: 60,
    price: 699,
    description: '8-week integrated program combining emotional work, body support, and lifestyle guidance',
  },
  'Tier 3 - Deep Roots Healing': {
    name: 'Tier 3 - Deep Roots Healing',
    duration: 60,
    price: 2000,
    description: '10-week intensive program for complex or layered health challenges',
  },
};

// ============================================================================
// CONTACT FORM
// ============================================================================

export async function createContact(data: ContactSubmission) {
  try {
    const record = await getBase()(TABLES.CONTACT).create([
      {
        fields: {
          FirstName: data.firstName,
          LastName: data.lastName,
          Email: data.email,
          Phone: data.phone || '',
          Subject: data.subject || '',
          Message: data.message,
          Source: data.source || 'Contact Page',
          DateCreated: new Date().toISOString(),
        },
      } as any,
    ]);

    return {
      id: record[0].id,
      success: true,
    };
  } catch (error) {
    console.error('Error creating contact in Airtable:', error);
    throw error;
  }
}

// ============================================================================
// NEWSLETTER SIGNUPS
// ============================================================================

export async function createNewsletterSignup(email: string, name?: string, source?: string) {
  try {
    const record = await getBase()(TABLES.NEWSLETTER).create([
      {
        fields: {
          Email: email,
          Name: name || '',
          Source: source || 'Homepage',
          'Subscribed Date': new Date().toISOString(),
          Status: 'Active',
        },
      } as any,
    ]);

    return {
      id: record[0].id,
      success: true,
    };
  } catch (error) {
    console.error('Error creating newsletter signup in Airtable:', error);
    throw error;
  }
}

// ============================================================================
// BOOKING / CONSULTATIONS
// ============================================================================

// ============================================================================
// TIMEZONE CONVENTIONS
// ============================================================================
//
// IMPORTANT: All time conversions in this file follow these rules:
//
// 1. Advisor Availability Table (TimeSlot field):
//    - Stored as single-line text in HH:MM format (24-hour)
//    - Timezone: Mountain Time (America/Denver)
//    - Example: "09:00" = 9:00 AM Mountain Time
//    - DST handled automatically: MDT (UTC-6) Mar-Nov, MST (UTC-7) Nov-Mar
//
// 2. Booked Table (dateAndTime field):
//    - Stored in UTC as ISO 8601 string
//    - Example: "2024-03-15T16:00:00.000Z"
//    - Converted from Mountain Time using mstToUtcIso()
//
// 3. User Display Times:
//    - Shown in user's local timezone
//    - Converted using lib/timezone.ts utilities
//
// ============================================================================

/**
 * Convert MST time to UTC ISO string
 * Properly handles both MST (UTC-7) and MDT (UTC-6) via timezone identifier
 */
function mstToUtcIso(date: string, time: string): string {
  try {
    // Use America/Denver timezone which automatically handles DST
    // Create a date string that will be interpreted in Mountain Time
    const dateTimeString = `${date}T${time}:00`;

    // Parse as local time first
    const localDate = new Date(dateTimeString);

    // Format it in Mountain Time to get the correct offset
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Denver',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });

    // Get the components in Mountain Time
    const parts = formatter.formatToParts(localDate);
    const year = parts.find(p => p.type === 'year')?.value;
    const month = parts.find(p => p.type === 'month')?.value;
    const day = parts.find(p => p.type === 'day')?.value;
    const hour = parts.find(p => p.type === 'hour')?.value;
    const minute = parts.find(p => p.type === 'minute')?.value;
    const second = parts.find(p => p.type === 'second')?.value;

    // Create a proper date in Mountain Time
    // We need to create a date that represents the given date/time in America/Denver timezone
    const [hours, minutes] = time.split(':').map(Number);
    const mstDate = new Date(date + 'T' + time + ':00');

    // Get the timezone offset for this specific date in America/Denver
    const denverFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Denver',
      timeZoneName: 'short',
    });
    const denverDateStr = denverFormatter.format(mstDate);

    // Determine if DST is in effect by checking the offset
    // Create two dates: one we know is in MST, one we know is in MDT
    const jan = new Date(date.split('-')[0] + '-01-01T12:00:00');
    const jul = new Date(date.split('-')[0] + '-07-01T12:00:00');

    const janOffset = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Denver',
      timeZoneName: 'short',
    }).format(jan);

    const julOffset = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Denver',
      timeZoneName: 'short',
    }).format(jul);

    // Determine offset based on the actual date
    const testDate = new Date(dateTimeString);
    const testFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Denver',
      timeZoneName: 'short',
    });
    const testStr = testFormatter.format(testDate);

    // Check if it contains MDT or MST
    const isDST = testStr.includes('MDT');
    const offset = isDST ? '-06:00' : '-07:00';

    return new Date(`${date}T${time}:00${offset}`).toISOString();
  } catch (error) {
    console.error('Error converting MST to UTC:', error);
    // Fallback to standard offset
    return new Date(`${date}T${time}:00-07:00`).toISOString();
  }
}

export async function createConsultation(consultation: Consultation) {
  try {
    const utcDateTime = mstToUtcIso(consultation.dateBooked, consultation.timeSlotStart);
    const serviceConfig = SERVICES[consultation.serviceType];

    const record = await getBase()(TABLES.BOOKED).create([
      {
        fields: {
          dateAndTime: utcDateTime,
          FirstName: consultation.firstName,
          LastName: consultation.lastName,
          Email: consultation.email,
          Phone: consultation.phone || '',
          BookingType: consultation.bookingType,
          ServiceType: consultation.serviceType,
          Consultant: consultation.consultant,
          Duration: serviceConfig.duration,
          Price: serviceConfig.price,
          UserTimezone: consultation.userTimezone,
          UserLocalTime: consultation.userLocalTime,
        },
      } as any,
    ]);

    return {
      id: record[0].id,
      success: true,
      dateAndTime: utcDateTime,
    };
  } catch (error) {
    console.error('Error creating consultation in Airtable:', error);
    throw error;
  }
}

// ============================================================================
// CLIENT DEDUPLICATION HELPERS
// ============================================================================

/**
 * Capitalize first letter of a string (e.g., "john" -> "John")
 */
function capitalizeFirstLetter(str: string): string {
  const trimmed = str.trim();
  if (!trimmed) return '';
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
}

/**
 * Merge multiline field values, avoiding duplicates
 * Example: "Weight loss, Better sleep" + "Better sleep, Reduce stress"
 *          -> "Weight loss, Better sleep, Reduce stress"
 */
function mergeMultilineField(
  existingValue: string | undefined,
  newValue: string | undefined
): string {
  // Handle empty cases
  if (!existingValue && !newValue) return '';
  if (!existingValue) return (newValue || '').trim();
  if (!newValue) return existingValue.trim();

  // Parse existing values into array
  const existingItems = existingValue
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item.length > 0);

  // Parse new values into array
  const newItems = newValue
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item.length > 0);

  // Create case-insensitive set for deduplication
  const existingSet = new Set(existingItems.map((item) => item.toLowerCase()));

  // Add only unique new items
  const uniqueNewItems = newItems.filter(
    (item) => !existingSet.has(item.toLowerCase())
  );

  // Merge and join
  const merged = [...existingItems, ...uniqueNewItems];
  return merged.join(', ');
}

/**
 * Find existing client by email or phone
 */
async function findExistingClient(
  email: string,
  phone?: string
): Promise<{ id: string; fields: Record<string, any> } | null> {
  try {
    // Build filter formula with OR logic
    let filterFormula: string;
    if (phone && phone.trim()) {
      filterFormula = `OR({Email}='${email}', {Phone}='${phone}')`;
    } else {
      filterFormula = `{Email}='${email}'`;
    }

    const records = await getBase()(TABLES.CLIENTS)
      .select({
        filterByFormula: filterFormula,
        maxRecords: 1,
      })
      .all();

    if (records.length > 0) {
      return {
        id: records[0].id,
        fields: records[0].fields as Record<string, any>,
      };
    }

    return null;
  } catch (error) {
    console.error('Error finding existing client:', error);
    return null;
  }
}

export async function createOrUpdateClient(data: ClientFormData) {
  try {
    // Search for existing client by email or phone
    const existingClient = await findExistingClient(data.email, data.phone);

    // Prepare fields with smart merging
    const fields: Record<string, unknown> = {
      // Always update with latest, properly formatted
      FirstName: capitalizeFirstLetter(data.firstName),
      LastName: capitalizeFirstLetter(data.lastName),
      Email: data.email,
      Phone: data.phone || existingClient?.fields.Phone || '',
      PreferredContactMethod: data.preferredContactMethod || '',
      Consent: data.consent,
    };

    // Merge health fields if updating, otherwise use new values
    if (existingClient) {
      fields.HealthGoals = mergeMultilineField(
        existingClient.fields.HealthGoals as string,
        data.healthGoals
      );
      fields.DietaryRestrictions = mergeMultilineField(
        existingClient.fields.DietaryRestrictions as string,
        data.dietaryRestrictions
      );
      fields.CurrentMedications = mergeMultilineField(
        existingClient.fields.CurrentMedications as string,
        data.currentMedications
      );
      fields.HealthConditions = mergeMultilineField(
        existingClient.fields.HealthConditions as string,
        data.healthConditions
      );

      // Append to BookedRecord array
      const existingBookings = (existingClient.fields.BookedRecord as string[]) || [];
      fields.BookedRecord = data.bookedRecordId
        ? [...existingBookings, data.bookedRecordId].filter(Boolean)
        : existingBookings;

      // Don't update DateCreated - preserve original
    } else {
      // New client - use provided values
      fields.HealthGoals = data.healthGoals || '';
      fields.DietaryRestrictions = data.dietaryRestrictions || '';
      fields.CurrentMedications = data.currentMedications || '';
      fields.HealthConditions = data.healthConditions || '';
      fields.BookedRecord = data.bookedRecordId ? [data.bookedRecordId] : [];
      fields.DateCreated = new Date().toISOString();
    }

    // Execute database operation
    if (existingClient) {
      // Update existing client
      await getBase()(TABLES.CLIENTS).update([
        {
          id: existingClient.id,
          fields,
        } as any,
      ]);

      return {
        id: existingClient.id,
        success: true,
        updated: true,
      };
    } else {
      // Create new client
      const record = await getBase()(TABLES.CLIENTS).create([{ fields } as any]);

      return {
        id: record[0].id,
        success: true,
        updated: false,
      };
    }
  } catch (error) {
    console.error('Error creating/updating client in Airtable:', error);
    throw error;
  }
}

/**
 * Get all bookings for a specific date, optionally filtered by consultant
 * Returns array of objects with timeSlot and consultant information
 *
 * CRITICAL FOR DOUBLE-BOOKING PREVENTION:
 * This function is called by:
 * 1. Availability checker - to filter out booked slots
 * 2. Booking API - to verify slot is still available before creating booking
 *
 * IMPORTANT: Always throws BOOKING_DATA_UNAVAILABLE error if data fetch fails
 * to prevent showing all slots as available when we can't verify existing bookings.
 */
export async function getBookingsForDate(
  date: string,
  consultant?: ConsultantType,
  bypassCache?: boolean
): Promise<Array<{ timeSlot: string; consultant: ConsultantType; duration: number; serviceType: string }>> {
  // Check server cache first (unless bypassed for double-booking verification)
  const cacheKey = `bookings_${date}_${consultant || 'all'}`;
  if (!bypassCache) {
    const cached = serverCacheGet<Array<{ timeSlot: string; consultant: ConsultantType; duration: number; serviceType: string }>>(cacheKey);
    if (cached) return cached;
  }

  try {
    const startOfDay = mstToUtcIso(date, '00:00');
    const endOfDay = mstToUtcIso(date, '23:59');

    let filterFormula = `AND(
      IS_AFTER({dateAndTime}, '${startOfDay}'),
      IS_BEFORE({dateAndTime}, '${endOfDay}')
    )`;

    // Add consultant filter if specified
    // Also include bookings with no consultant (manual entries block everyone)
    if (consultant) {
      filterFormula = `AND(
        IS_AFTER({dateAndTime}, '${startOfDay}'),
        IS_BEFORE({dateAndTime}, '${endOfDay}'),
        OR({Consultant} = '${consultant}', {Consultant} = '')
      )`;
    }

    const records = await getBase()(TABLES.BOOKED)
      .select({
        filterByFormula: filterFormula,
        fields: ['dateAndTime', 'Consultant', 'Duration', 'ServiceType'],
      })
      .all();

    const result = records
      .filter((record) => {
        // Skip records with no dateAndTime (incomplete manual entries)
        const dateTime = record.get('dateAndTime') as string;
        return dateTime && !isNaN(new Date(dateTime).getTime());
      })
      .map((record) => {
        const dateTime = record.get('dateAndTime') as string;
        const utcDate = new Date(dateTime);

        // Convert UTC to Mountain Time using Intl (handles DST automatically)
        const formatter = new Intl.DateTimeFormat('en-US', {
          timeZone: 'America/Denver',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        });

        const parts = formatter.formatToParts(utcDate);
        const hours = parts.find(p => p.type === 'hour')?.value || '00';
        const minutes = parts.find(p => p.type === 'minute')?.value || '00';
        const timeSlot = `${hours}:${minutes}`;

        const consultantName = record.get('Consultant') as ConsultantType;
        const duration = (record.get('Duration') as number) || 30;
        const serviceType = (record.get('ServiceType') as string) || '';

        return { timeSlot, consultant: consultantName, duration, serviceType };
      });

    serverCacheSet(cacheKey, result, SERVER_CACHE_TTL.BOOKINGS);
    return result;
  } catch (error) {
    console.error('Error fetching bookings for date:', error);
    throw new Error('BOOKING_DATA_UNAVAILABLE');
  }
}

/**
 * Get all 30-min blocks blocked by a booking, including the buffer period after.
 * E.g., a 60-min booking at "10:00" with 30-min buffer blocks ["10:00", "10:30", "11:00"]
 */
export function getBlockedSlotsWithBuffer(startTime: string, duration: number): string[] {
  const totalMinutes = duration + BOOKING_LIMITS.BUFFER_MINUTES;
  const blocks: string[] = [];
  const blocksNeeded = Math.ceil(totalMinutes / 30);
  let currentMinutes = timeToMinutes(startTime);

  for (let i = 0; i < blocksNeeded; i++) {
    blocks.push(minutesToTime(currentMinutes));
    currentMinutes += 30;
  }

  return blocks;
}

/**
 * Get fully booked dates for a month (all slots taken)
 * Optionally filter by consultant to show their specific availability
 */
export async function getFullyBookedDates(
  year: number,
  month: number,
  consultant?: ConsultantType
): Promise<string[]> {
  const cacheKey = `fullybooked_${year}_${month}_${consultant || 'all'}`;
  const cached = serverCacheGet<string[]>(cacheKey);
  if (cached) return cached;

  try {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    let filterFormula = `AND(
      IS_AFTER({dateAndTime}, '${startDate.toISOString()}'),
      IS_BEFORE({dateAndTime}, '${endDate.toISOString()}')
    )`;

    // Add consultant filter if specified
    if (consultant) {
      filterFormula = `AND(
        IS_AFTER({dateAndTime}, '${startDate.toISOString()}'),
        IS_BEFORE({dateAndTime}, '${endDate.toISOString()}'),
        {Consultant} = '${consultant}'
      )`;
    }

    const records = await getBase()(TABLES.BOOKED)
      .select({
        filterByFormula: filterFormula,
        fields: ['dateAndTime'],
      })
      .all();

    // Group by date and count
    const dateCount: Record<string, number> = {};
    records.forEach((record) => {
      const dateTime = record.get('dateAndTime') as string;
      const date = new Date(dateTime).toISOString().split('T')[0];
      dateCount[date] = (dateCount[date] || 0) + 1;
    });

    // Return dates with 8 or more bookings (fully booked)
    const result = Object.entries(dateCount)
      .filter(([_, count]) => count >= 8)
      .map(([date]) => date);

    serverCacheSet(cacheKey, result, SERVER_CACHE_TTL.FULLY_BOOKED);
    return result;
  } catch (error) {
    console.error('Error fetching fully booked dates:', error);
    return [];
  }
}

// ============================================================================
// TESTIMONIALS
// ============================================================================

export async function getTestimonials(): Promise<Testimonial[]> {
  try {
    const records = await getBase()(TABLES.TESTIMONIALS)
      .select({
        filterByFormula: '{Approved}',
        sort: [{ field: 'DateCreated', direction: 'desc' }],
      })
      .all();

    return records.map((record) => ({
      name: record.get('Name') as string,
      text: record.get('Text') as string,
      rating: record.get('Rating') as number | undefined,
      approved: record.get('Approved') as boolean,
    }));
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    return [];
  }
}

export async function createTestimonial(data: Testimonial) {
  try {
    const record = await getBase()(TABLES.TESTIMONIALS).create([
      {
        fields: {
          Name: data.name,
          Text: data.text,
          Rating: data.rating,
          Approved: false, // Requires manual approval
          DateCreated: new Date().toISOString(),
        },
      } as any,
    ]);

    return {
      id: record[0].id,
      success: true,
    };
  } catch (error) {
    console.error('Error creating testimonial:', error);
    throw error;
  }
}

// ============================================================================
// FAQs
// ============================================================================

export async function getFAQs(): Promise<FAQ[]> {
  try {
    const records = await getBase()(TABLES.FAQS)
      .select({
        sort: [{ field: 'Order', direction: 'asc' }],
      })
      .all();

    return records.map((record) => ({
      id: record.id,
      question: record.get('Question') as string,
      answer: record.get('Answer') as string,
      category: record.get('Category') as string,
      order: record.get('Order') as number,
      clickCount: (record.get('ClickCount') as number) || 0,
    }));
  } catch (error) {
    console.error('Error fetching FAQs:', error);
    return [];
  }
}

export async function trackFAQClick(faqId: string) {
  // FAQ click tracking disabled to reduce Airtable API usage
  // Analytics can be tracked client-side via localStorage if needed
  return { success: true };
}

// ============================================================================
// COMING SOON FEATURES
// ============================================================================

export async function getComingSoonFeatures(): Promise<ComingSoonFeature[]> {
  try {
    const records = await getBase()(TABLES.COMING_SOON)
      .select({
        filterByFormula: '{IsVisible}',
        sort: [{ field: 'DisplayOrder', direction: 'asc' }],
      })
      .all();

    return records.map((record) => ({
      id: record.id,
      title: record.get('Title') as string,
      description: record.get('Description') as string,
      icon: record.get('Icon') as string,
      eta: record.get('ETA') as string,
      status: record.get('Status') as string,
      priority: record.get('Priority') as string,
      displayOrder: record.get('DisplayOrder') as number,
      isVisible: record.get('IsVisible') as boolean,
    }));
  } catch (error) {
    console.error('Error fetching coming soon features:', error);
    return [];
  }
}

// ============================================================================
// ADVISOR AVAILABILITY
// ============================================================================

/**
 * Helper function to generate 30-minute time slots from start to end time
 * Returns array of time strings in HH:MM format
 */
function generateTimeSlotsFromRange(startTime: string, endTime: string): string[] {
  const slots: string[] = [];
  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

  // Validate time format
  if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
    console.warn(`Invalid time format: start="${startTime}", end="${endTime}"`);
    return [];
  }

  // Convert times to minutes since midnight
  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);

  let currentMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;

  // Generate 30-minute slots
  while (currentMinutes < endMinutes) {
    const hours = Math.floor(currentMinutes / 60);
    const minutes = currentMinutes % 60;
    slots.push(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`);
    currentMinutes += 30;  // 30-minute blocks
  }

  return slots;
}

/**
 * Get advisor's recurring weekly availability for a specific day
 * Returns array of available 30-minute time slots in HH:MM format
 * Uses hardcoded ADVISOR_SCHEDULES directly — zero Airtable calls
 */
export function getAdvisorAvailability(
  consultant: ConsultantType,
  dayOfWeek: string
): string[] {
  const schedule = ADVISOR_SCHEDULES[consultant]?.[dayOfWeek];

  if (!schedule || !schedule.isActive) {
    return [];
  }

  return generateTimeSlotsFromRange(schedule.start, schedule.end);
}

/**
 * Check if any advisor has availability on a specific day of the week
 * Returns true if at least one advisor is scheduled for that day
 * Uses hardcoded ADVISOR_SCHEDULES directly — zero Airtable calls
 */
export function hasAnyAdvisorAvailability(dayOfWeek: string): boolean {
  const consultants: ConsultantType[] = ['Heidi Lynn', 'Illiana'];

  for (const consultant of consultants) {
    const schedule = ADVISOR_SCHEDULES[consultant]?.[dayOfWeek];
    if (schedule && schedule.isActive) {
      return true;
    }
  }

  return false;
}

/**
 * Check if a specific consultant has availability on a specific day of week
 * Uses hardcoded ADVISOR_SCHEDULES directly — zero Airtable calls
 */
export function hasConsultantAvailability(
  consultant: ConsultantType,
  dayOfWeek: string
): boolean {
  const schedule = ADVISOR_SCHEDULES[consultant]?.[dayOfWeek];
  return !!(schedule && schedule.isActive);
}

/**
 * Check if advisor has any time off on a specific date
 * Returns object with full day off flag and partial time off ranges
 */
export async function getAdvisorDaysOff(
  consultant: ConsultantType,
  date: string
): Promise<AdvisorDaysOffResult> {
  try {
    const records = await getBase()(TABLES.ADVISOR_DAYS_OFF)
      .select({
        filterByFormula: `AND({Consultant} = '${consultant}', {Date} = '${date}')`,
      })
      .all();

    // No days off records for this date
    if (records.length === 0) {
      return { isFullDayOff: false, partialTimeOffRanges: [] };
    }

    // Check if any record is marked as all day
    const hasFullDayOff = records.some((record) => record.get('AllDay') === true);

    if (hasFullDayOff) {
      return { isFullDayOff: true, partialTimeOffRanges: [] };
    }

    // Collect partial time off ranges
    const partialTimeOffRanges = records
      .filter((record) => !record.get('AllDay'))
      .map((record) => ({
        start: record.get('StartTime') as string,
        end: record.get('EndTime') as string,
      }))
      .filter((range) => range.start && range.end);

    return { isFullDayOff: false, partialTimeOffRanges };
  } catch (error) {
    console.error('Error fetching advisor days off:', error);
    // Return no days off on error - safer to show availability
    return { isFullDayOff: false, partialTimeOffRanges: [] };
  }
}

/**
 * Get all days off for a specific date (both consultants in one query)
 * Single Airtable call replaces 2 separate per-consultant queries
 * Server-cached for 15 minutes since days off rarely change intra-day
 */
export async function getDaysOffForDate(
  date: string
): Promise<Record<ConsultantType, AdvisorDaysOffResult>> {
  const cacheKey = `daysoff_${date}`;
  const cached = serverCacheGet<Record<ConsultantType, AdvisorDaysOffResult>>(cacheKey);
  if (cached) return cached;

  const defaultResult: Record<ConsultantType, AdvisorDaysOffResult> = {
    'Heidi Lynn': { isFullDayOff: false, partialTimeOffRanges: [] },
    'Illiana': { isFullDayOff: false, partialTimeOffRanges: [] },
  };

  try {
    const records = await getBase()(TABLES.ADVISOR_DAYS_OFF)
      .select({
        filterByFormula: `{Date} = '${date}'`,
      })
      .all();

    if (records.length === 0) {
      serverCacheSet(cacheKey, defaultResult, SERVER_CACHE_TTL.DAYS_OFF);
      return defaultResult;
    }

    const result: Record<ConsultantType, AdvisorDaysOffResult> = {
      'Heidi Lynn': { isFullDayOff: false, partialTimeOffRanges: [] },
      'Illiana': { isFullDayOff: false, partialTimeOffRanges: [] },
    };

    for (const record of records) {
      const consultant = record.get('Consultant') as ConsultantType;
      if (!result[consultant]) continue;

      if (record.get('AllDay') === true) {
        result[consultant].isFullDayOff = true;
        result[consultant].partialTimeOffRanges = [];
      } else if (!result[consultant].isFullDayOff) {
        const start = record.get('StartTime') as string;
        const end = record.get('EndTime') as string;
        if (start && end) {
          result[consultant].partialTimeOffRanges.push({ start, end });
        }
      }
    }

    serverCacheSet(cacheKey, result, SERVER_CACHE_TTL.DAYS_OFF);
    return result;
  } catch (error) {
    console.error('Error fetching days off for date:', error);
    return defaultResult;
  }
}

/**
 * Helper function to convert HH:MM time to minutes since midnight
 */
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Helper function to convert minutes since midnight to HH:MM format
 */
function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

/**
 * Check if a time falls within a time range
 */
function isTimeInRange(time: string, start: string, end: string): boolean {
  const timeMinutes = timeToMinutes(time);
  const startMinutes = timeToMinutes(start);
  const endMinutes = timeToMinutes(end);
  return timeMinutes >= startMinutes && timeMinutes < endMinutes;
}

/**
 * Get day of week name from date string (YYYY-MM-DD)
 */
function getDayOfWeek(dateString: string): string {
  const date = new Date(dateString + 'T12:00:00'); // Noon to avoid timezone issues
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[date.getDay()];
}

/**
 * Check if a specific advisor is available at a given date/time
 * This is the main availability check function that combines all rules
 */
export async function isAdvisorAvailable(
  consultant: ConsultantType,
  date: string,
  timeSlot: string
): Promise<boolean> {
  try {
    // Get day of week
    const dayOfWeek = getDayOfWeek(date);

    // 2. Get advisor's weekly schedule (synchronous, uses hardcoded data)
    const weeklySchedule = getAdvisorAvailability(consultant, dayOfWeek);

    // No schedule = not available on this day
    const availableSlots = weeklySchedule;

    // 3. Check if time slot is in weekly schedule
    if (!availableSlots.includes(timeSlot)) {
      return false;
    }

    // 4. Check days off
    const daysOff = await getAdvisorDaysOff(consultant, date);

    if (daysOff.isFullDayOff) {
      return false;
    }

    // Check partial day off ranges
    for (const range of daysOff.partialTimeOffRanges) {
      if (isTimeInRange(timeSlot, range.start, range.end)) {
        return false;
      }
    }

    // 5. Check if already booked (this will be checked in the main availability function)
    // We'll handle this in getAvailabilityForBothAdvisors

    // All checks passed
    return true;
  } catch (error) {
    console.error('Error checking advisor availability:', error);
    // On error, return true to avoid blocking bookings
    return true;
  }
}

/**
 * Generate fallback 24-hour schedule (used when no availability records exist)
 */
function generateFallbackSchedule(): string[] {
  const slots: string[] = [];
  // Support full 24-hour schedule (midnight to 11:30 PM)
  for (let hour = 0; hour < 24; hour++) {
    slots.push(`${hour.toString().padStart(2, '0')}:00`);
    slots.push(`${hour.toString().padStart(2, '0')}:30`);
  }
  return slots;
}

/**
 * Check if consecutive 30-min blocks are available
 * Used to validate if a service duration can fit in the schedule
 */
function hasConsecutiveBlocks(
  startTime: string,
  serviceDuration: number,
  availableBlocks: string[]
): boolean {
  // Calculate how many 30-min blocks are needed (round up)
  const blocksNeeded = Math.ceil(serviceDuration / 30);

  // Generate required block times
  const requiredBlocks: string[] = [];
  let currentMinutes = timeToMinutes(startTime);

  for (let i = 0; i < blocksNeeded; i++) {
    requiredBlocks.push(minutesToTime(currentMinutes));
    currentMinutes += 30;
  }

  // Check if all required blocks are available
  return requiredBlocks.every((block) => availableBlocks.includes(block));
}

/**
 * Get availability for both advisors for a specific date
 * Returns categorized time slots for selected and other advisor
 */
export async function getAvailabilityForBothAdvisors(
  date: string,
  selectedConsultant: ConsultantType,
  serviceType: ServiceType
): Promise<{
  selectedAdvisorSlots: TimeSlot[];
  otherAdvisorSlots: TimeSlot[];
  otherConsultantName: ConsultantType;
  bookingDataUnavailable: boolean;
}> {
  try {
    // Determine the other consultant
    const otherConsultant: ConsultantType =
      selectedConsultant === 'Heidi Lynn' ? 'Illiana' : 'Heidi Lynn';

    // Get service configuration
    const serviceConfig = SERVICES[serviceType];
    const serviceDuration = serviceConfig.duration;

    // Check if other consultant offers this service
    const otherConsultantOffersService =
      !serviceConfig.availableConsultants ||
      serviceConfig.availableConsultants.includes(otherConsultant);

    // Get day of week
    const dayOfWeek = getDayOfWeek(date);

    // Get schedules directly from hardcoded data (zero Airtable calls)
    const selectedSchedule = getAdvisorAvailability(selectedConsultant, dayOfWeek);
    const otherSchedule = otherConsultantOffersService
      ? getAdvisorAvailability(otherConsultant, dayOfWeek)
      : [];

    // No schedule = not available (no fallback to 24-hour schedule)
    const selectedAvailableBlocks = selectedSchedule;

    // For other consultant: only use their schedule if they offer this service
    const otherAvailableBlocks = otherConsultantOffersService ? otherSchedule : [];

    // Get days off for both advisors in a single batched query (1 Airtable call instead of 2)
    const allDaysOff = await getDaysOffForDate(date);
    const selectedDaysOff = allDaysOff[selectedConsultant];
    const otherDaysOff = otherConsultantOffersService
      ? allDaysOff[otherConsultant]
      : { isFullDayOff: true, partialTimeOffRanges: [] };

    // Get existing bookings for both advisors
    // If booking data is unavailable (API failure), allow booking but flag for manual verification
    let bookings: Array<{ timeSlot: string; consultant: ConsultantType; duration: number; serviceType: string }> = [];
    let bookingDataUnavailable = false;

    try {
      bookings = await getBookingsForDate(date);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('BOOKING_DATA_UNAVAILABLE')) {
        console.warn('Booking data unavailable - allowing booking with manual verification flag');
        bookingDataUnavailable = true;
      } else {
        throw error;
      }
    }

    // Build blocked slot lists with duration + buffer awareness
    // Each booking blocks its duration PLUS a 30-min buffer after
    const selectedBlockedSlots: string[] = [];
    const otherBlockedSlots: string[] = [];

    for (const booking of bookings) {
      const blocked = getBlockedSlotsWithBuffer(booking.timeSlot, booking.duration);
      if (!booking.consultant) {
        // No consultant assigned (manual entry) - block both
        selectedBlockedSlots.push(...blocked);
        otherBlockedSlots.push(...blocked);
      } else if (booking.consultant === selectedConsultant) {
        selectedBlockedSlots.push(...blocked);
      } else if (booking.consultant === otherConsultant) {
        otherBlockedSlots.push(...blocked);
      }
    }

    // Check daily booking limits per consultant
    const isBusinessService = serviceType === 'Business Consultation';
    const selectedBookings = bookings.filter((b) => b.consultant === selectedConsultant || !b.consultant);
    const selectedClientCount = selectedBookings.filter((b) => b.serviceType !== 'Business Consultation').length;
    const selectedBusinessCount = selectedBookings.filter((b) => b.serviceType === 'Business Consultation').length;
    const selectedLimitReached = isBusinessService
      ? selectedBusinessCount >= BOOKING_LIMITS.MAX_BUSINESS_BOOKINGS_PER_DAY
      : selectedClientCount >= BOOKING_LIMITS.MAX_CLIENT_BOOKINGS_PER_DAY;

    const otherBookings = bookings.filter((b) => b.consultant === otherConsultant || !b.consultant);
    const otherClientCount = otherBookings.filter((b) => b.serviceType !== 'Business Consultation').length;
    const otherBusinessCount = otherBookings.filter((b) => b.serviceType === 'Business Consultation').length;
    const otherLimitReached = isBusinessService
      ? otherBusinessCount >= BOOKING_LIMITS.MAX_BUSINESS_BOOKINGS_PER_DAY
      : otherClientCount >= BOOKING_LIMITS.MAX_CLIENT_BOOKINGS_PER_DAY;

    // Generate time slots based on service duration
    const allPossibleSlots = generateTimeSlots(serviceDuration);

    const selectedAdvisorSlots: TimeSlot[] = [];
    const otherAdvisorSlots: TimeSlot[] = [];

    // Calculate minimum booking time (8 hours from now in MST)
    const now = new Date();
    const mstOffset = isDST(now) ? -6 : -7;
    const mstNow = new Date(now.getTime() + mstOffset * 60 * 60 * 1000);
    const minimumBookingTime = new Date(mstNow.getTime() + 8 * 60 * 60 * 1000);

    for (const slot of allPossibleSlots) {
      const slotTime = slot.start;

      // Check if slot is too soon
      const slotDate = new Date(date + 'T' + slotTime + ':00');
      const isTooSoon = slotDate < minimumBookingTime;

      // Check selected advisor availability
      const selectedHasBlocks = hasConsecutiveBlocks(slotTime, serviceDuration, selectedAvailableBlocks);
      const selectedNotDayOff =
        !selectedDaysOff.isFullDayOff &&
        !selectedDaysOff.partialTimeOffRanges.some((range) =>
          isTimeInRange(slotTime, range.start, range.end)
        );
      // Duration + buffer aware: all required blocks for this booking must be free
      const requiredBlocks = getBlockedSlotsWithBuffer(slotTime, serviceDuration);
      const selectedNotBooked = !selectedLimitReached &&
        requiredBlocks.every((block) => !selectedBlockedSlots.includes(block));
      const selectedAvailable =
        selectedHasBlocks && selectedNotDayOff && selectedNotBooked && !isTooSoon;

      // Check other advisor availability
      const otherHasBlocks = hasConsecutiveBlocks(slotTime, serviceDuration, otherAvailableBlocks);
      const otherNotDayOff =
        !otherDaysOff.isFullDayOff &&
        !otherDaysOff.partialTimeOffRanges.some((range) =>
          isTimeInRange(slotTime, range.start, range.end)
        );
      const otherNotBooked = !otherLimitReached &&
        requiredBlocks.every((block) => !otherBlockedSlots.includes(block));
      const otherAvailable = otherHasBlocks && otherNotDayOff && otherNotBooked && !isTooSoon;

      // Add to selected advisor slots if they're available
      if (selectedAvailable) {
        selectedAdvisorSlots.push({
          start: slot.start,
          end: slot.end,
          available: true,
        });
      } else if (otherAvailable) {
        selectedAdvisorSlots.push({
          start: slot.start,
          end: slot.end,
          available: false,
          availableWithOther: true,
          otherConsultant: otherConsultant,
        });
      }

      // Add to other advisor slots if they're available
      if (otherAvailable) {
        otherAdvisorSlots.push({
          start: slot.start,
          end: slot.end,
          available: true,
        });
      }
    }

    return {
      selectedAdvisorSlots,
      otherAdvisorSlots,
      otherConsultantName: otherConsultant,
      bookingDataUnavailable,
    };
  } catch (error) {
    console.error('Error getting availability for both advisors:', error);
    // Return empty slots on error
    return {
      selectedAdvisorSlots: [],
      otherAdvisorSlots: [],
      otherConsultantName: selectedConsultant === 'Heidi Lynn' ? 'Illiana' : 'Heidi Lynn',
      bookingDataUnavailable: true, // Flag as unavailable since we hit an error
    };
  }
}

/**
 * Helper function to check if a date is in DST
 */
function isDST(date: Date): boolean {
  const jan = new Date(date.getFullYear(), 0, 1);
  const jul = new Date(date.getFullYear(), 6, 1);
  return date.getTimezoneOffset() < Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset());
}

/**
 * Generate time slots for a given duration
 * (This might already exist in timezone.ts, but including here for completeness)
 */
function generateTimeSlots(
  duration: number,
  startHour: number = 0,
  endHour: number = 24
): TimeSlot[] {
  const slots: TimeSlot[] = [];
  let currentMinutes = startHour * 60;
  const endMinutes = endHour * 60;

  // FIXED: Increment by 30-minute blocks (Airtable block size) instead of service duration
  // This allows 40-minute slots to start at 9:00, 9:30, 10:00, 10:30, etc.
  const BLOCK_SIZE_MINUTES = 30;

  while (currentMinutes + duration <= endMinutes) {
    const start = minutesToTime(currentMinutes);
    const end = minutesToTime(currentMinutes + duration);

    slots.push({
      start,
      end,
      available: false, // Will be set by availability check
    });

    currentMinutes += BLOCK_SIZE_MINUTES;  // ✓ FIXED: Always increment by 30 minutes
  }

  return slots;
}
