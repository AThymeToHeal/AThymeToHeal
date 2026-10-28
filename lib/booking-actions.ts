'use server';

/**
 * Client self-service from the private link in their confirmation email (/booking/<token>).
 * The token IS the authorisation: 244 random bits, unique per booking, never shown on the site.
 * Changes are allowed until 24 hours before the appointment; after that they reply by email.
 */

import { getDb, TABLES, getAvailabilityForBothAdvisors, SERVICES, type ConsultantType, type ServiceType } from '@/lib/db';
import { invalidateServerCache } from '@/lib/serverCache';
import { sendCancelled, sendRescheduled, type BookingEmailData } from '@/lib/email';
import { mountainToUtcIso, todayMountain } from '@/lib/admin/time';

const TOKEN_RE = /^[0-9a-f]{64}$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
const CHANGE_CUTOFF_HOURS = 24;

export type ManageState = { error?: string; done?: 'cancelled' | 'rescheduled'; newTime?: string };

async function load(token: string) {
  if (!TOKEN_RE.test(token)) return null;
  const { data, error } = await getDb()
    .from(TABLES.BOOKED)
    .select('id, date_and_time, first_name, last_name, email, phone, service_type, consultant, manage_token')
    .eq('manage_token', token)
    .maybeSingle();
  if (error) throw error;
  return data;
}

function changeable(dateAndTime: string): boolean {
  return new Date(dateAndTime).getTime() - Date.now() > CHANGE_CUTOFF_HOURS * 3600_000;
}

function emailData(b: NonNullable<Awaited<ReturnType<typeof load>>>, dateAndTime = b.date_and_time): BookingEmailData {
  return {
    id: b.id,
    dateAndTime,
    firstName: b.first_name ?? '',
    lastName: b.last_name ?? '',
    email: b.email ?? '',
    phone: b.phone ?? undefined,
    serviceType: b.service_type ?? '',
    consultant: b.consultant ?? '',
    manageToken: b.manage_token,
  };
}

function clearAvailabilityCache() {
  invalidateServerCache('bookings_');
  invalidateServerCache('fullybooked_');
}

/** Open start times on a date for the same advisor and service, ignoring the booking being moved. */
export async function getSlotsAction(token: string, date: string): Promise<{ slots: Array<{ time: string; iso: string }>; error?: string }> {
  const b = await load(token);
  if (!b || !b.consultant || !(b.service_type && b.service_type in SERVICES)) return { slots: [], error: 'This booking can no longer be changed online.' };
  if (!DATE_RE.test(date) || date <= todayMountain()) return { slots: [] };

  const result = await getAvailabilityForBothAdvisors(date, b.consultant as ConsultantType, b.service_type as ServiceType, b.id);
  if (result.bookingDataUnavailable) return { slots: [], error: "We couldn't check the schedule just now. Please try again in a minute." };
  return {
    slots: result.selectedAdvisorSlots
      .filter((s) => s.available)
      .map((s) => ({ time: s.start, iso: mountainToUtcIso(date, s.start) }))
      .filter((s) => changeable(s.iso)),
  };
}

export async function rescheduleAction(token: string, _prev: ManageState, form: FormData): Promise<ManageState> {
  const b = await load(token);
  if (!b) return { error: 'This booking was not found. It may have been cancelled.' };
  if (!changeable(b.date_and_time)) return { error: 'Your appointment is less than 24 hours away, so please reply to your confirmation email to change it.' };

  const date = String(form.get('date') ?? '');
  const time = String(form.get('time') ?? '');
  if (!DATE_RE.test(date) || !TIME_RE.test(time)) return { error: 'Choose a day and a time.' };

  // Re-check on the server: the slot must still be open right now
  const { slots, error } = await getSlotsAction(token, date);
  if (error) return { error };
  const slot = slots.find((s) => s.time === time);
  if (!slot) return { error: 'That time was just taken. Please pick another.' };

  const previous = b.date_and_time;
  const { error: upd } = await getDb()
    .from(TABLES.BOOKED)
    .update({ date_and_time: slot.iso, reminder_sent_at: null })
    .eq('id', b.id);
  if (upd) throw upd;
  clearAvailabilityCache();

  if (b.email) await sendRescheduled(emailData(b, slot.iso), previous);
  return { done: 'rescheduled', newTime: slot.iso };
}

export async function cancelAction(token: string, _prev: ManageState, _form: FormData): Promise<ManageState> {
  void _form;
  const b = await load(token);
  if (!b) return { error: 'This booking was not found. It may already be cancelled.' };
  if (!changeable(b.date_and_time)) return { error: 'Your appointment is less than 24 hours away, so please reply to your confirmation email to cancel.' };

  const { error } = await getDb().from(TABLES.BOOKED).delete().eq('id', b.id);
  if (error) throw error;
  clearAvailabilityCache();

  if (b.email) await sendCancelled(emailData(b));
  return { done: 'cancelled' };
}
