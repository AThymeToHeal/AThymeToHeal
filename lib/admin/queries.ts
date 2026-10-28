import { getDb, TABLES } from '@/lib/db';
import { requireSession } from './session';
import { mountainToUtcIso, addDays, utcToMountain } from './time';

/** Reads for the /admin pages. Every function checks the session first. */

export interface BookingRow {
  id: string;
  date_and_time: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  booking_type: string | null;
  service_type: string | null;
  consultant: string | null;
  duration: number;
  price: number | null;
  user_timezone: string | null;
  user_local_time: string | null;
  notes: string | null;
  manage_token?: string;
  reminder_sent_at?: string | null;
  created_at: string;
}

export interface DayOffRow {
  id: string;
  date: string;
  consultant: string;
  all_day: boolean;
  start_time: string | null;
  end_time: string | null;
  reason: string | null;
}

export interface ClientRow {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  preferred_contact_method: string | null;
  consent: boolean;
  health_goals: string | null;
  dietary_restrictions: string | null;
  current_medications: string | null;
  health_conditions: string | null;
  created_at: string;
  updated_at: string;
}

export interface TestimonialRow {
  id: string;
  name: string | null;
  text: string | null;
  rating: number | null;
  approved: boolean;
  created_at: string;
}

export interface ContactRow {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  subject: string | null;
  message: string | null;
  source: string | null;
  created_at: string;
}

export interface NewsletterRow {
  id: string;
  email: string;
  name: string | null;
  source: string | null;
  status: string;
  created_at: string;
}

/** Bookings whose Mountain-Time date falls in [fromDate, toDate] inclusive. */
export async function listBookings(
  fromDate: string,
  toDate: string,
  opts: { consultant?: string; descending?: boolean } = {}
): Promise<BookingRow[]> {
  await requireSession();
  let q = getDb()
    .from(TABLES.BOOKED)
    .select('*')
    .gte('date_and_time', mountainToUtcIso(fromDate, '00:00'))
    .lt('date_and_time', mountainToUtcIso(addDays(toDate, 1), '00:00'))
    .order('date_and_time', { ascending: !opts.descending });
  // A booking with no consultant blocks both advisors, so it shows in either filter
  if (opts.consultant) q = q.or(`consultant.eq.${opts.consultant},consultant.is.null`);
  const { data, error } = await q;
  if (error) throw error;
  return data as BookingRow[];
}

export async function getBooking(id: string): Promise<BookingRow | null> {
  await requireSession();
  const { data, error } = await getDb().from(TABLES.BOOKED).select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data as BookingRow | null;
}

export async function listDaysOff(fromDate: string): Promise<DayOffRow[]> {
  await requireSession();
  const { data, error } = await getDb()
    .from(TABLES.ADVISOR_DAYS_OFF)
    .select('id, date, consultant, all_day, start_time, end_time, reason')
    .gte('date', fromDate)
    .order('date', { ascending: true })
    .order('start_time', { ascending: true, nullsFirst: true });
  if (error) throw error;
  return data as DayOffRow[];
}

export async function listClients(search?: string): Promise<ClientRow[]> {
  await requireSession();
  let q = getDb().from(TABLES.CLIENTS).select('*').order('created_at', { ascending: false }).limit(500);
  const term = search?.trim().replace(/[%,()*]/g, ' ').trim();
  if (term) {
    const like = `%${term}%`;
    q = q.or(`first_name.ilike.${like},last_name.ilike.${like},email.ilike.${like},phone.ilike.${like}`);
  }
  const { data, error } = await q;
  if (error) throw error;
  return data as ClientRow[];
}

export async function getClient(id: string): Promise<ClientRow | null> {
  await requireSession();
  const { data, error } = await getDb().from(TABLES.CLIENTS).select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data as ClientRow | null;
}

/** All bookings made with this email address, newest first. */
export async function bookingsForEmail(email: string): Promise<BookingRow[]> {
  await requireSession();
  const { data, error } = await getDb()
    .from(TABLES.BOOKED)
    .select('*')
    .ilike('email', email.replace(/[%_]/g, '\\$&'))
    .order('date_and_time', { ascending: false });
  if (error) throw error;
  return data as BookingRow[];
}

export async function listTestimonials(): Promise<TestimonialRow[]> {
  await requireSession();
  const { data, error } = await getDb()
    .from(TABLES.TESTIMONIALS)
    .select('id, name, text, rating, approved, created_at')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as TestimonialRow[];
}

export async function listContacts(): Promise<ContactRow[]> {
  await requireSession();
  const { data, error } = await getDb()
    .from(TABLES.CONTACT)
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1000);
  if (error) throw error;
  return data as ContactRow[];
}

export async function listNewsletter(): Promise<NewsletterRow[]> {
  await requireSession();
  const { data, error } = await getDb()
    .from(TABLES.NEWSLETTER)
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5000);
  if (error) throw error;
  return data as NewsletterRow[];
}

/** Counts for the dashboard. */
export async function dashboardCounts(): Promise<{ pendingReviews: number; newMessages: number }> {
  await requireSession();
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const [reviews, messages] = await Promise.all([
    getDb().from(TABLES.TESTIMONIALS).select('id', { count: 'exact', head: true }).eq('approved', false),
    getDb().from(TABLES.CONTACT).select('id', { count: 'exact', head: true }).gte('created_at', weekAgo),
  ]);
  return { pendingReviews: reviews.count ?? 0, newMessages: messages.count ?? 0 };
}

/** Group bookings by their Mountain-Time date, keeping order. */
export function groupByDay(rows: BookingRow[]): Array<{ date: string; rows: BookingRow[] }> {
  const groups: Array<{ date: string; rows: BookingRow[] }> = [];
  for (const row of rows) {
    const { date } = utcToMountain(row.date_and_time);
    const last = groups[groups.length - 1];
    if (last && last.date === date) last.rows.push(row);
    else groups.push({ date, rows: [row] });
  }
  return groups;
}

export interface FaqRow {
  id: string;
  question: string;
  answer: string;
  category: string | null;
  sort_order: number | null;
  is_visible: boolean;
}

export async function listAllFaqs(): Promise<FaqRow[]> {
  await requireSession();
  const { data, error } = await getDb()
    .from(TABLES.FAQS)
    .select('id, question, answer, category, sort_order, is_visible')
    .order('sort_order', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data as FaqRow[];
}

export interface TeamMember {
  id: string;
  email: string;
  name: string;
  has_password: boolean;
  created_at: string;
  last_login_at: string | null;
}

export async function listTeam(): Promise<TeamMember[]> {
  await requireSession();
  const { data, error } = await getDb()
    .from('admin_users')
    .select('id, email, name, password_hash, created_at, last_login_at')
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data ?? []).map(({ password_hash, ...m }) => ({ ...m, has_password: !!password_hash }));
}
