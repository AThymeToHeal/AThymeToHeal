import Airtable from 'airtable';

// Lazy initialization of Airtable - only runs when actually needed
let _base: ReturnType<Airtable['base']> | null = null;

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
export type ServiceType = 'Free Consult' | 'Essential Emotions' | 'Symphony of Cells';
export type ConsultantType = 'Heidi Lynn' | 'Illiana';

export interface ServiceConfig {
  name: ServiceType;
  duration: number; // in minutes
  price: number;
  description: string;
}

// Service configuration constant
export const SERVICES: Record<ServiceType, ServiceConfig> = {
  'Free Consult': {
    name: 'Free Consult',
    duration: 30,
    price: 0,
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
 */
export async function getBookingsForDate(
  date: string,
  consultant?: ConsultantType
): Promise<Array<{ timeSlot: string; consultant: ConsultantType }>> {
  try {
    const startOfDay = mstToUtcIso(date, '00:00');
    const endOfDay = mstToUtcIso(date, '23:59');

    let filterFormula = `AND(
      IS_AFTER({dateAndTime}, '${startOfDay}'),
      IS_BEFORE({dateAndTime}, '${endOfDay}')
    )`;

    // Add consultant filter if specified
    if (consultant) {
      filterFormula = `AND(
        IS_AFTER({dateAndTime}, '${startOfDay}'),
        IS_BEFORE({dateAndTime}, '${endOfDay}'),
        {Consultant} = '${consultant}'
      )`;
    }

    const records = await getBase()(TABLES.BOOKED)
      .select({
        filterByFormula: filterFormula,
        fields: ['dateAndTime', 'Consultant'],
      })
      .all();

    return records.map((record) => {
      const dateTime = record.get('dateAndTime') as string;
      const utcDate = new Date(dateTime);

      // Convert UTC to Mountain Time using Intl (handles DST automatically)
      // MDT = UTC-6 (March-November), MST = UTC-7 (November-March)
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

      return {
        timeSlot,
        consultant: consultantName,
      };
    });
  } catch (error) {
    console.error('Error fetching bookings for date:', error);
    return [];
  }
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
    return Object.entries(dateCount)
      .filter(([_, count]) => count >= 8)
      .map(([date]) => date);
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
  try {
    // Increment the click count on the FAQ record
    const record = await getBase()(TABLES.FAQS).find(faqId);
    const currentCount = (record.get('ClickCount') as number) || 0;

    await getBase()(TABLES.FAQS).update([
      {
        id: faqId,
        fields: {
          ClickCount: currentCount + 1,
        },
      } as any,
    ]);

    return { success: true };
  } catch (error) {
    console.error('Error tracking FAQ click:', error);
    throw error;
  }
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
 * NEW: Generates slots dynamically from StartTime/EndTime schedule
 */
export async function getAdvisorAvailability(
  consultant: ConsultantType,
  dayOfWeek: string
): Promise<string[]> {
  try {
    const records = await getBase()(TABLES.ADVISOR_AVAILABILITY)
      .select({
        filterByFormula: `AND({Consultant} = '${consultant}', {DayOfWeek} = '${dayOfWeek}', {IsActive})`,
      })
      .all();

    // Should only be one record per advisor per day
    if (records.length === 0) {
      return [];
    }

    const record = records[0];
    const startTime = record.get('StartTime') as string;
    const endTime = record.get('EndTime') as string;

    if (!startTime || !endTime) {
      console.warn(`Missing StartTime or EndTime for ${consultant} on ${dayOfWeek}`);
      return [];
    }

    // Generate 30-minute time slots from the schedule
    return generateTimeSlotsFromRange(startTime, endTime);
  } catch (error) {
    console.error('Error fetching advisor availability:', error);
    // Return empty array - fallback logic will handle this
    return [];
  }
}

/**
 * Check if any advisor has availability on a specific day of the week
 * Returns true if at least one advisor is scheduled for that day
 */
export async function hasAnyAdvisorAvailability(dayOfWeek: string): Promise<boolean> {
  try {
    const records = await getBase()(TABLES.ADVISOR_AVAILABILITY)
      .select({
        filterByFormula: `AND({DayOfWeek} = '${dayOfWeek}', {IsActive})`,
        maxRecords: 1, // We only need to know if at least one exists
      })
      .all();

    return records.length > 0;
  } catch (error) {
    console.error('Error checking advisor availability for day:', error);
    // Default to allowing the day if there's an error
    return true;
  }
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

    // 2. Get advisor's weekly schedule
    const weeklySchedule = await getAdvisorAvailability(consultant, dayOfWeek);

    // If empty, use fallback 9-5 schedule (09:00-16:30 in 30-min blocks)
    const availableSlots = weeklySchedule.length > 0 ? weeklySchedule : generateFallbackSchedule();

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
}> {
  try {
    // Determine the other consultant
    const otherConsultant: ConsultantType =
      selectedConsultant === 'Heidi Lynn' ? 'Illiana' : 'Heidi Lynn';

    // Get service configuration
    const serviceConfig = SERVICES[serviceType];
    const serviceDuration = serviceConfig.duration;

    // Get day of week
    const dayOfWeek = getDayOfWeek(date);

    // Get both advisors' weekly schedules
    const [selectedSchedule, otherSchedule] = await Promise.all([
      getAdvisorAvailability(selectedConsultant, dayOfWeek),
      getAdvisorAvailability(otherConsultant, dayOfWeek),
    ]);

    // Use fallback if needed
    const selectedAvailableBlocks =
      selectedSchedule.length > 0 ? selectedSchedule : generateFallbackSchedule();
    const otherAvailableBlocks =
      otherSchedule.length > 0 ? otherSchedule : generateFallbackSchedule();

    // Get days off for both advisors
    const [selectedDaysOff, otherDaysOff] = await Promise.all([
      getAdvisorDaysOff(selectedConsultant, date),
      getAdvisorDaysOff(otherConsultant, date),
    ]);

    // Get existing bookings for both advisors
    const bookings = await getBookingsForDate(date);
    const selectedBookedSlots = bookings
      .filter((b) => b.consultant === selectedConsultant)
      .map((b) => b.timeSlot);
    const otherBookedSlots = bookings
      .filter((b) => b.consultant === otherConsultant)
      .map((b) => b.timeSlot);

    // Generate time slots based on service duration
    const allPossibleSlots = generateTimeSlots(serviceDuration);

    const selectedAdvisorSlots: TimeSlot[] = [];
    const otherAdvisorSlots: TimeSlot[] = [];

    // Calculate minimum booking time (8 hours from now in MST)
    const now = new Date();
    const mstOffset = isDST(now) ? -6 : -7; // MDT is UTC-6, MST is UTC-7
    const mstNow = new Date(now.getTime() + mstOffset * 60 * 60 * 1000);
    const minimumBookingTime = new Date(mstNow.getTime() + 8 * 60 * 60 * 1000);
    const minimumTimeString = `${minimumBookingTime.getUTCHours().toString().padStart(2, '0')}:${minimumBookingTime.getUTCMinutes().toString().padStart(2, '0')}`;

    for (const slot of allPossibleSlots) {
      const slotTime = slot.start;

      // Check if slot is too soon
      const slotDate = new Date(date + 'T' + slotTime + ':00');
      const isTooSoon = slotDate < minimumBookingTime;

      // Check selected advisor availability
      const selectedHasBlocks = hasConsecutiveBlocks(
        slotTime,
        serviceDuration,
        selectedAvailableBlocks
      );
      const selectedNotDayOff =
        !selectedDaysOff.isFullDayOff &&
        !selectedDaysOff.partialTimeOffRanges.some((range) =>
          isTimeInRange(slotTime, range.start, range.end)
        );
      const selectedNotBooked = !selectedBookedSlots.includes(slotTime);
      const selectedAvailable =
        selectedHasBlocks && selectedNotDayOff && selectedNotBooked && !isTooSoon;

      // Check other advisor availability
      const otherHasBlocks = hasConsecutiveBlocks(slotTime, serviceDuration, otherAvailableBlocks);
      const otherNotDayOff =
        !otherDaysOff.isFullDayOff &&
        !otherDaysOff.partialTimeOffRanges.some((range) =>
          isTimeInRange(slotTime, range.start, range.end)
        );
      const otherNotBooked = !otherBookedSlots.includes(slotTime);
      const otherAvailable = otherHasBlocks && otherNotDayOff && otherNotBooked && !isTooSoon;

      // Add to selected advisor slots if they're available
      if (selectedAvailable) {
        selectedAdvisorSlots.push({
          start: slot.start,
          end: slot.end,
          available: true,
        });
      } else if (otherAvailable) {
        // Add to selected advisor slots as "available with other"
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
    };
  } catch (error) {
    console.error('Error getting availability for both advisors:', error);
    // Return empty slots on error
    return {
      selectedAdvisorSlots: [],
      otherAdvisorSlots: [],
      otherConsultantName: selectedConsultant === 'Heidi Lynn' ? 'Illiana' : 'Heidi Lynn',
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
