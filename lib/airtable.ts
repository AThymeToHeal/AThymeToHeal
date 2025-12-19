import Airtable from 'airtable';

// Initialize Airtable
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY!;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID!;

if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
  throw new Error('Missing Airtable configuration. Check .env.local file.');
}

const base = new Airtable({ apiKey: AIRTABLE_API_KEY }).base(AIRTABLE_BASE_ID);

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
  source?: string;
}

export interface Consultation {
  firstName: string;
  lastName: string;
  email: string;
  bookingType: string;
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
  bestTimeToContact?: string;
  consent: boolean;
  bookedRecordId?: string;
}

export interface Testimonial {
  name: string;
  text: string;
  rating: number;
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

// ============================================================================
// CONTACT FORM
// ============================================================================

export async function createContact(data: ContactSubmission) {
  try {
    const record = await base(TABLES.CONTACT).create([
      {
        fields: {
          FirstName: data.firstName,
          LastName: data.lastName,
          Email: data.email,
          Phone: data.phone || '',
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
    const record = await base(TABLES.NEWSLETTER).create([
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

    const record = await base(TABLES.BOOKED).create([
      {
        fields: {
          dateAndTime: utcDateTime,
          FirstName: consultation.firstName,
          LastName: consultation.lastName,
          Email: consultation.email,
          BookingType: consultation.bookingType,
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
      BestTimeToContact: data.bestTimeToContact || '',
      Consent: data.consent,
    };

    // Link to booking record if provided
    if (data.bookedRecordId) {
      fields.BookedRecord = [data.bookedRecordId];
    }

    const record = await base(TABLES.CLIENTS).create([{ fields } as any]);

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
 * Get all bookings for a specific date
 */
export async function getBookingsForDate(date: string): Promise<string[]> {
  try {
    const startOfDay = mstToUtcIso(date, '00:00');
    const endOfDay = mstToUtcIso(date, '23:59');

    const records = await base(TABLES.BOOKED)
      .select({
        filterByFormula: `AND(
          IS_AFTER({dateAndTime}, '${startOfDay}'),
          IS_BEFORE({dateAndTime}, '${endOfDay}')
        )`,
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
 */
export async function getFullyBookedDates(year: number, month: number): Promise<string[]> {
  try {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const records = await base(TABLES.BOOKED)
      .select({
        filterByFormula: `AND(
          IS_AFTER({dateAndTime}, '${startDate.toISOString()}'),
          IS_BEFORE({dateAndTime}, '${endDate.toISOString()}')
        )`,
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
    const records = await base(TABLES.TESTIMONIALS)
      .select({
        filterByFormula: '{Approved} = TRUE()',
        sort: [{ field: 'DateCreated', direction: 'desc' }],
      })
      .all();

    return records.map((record) => ({
      name: record.get('Name') as string,
      text: record.get('Text') as string,
      rating: (record.get('Rating') as number) || 5,
      approved: record.get('Approved') as boolean,
    }));
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    return [];
  }
}

export async function createTestimonial(data: Testimonial) {
  try {
    const record = await base(TABLES.TESTIMONIALS).create([
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
    const records = await base(TABLES.FAQS)
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
    await base(TABLES.FAQ_CLICKS).create([
      {
        fields: {
          FAQId: [faqId], // Linked record
          ClickedAt: new Date().toISOString(),
        },
      } as any,
    ]);

    // Also increment the click count on the FAQ record itself
    const record = await base(TABLES.FAQS).find(faqId);
    const currentCount = (record.get('ClickCount') as number) || 0;

    await base(TABLES.FAQS).update([
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
