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
 */
function mstToUtcIso(date: string, time: string): string {
  const dateTimeString = `${date}T${time}:00-07:00`; // MST is UTC-7
  return new Date(dateTimeString).toISOString();
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

export async function createClient(data: ClientFormData) {
  try {
    const fields: Record<string, unknown> = {
      FirstName: data.firstName,
      LastName: data.lastName,
      Email: data.email,
      Phone: data.phone || '',
      HealthGoals: data.healthGoals || '',
      DietaryRestrictions: data.dietaryRestrictions || '',
      CurrentMedications: data.currentMedications || '',
      HealthConditions: data.healthConditions || '',
      PreferredContactMethod: data.preferredContactMethod || '',
      Consent: data.consent,
    };

    // Link to booking record if provided
    if (data.bookedRecordId) {
      fields.BookedRecord = [data.bookedRecordId];
    }

    const record = await getBase()(TABLES.CLIENTS).create([{ fields } as any]);

    return {
      id: record[0].id,
      success: true,
    };
  } catch (error) {
    console.error('Error creating client in Airtable:', error);
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
    // Create a click record
    await getBase()(TABLES.FAQ_CLICKS).create([
      {
        fields: {
          FAQId: [faqId], // Linked record
          ClickedAt: new Date().toISOString(),
        },
      } as any,
    ]);

    // Also increment the click count on the FAQ record itself
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
