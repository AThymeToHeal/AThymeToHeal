/**
 * One-time copy of every Airtable table into Supabase.
 *
 * Reads AIRTABLE_API_KEY / AIRTABLE_BASE_ID and NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SECRET_KEY
 * from .env.local. Safe to re-run: rows are upserted on airtable_id, so nothing duplicates.
 *
 *   node scripts/migrate-airtable-to-supabase.mjs            # dry run: counts only
 *   node scripts/migrate-airtable-to-supabase.mjs --write    # copy for real
 *
 * Airtable's free plan allows 1,000 API calls a month. Each page of 100 rows is one call,
 * so a full copy costs roughly (rows / 100) + 8 calls. If the monthly allowance is already
 * used up, Airtable answers 429 and the script stops: export each table to CSV instead.
 */

import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createClient } from '@supabase/supabase-js';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, '..', '.env.local') });

const WRITE = process.argv.includes('--write');
const { AIRTABLE_API_KEY, AIRTABLE_BASE_ID, NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SECRET_KEY } = process.env;

if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
  console.error('Missing AIRTABLE_API_KEY or AIRTABLE_BASE_ID in .env.local');
  process.exit(1);
}
if (WRITE && (!NEXT_PUBLIC_SUPABASE_URL || !SUPABASE_SECRET_KEY)) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY in .env.local');
  process.exit(1);
}

const db = WRITE
  ? createClient(NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SECRET_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
  : null;

const str = (v) => (v === undefined || v === null || v === '' ? null : String(v));
const num = (v) => (typeof v === 'number' && !Number.isNaN(v) ? v : null);
const bool = (v) => v === true;
const consultant = (v) => (v === 'Heidi Lynn' || v === 'Illiana' ? v : null);
const hhmm = (v) => (typeof v === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(v.trim()) ? v.trim() : null);
const created = (r, field) => str(r.fields[field]) ?? r.createdTime;

// Airtable table -> Supabase table, with a field mapper per row
const TABLES = [
  {
    from: 'Booked',
    to: 'bookings',
    map: (r) => {
      const f = r.fields;
      if (!f.dateAndTime) return null; // incomplete manual entry, never blocked anything
      return {
        date_and_time: f.dateAndTime,
        first_name: str(f.FirstName),
        last_name: str(f.LastName),
        email: str(f.Email),
        phone: str(f.Phone),
        booking_type: str(f.BookingType),
        service_type: str(f.ServiceType),
        consultant: consultant(f.Consultant),
        duration: num(f.Duration) ?? 30,
        price: num(f.Price),
        user_timezone: str(f.UserTimezone),
        user_local_time: str(f.UserLocalTime),
        notes: str(f.Notes),
        created_at: r.createdTime,
      };
    },
  },
  {
    from: 'Advisor Days Off',
    to: 'advisor_days_off',
    map: (r) => {
      const f = r.fields;
      if (!f.Date || !consultant(f.Consultant)) return null;
      return {
        date: f.Date,
        consultant: f.Consultant,
        all_day: bool(f.AllDay),
        start_time: hhmm(f.StartTime),
        end_time: hhmm(f.EndTime),
        reason: str(f.Reason),
        created_at: r.createdTime,
      };
    },
  },
  {
    from: 'Clients',
    to: 'clients',
    map: (r) => {
      const f = r.fields;
      return {
        first_name: str(f.FirstName),
        last_name: str(f.LastName),
        email: str(f.Email),
        phone: str(f.Phone),
        preferred_contact_method: str(f.PreferredContactMethod),
        consent: bool(f.Consent),
        health_goals: str(f.HealthGoals),
        dietary_restrictions: str(f.DietaryRestrictions),
        current_medications: str(f.CurrentMedications),
        health_conditions: str(f.HealthConditions),
        created_at: created(r, 'DateCreated'),
      };
    },
  },
  {
    from: 'contact',
    to: 'contacts',
    map: (r) => {
      const f = r.fields;
      return {
        first_name: str(f.FirstName),
        last_name: str(f.LastName),
        email: str(f.Email),
        phone: str(f.Phone),
        subject: str(f.Subject),
        message: str(f.Message),
        source: str(f.Source),
        created_at: created(r, 'DateCreated'),
      };
    },
  },
  {
    from: 'Newsletter Signups',
    to: 'newsletter_signups',
    map: (r) => {
      const f = r.fields;
      if (!f.Email) return null;
      return {
        email: f.Email,
        name: str(f.Name),
        source: str(f.Source),
        status: str(f.Status) ?? 'Active',
        created_at: created(r, 'Subscribed Date'),
      };
    },
  },
  {
    from: 'Testimonials',
    to: 'testimonials',
    map: (r) => {
      const f = r.fields;
      const rating = num(f.Rating);
      return {
        name: str(f.Name),
        text: str(f.Text),
        rating: rating && rating >= 1 && rating <= 5 ? rating : null,
        approved: bool(f.Approved),
        created_at: created(r, 'DateCreated'),
      };
    },
  },
  {
    from: 'FAQs',
    to: 'faqs',
    map: (r) => {
      const f = r.fields;
      if (!f.Question || !f.Answer) return null;
      return {
        question: f.Question,
        answer: f.Answer,
        category: str(f.Category),
        sort_order: num(f.Order),
        click_count: num(f.ClickCount) ?? 0,
        created_at: r.createdTime,
      };
    },
  },
  {
    from: 'Coming Soon Features',
    to: 'coming_soon_features',
    map: (r) => {
      const f = r.fields;
      return {
        title: str(f.Title),
        description: str(f.Description),
        icon: str(f.Icon),
        eta: str(f.ETA),
        status: str(f.Status),
        priority: str(f.Priority),
        display_order: num(f.DisplayOrder),
        is_visible: bool(f.IsVisible),
        created_at: r.createdTime,
      };
    },
  },
];

async function fetchAll(table) {
  const records = [];
  let offset;
  do {
    const url = new URL(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(table)}`);
    url.searchParams.set('pageSize', '100');
    if (offset) url.searchParams.set('offset', offset);
    const res = await fetch(url, { headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` } });
    if (res.status === 404) return null; // table doesn't exist in this base
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Airtable ${table}: HTTP ${res.status} ${body.slice(0, 200)}`);
    }
    const json = await res.json();
    records.push(...json.records);
    offset = json.offset;
    if (offset) await new Promise((r) => setTimeout(r, 250)); // stay under 5 req/s
  } while (offset);
  return records;
}

console.log(WRITE ? 'Copying Airtable -> Supabase\n' : 'DRY RUN (add --write to copy)\n');

let failed = false;
for (const t of TABLES) {
  const records = await fetchAll(t.from);
  if (records === null) {
    console.log(`- ${t.from}: not in this base, skipped`);
    continue;
  }
  const rows = records
    .map((r) => {
      const row = t.map(r);
      return row ? { ...row, airtable_id: r.id } : null;
    })
    .filter(Boolean);
  const skipped = records.length - rows.length;

  if (WRITE && rows.length) {
    const { error } = await db.from(t.to).upsert(rows, { onConflict: 'airtable_id' });
    if (error) {
      failed = true;
      console.log(`x ${t.from} -> ${t.to}: ${error.message}`);
      continue;
    }
  }
  console.log(`${WRITE ? '✓' : '·'} ${t.from} -> ${t.to}: ${rows.length} rows${skipped ? ` (${skipped} incomplete skipped)` : ''}`);
}

process.exit(failed ? 1 : 0);
