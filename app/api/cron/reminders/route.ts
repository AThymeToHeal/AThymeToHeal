import { NextResponse } from 'next/server';
import { getDb, TABLES } from '@/lib/db';
import { sendReminder } from '@/lib/email';
import { mountainToUtcIso, todayMountain, addDays } from '@/lib/admin/time';

/**
 * Day-before reminder emails (vercel.json → crons, once a day in the morning Mountain Time).
 * Emails everyone booked for tomorrow who has an email address and hasn't been reminded,
 * then stamps reminder_sent_at so a re-run never double-sends.
 * Vercel Cron sends `Authorization: Bearer <CRON_SECRET>`; anything else gets 401.
 */

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const tomorrow = addDays(todayMountain(), 1);
  const { data: bookings, error } = await getDb()
    .from(TABLES.BOOKED)
    .select('id, date_and_time, first_name, last_name, email, phone, service_type, consultant, manage_token')
    .gte('date_and_time', mountainToUtcIso(tomorrow, '00:00'))
    .lt('date_and_time', mountainToUtcIso(addDays(tomorrow, 1), '00:00'))
    .is('reminder_sent_at', null)
    .not('email', 'is', null);
  if (error) {
    console.error(`[reminders] query failed: ${error.message}`);
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  let sent = 0;
  for (const b of bookings ?? []) {
    if (!b.email || !b.service_type || !b.consultant) continue; // blocked time, not a client
    const ok = await sendReminder({
      id: b.id,
      dateAndTime: b.date_and_time,
      firstName: b.first_name ?? '',
      lastName: b.last_name ?? '',
      email: b.email,
      phone: b.phone ?? undefined,
      serviceType: b.service_type,
      consultant: b.consultant,
      manageToken: b.manage_token,
    });
    if (ok) {
      sent++;
      await getDb().from(TABLES.BOOKED).update({ reminder_sent_at: new Date().toISOString() }).eq('id', b.id);
    }
  }

  return NextResponse.json({ ok: true, date: tomorrow, due: bookings?.length ?? 0, sent });
}
