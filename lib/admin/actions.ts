'use server';

/**
 * Server actions for /admin: sign in/out and every change the owner can make.
 *
 * Every action except loginAction starts with `await requireSession()`. Server
 * actions are public POST endpoints; the middleware gate does not protect them.
 * Never remove that call, and start every new action with it.
 *
 * Messages RETURNED as { error } / { warning } reach the owner verbatim, so they
 * are written for her. Thrown errors land on app/admin/error.tsx.
 */

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { SESSION_COOKIE_NAME } from '@/lib/auth';
import { getDb, TABLES, SERVICES, BOOKING_LIMITS, type ServiceType } from '@/lib/db';
import { invalidateServerCache } from '@/lib/serverCache';
import { requireSession } from './session';
import { sendBookingConfirmation } from '@/lib/email';
import { mountainToUtcIso, utcToMountain, addDays } from './time';

export type FormState = {
  error?: string;
  warning?: string;
  ok?: string;
  /** What she typed, echoed back on error/warning so the form can refill itself (React resets forms after submit). */
  values?: Record<string, string>;
  /** Changes on every response, so forms can remount with the echoed values. */
  at?: number;
  /** A one-time sign-in link to show with a Copy button (team invites). */
  link?: string;
};

const CONSULTANTS = ['Heidi Lynn', 'Illiana'] as const;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function str(form: FormData, key: string): string {
  const v = form.get(key);
  return typeof v === 'string' ? v.trim() : '';
}

/** Return a message and echo the submitted fields back to the form. */
function reply(form: FormData, state: Omit<FormState, 'values' | 'at'>): FormState {
  const values: Record<string, string> = {};
  form.forEach((v, k) => {
    if (typeof v === 'string' && !k.startsWith('$ACTION')) values[k] = v;
  });
  return { ...state, values, at: Date.now() };
}

function orNull(v: string): string | null {
  return v === '' ? null : v;
}

/** Booking availability on the public site is cached in memory; clear it after edits. */
function afterScheduleChange() {
  invalidateServerCache('bookings_');
  invalidateServerCache('fullybooked_');
  invalidateServerCache('daysoff_');
  revalidatePath('/admin', 'layout');
}

function toMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

// ─── Auth (sign-in, invites and resets live in team-actions.ts) ─────────────

export async function logoutAction(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE_NAME);
  redirect('/admin/login');
}

// ─── Appointments ───────────────────────────────────────────────────────────

/**
 * Create (no id) or update (id) an appointment entered by the owner.
 * Warns about overlaps and the daily limit, and saves anyway once she ticks "book it anyway".
 */
