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

export interface TimeSlot {
  start: string;
  end: string;
  available: boolean;
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
    duration: 40,
    price: 0,
    description: 'A consultation to start you on your health journey',
  },
  'Essential Emotions': {
    name: 'Essential Emotions',
    duration: 60,
    price: 60,
    description: 'Identify emotions and create new neuropathways',
  },
  'Symphony of Cells': {
    name: 'Symphony of Cells',
    duration: 30,
    price: 45,
    description: 'Essential oils and therapeutic massage for detox and healing',
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
 */
export async function getBookingsForDate(
  date: string,
  consultant?: ConsultantType
): Promise<string[]> {
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
        fields: ['dateAndTime'],
      })
      .all();

    return records.map((record) => {
      const dateTime = record.get('dateAndTime') as string;
      const date = new Date(dateTime);
      const hours = date.getUTCHours() - 7; // Convert UTC to MST (UTC-7)
      const minutes = date.getUTCMinutes();
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
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
        filterByFormula: '{Approved} = TRUE()',
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