export async function saveBookingAction(_prev: FormState, form: FormData): Promise<FormState> {
  const me = await requireSession();

  const id = str(form, 'id');
  const firstName = str(form, 'firstName');
  const lastName = str(form, 'lastName');
  const email = str(form, 'email');
  const phone = str(form, 'phone');
  const serviceType = str(form, 'serviceType');
  const consultant = str(form, 'consultant');
  const date = str(form, 'date');
  const time = str(form, 'time');
  const duration = Number(str(form, 'duration'));
  const notes = str(form, 'notes');
  const override = form.get('override') != null;

  if (!firstName) return reply(form, { error: "Add the client's first name." });
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return reply(form, { error: "That email address doesn't look right." });
  if (!(serviceType in SERVICES)) return reply(form, { error: 'Choose a service.' });
  if (!CONSULTANTS.includes(consultant as (typeof CONSULTANTS)[number])) return reply(form, { error: 'Choose who the appointment is with.' });
  if (!DATE_RE.test(date)) return reply(form, { error: 'Choose a date.' });
  if (!TIME_RE.test(time)) return reply(form, { error: 'Choose a start time.' });
  if (!Number.isFinite(duration) || duration < 15 || duration > 480) return reply(form, { error: 'Choose how long it lasts.' });

  const dateAndTime = mountainToUtcIso(date, time);

  if (!override) {
    // Same rules the booking form uses: overlap including the 30-minute buffer, and the daily limit
    const { data: sameDay, error } = await getDb()
      .from(TABLES.BOOKED)
      .select('id, date_and_time, duration, consultant, service_type, first_name, last_name')
      .gte('date_and_time', mountainToUtcIso(date, '00:00'))
      .lt('date_and_time', mountainToUtcIso(addDays(date, 1), '00:00'))
      .or(`consultant.eq.${consultant},consultant.is.null`);
    if (error) throw error;

    const others = (sameDay ?? []).filter((b) => b.id !== id);
    const start = toMinutes(time);
    const end = start + duration;
    const clash = others.find((b) => {
      const bStart = toMinutes(utcToMountain(b.date_and_time).time);
      const bEnd = bStart + (b.duration || 30);
      return start < bEnd + BOOKING_LIMITS.BUFFER_MINUTES && bStart < end + BOOKING_LIMITS.BUFFER_MINUTES;
    });
    if (clash) {
      const who = [clash.first_name, clash.last_name].filter(Boolean).join(' ') || 'blocked time';
      return reply(form, {
        warning: `This overlaps with ${who} (including the 30-minute buffer between appointments). Tick "Book it anyway" to save it regardless.`,
      });
    }

    const isBusiness = serviceType === 'Business Consultation';
    const count = others.filter((b) =>
      isBusiness ? b.service_type === 'Business Consultation' : b.service_type !== 'Business Consultation'
    ).length;
    const limit = isBusiness ? BOOKING_LIMITS.MAX_BUSINESS_BOOKINGS_PER_DAY : BOOKING_LIMITS.MAX_CLIENT_BOOKINGS_PER_DAY;
    if (count >= limit) {
      return reply(form, {
        warning: `${consultant} already has ${count} appointments that day (the website stops at ${limit}). Tick "Book it anyway" to save it regardless.`,
      });
    }
  }

  const row = {
    date_and_time: dateAndTime,
    first_name: firstName,
    last_name: orNull(lastName),
    email: orNull(email),
    phone: orNull(phone),
    service_type: serviceType,
    consultant,
    duration,
    price: SERVICES[serviceType as ServiceType].price,
    notes: orNull(notes),
  };

  let savedId = id;
  if (id) {
    const { error } = await getDb().from(TABLES.BOOKED).update(row).eq('id', id);
    if (error) throw error;
  } else {
    const { data, error } = await getDb()
      .from(TABLES.BOOKED)
      .insert({ ...row, booking_type: 'Initial Consultation', user_timezone: 'America/Denver', user_local_time: `Added by ${me.name}` })
      .select('id, manage_token')
      .single();
    if (error) throw error;
    savedId = data.id;
    if (email && form.get('sendConfirmation') != null) {
      await sendBookingConfirmation({
        id: data.id,
        dateAndTime,
        firstName,
        lastName,
        email,
        phone,
        serviceType,
        consultant,
        manageToken: data.manage_token,
      });
    }
  }

  afterScheduleChange();
  redirect(`/admin/schedule/${savedId}?saved=1`);
}

export async function deleteBookingAction(form: FormData): Promise<void> {
  await requireSession();
  const id = str(form, 'id');
  if (!id) throw new Error('Missing appointment.');
  const { error } = await getDb().from(TABLES.BOOKED).delete().eq('id', id);
  if (error) throw error;
  afterScheduleChange();
  redirect('/admin/schedule?cancelled=1');
}

// ─── Time off ───────────────────────────────────────────────────────────────

/** Adds one row per day from start to end date, for one or both advisors. */
export async function addTimeOffAction(_prev: FormState, form: FormData): Promise<FormState> {
  await requireSession();

  const who = str(form, 'consultant');
  const startDate = str(form, 'startDate');
  const endDate = str(form, 'endDate') || startDate;
  const allDay = str(form, 'allDay') !== 'hours';
  const startTime = str(form, 'startTime');
  const endTime = str(form, 'endTime');
  const reason = str(form, 'reason');

  const consultants = who === 'both' ? [...CONSULTANTS] : CONSULTANTS.filter((c) => c === who);
  if (consultants.length === 0) return reply(form, { error: 'Choose who is off.' });
  if (!DATE_RE.test(startDate)) return reply(form, { error: 'Choose the first day off.' });
  if (!DATE_RE.test(endDate) || endDate < startDate) return reply(form, { error: 'The last day must be on or after the first day.' });
  if (!allDay) {
    if (!TIME_RE.test(startTime) || !TIME_RE.test(endTime)) return reply(form, { error: 'Choose the hours you are off.' });
    if (endTime <= startTime) return reply(form, { error: 'The end time must be after the start time.' });
  }

  const days: string[] = [];
  for (let d = startDate; d <= endDate; d = addDays(d, 1)) {
    days.push(d);
    if (days.length > 120) return reply(form, { error: 'That is more than 120 days. Please add it in smaller pieces.' });
  }

  const rows = days.flatMap((date) =>
    consultants.map((consultant) => ({
      date,
      consultant,
      all_day: allDay,
      start_time: allDay ? null : startTime,
      end_time: allDay ? null : endTime,
      reason: orNull(reason),
    }))
  );
  const { error } = await getDb().from(TABLES.ADVISOR_DAYS_OFF).insert(rows);
  if (error) throw error;

  afterScheduleChange();
  const span = days.length === 1 ? '1 day' : `${days.length} days`;
  return { at: Date.now(), ok: `Saved. The booking form now hides ${span} for ${consultants.join(' and ')}.` };
}

export async function deleteTimeOffAction(form: FormData): Promise<void> {
  await requireSession();
  const ids = str(form, 'ids').split(',').filter(Boolean);
  if (ids.length === 0) throw new Error('Missing time off.');
  const { error } = await getDb().from(TABLES.ADVISOR_DAYS_OFF).delete().in('id', ids);
  if (error) throw error;
  afterScheduleChange();
}

// ─── Reviews ────────────────────────────────────────────────────────────────

export async function setReviewApprovedAction(form: FormData): Promise<void> {
  await requireSession();
  const id = str(form, 'id');
  const approved = str(form, 'approved') === 'true';
  const { error } = await getDb().from(TABLES.TESTIMONIALS).update({ approved }).eq('id', id);
  if (error) throw error;
  revalidatePath('/admin', 'layout');
}

export async function saveReviewAction(_prev: FormState, form: FormData): Promise<FormState> {
  await requireSession();
  const id = str(form, 'id');
  const name = str(form, 'name');
  const text = str(form, 'text');
  const ratingRaw = str(form, 'rating');
  const rating = ratingRaw ? Number(ratingRaw) : null;
  const approved = form.get('approved') != null;

  if (!name) return reply(form, { error: 'Add the name to show with the review.' });
  if (!text) return reply(form, { error: 'Add the review text.' });
  if (text.length > 2000) return reply(form, { error: 'Reviews can be up to 2,000 characters.' });
  if (rating !== null && !(rating >= 1 && rating <= 5)) return reply(form, { error: 'Rating must be 1 to 5 stars.' });

  const row = { name, text, rating, approved };
  const { error } = id
    ? await getDb().from(TABLES.TESTIMONIALS).update(row).eq('id', id)
    : await getDb().from(TABLES.TESTIMONIALS).insert(row);
  if (error) throw error;

  revalidatePath('/admin', 'layout');
  return reply(form, { ok: id ? 'Review updated.' : approved ? 'Review added and live on the site.' : 'Review added. It is hidden until you approve it.' });
}

export async function deleteReviewAction(form: FormData): Promise<void> {
  await requireSession();
  const { error } = await getDb().from(TABLES.TESTIMONIALS).delete().eq('id', str(form, 'id'));
  if (error) throw error;
  revalidatePath('/admin', 'layout');
}

// ─── Clients ────────────────────────────────────────────────────────────────

export async function saveClientAction(_prev: FormState, form: FormData): Promise<FormState> {
  await requireSession();
  const id = str(form, 'id');
  const email = str(form, 'email');
  if (!str(form, 'firstName')) return reply(form, { error: 'Add a first name.' });
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return reply(form, { error: "That email address doesn't look right." });

  const row = {
    first_name: str(form, 'firstName'),
    last_name: orNull(str(form, 'lastName')),
    email: orNull(email),
    phone: orNull(str(form, 'phone')),
    preferred_contact_method: orNull(str(form, 'preferredContactMethod')),
    health_goals: orNull(str(form, 'healthGoals')),
    dietary_restrictions: orNull(str(form, 'dietaryRestrictions')),
    current_medications: orNull(str(form, 'currentMedications')),
    health_conditions: orNull(str(form, 'healthConditions')),
    updated_at: new Date().toISOString(),
  };

  if (id) {
    const { error } = await getDb().from(TABLES.CLIENTS).update(row).eq('id', id);
    if (error) throw error;
    revalidatePath('/admin', 'layout');
    return reply(form, { ok: 'Saved.' });
  }
  const { data, error } = await getDb().from(TABLES.CLIENTS).insert(row).select('id').single();
  if (error) throw error;
  revalidatePath('/admin', 'layout');
  redirect(`/admin/clients/${data.id}`);
}

export async function deleteClientAction(form: FormData): Promise<void> {
  await requireSession();
  const { error } = await getDb().from(TABLES.CLIENTS).delete().eq('id', str(form, 'id'));
  if (error) throw error;
  revalidatePath('/admin', 'layout');
  redirect('/admin/clients?deleted=1');
}

// ─── Messages & newsletter ──────────────────────────────────────────────────

export async function deleteContactAction(form: FormData): Promise<void> {
  await requireSession();
  const { error } = await getDb().from(TABLES.CONTACT).delete().eq('id', str(form, 'id'));
  if (error) throw error;
  revalidatePath('/admin', 'layout');
}

export async function setSubscriberStatusAction(form: FormData): Promise<void> {
  await requireSession();
  const status = str(form, 'status') === 'Unsubscribed' ? 'Unsubscribed' : 'Active';
  const { error } = await getDb().from(TABLES.NEWSLETTER).update({ status }).eq('id', str(form, 'id'));
  if (error) throw error;
  revalidatePath('/admin', 'layout');
}

// ─── FAQs ───────────────────────────────────────────────────────────────────

function afterFaqChange() {
  revalidatePath('/faq');
  revalidatePath('/admin/faqs');
}

export async function saveFaqAction(_prev: FormState, form: FormData): Promise<FormState> {
  await requireSession();
  const id = str(form, 'id');
  const question = str(form, 'question');
  const answer = str(form, 'answer');
  const category = str(form, 'category');
  const isVisible = form.get('isVisible') != null;

  if (!question) return reply(form, { error: 'Add the question.' });
  if (!answer) return reply(form, { error: 'Add the answer.' });
  if (question.length > 300 || answer.length > 4000) return reply(form, { error: 'That is longer than an FAQ should be. Try trimming it.' });

  const row = { question, answer, category: orNull(category), is_visible: isVisible };
  if (id) {
    const { error } = await getDb().from(TABLES.FAQS).update(row).eq('id', id);
    if (error) throw error;
    afterFaqChange();
    return reply(form, { ok: isVisible ? 'Saved. The FAQ page shows it now.' : 'Saved. It is hidden from the FAQ page.' });
  }
  // New questions go to the end of the list
  const { data: last } = await getDb().from(TABLES.FAQS).select('sort_order').order('sort_order', { ascending: false, nullsFirst: false }).limit(1);
  const { error } = await getDb().from(TABLES.FAQS).insert({ ...row, sort_order: (last?.[0]?.sort_order ?? 0) + 1 });
  if (error) throw error;
  afterFaqChange();
  return { ok: isVisible ? 'Added to the FAQ page.' : 'Added, hidden for now.', at: Date.now() };
}

/** Swap with the neighbour above or below. */
export async function moveFaqAction(form: FormData): Promise<void> {
  await requireSession();
  const id = str(form, 'id');
  const direction = str(form, 'direction');
  const { data: all, error } = await getDb()
    .from(TABLES.FAQS)
    .select('id, sort_order')
    .order('sort_order', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: true });
  if (error) throw error;
  const list = all ?? [];
  const i = list.findIndex((f) => f.id === id);
  const j = direction === 'up' ? i - 1 : i + 1;
  if (i < 0 || j < 0 || j >= list.length) return;
  [list[i], list[j]] = [list[j], list[i]];
  // Renumber everything so gaps and nulls from older data never cause ties
  await Promise.all(
    list.map((f, n) => (f.sort_order === n + 1 ? null : getDb().from(TABLES.FAQS).update({ sort_order: n + 1 }).eq('id', f.id)))
  );
  afterFaqChange();
}

export async function deleteFaqAction(form: FormData): Promise<void> {
  await requireSession();
  const { error } = await getDb().from(TABLES.FAQS).delete().eq('id', str(form, 'id'));
  if (error) throw error;
  afterFaqChange();
}
