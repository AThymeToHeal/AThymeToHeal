import { safeEqual } from '@/lib/auth';
import { feedKey } from '@/lib/calendar';
import { getDb, TABLES } from '@/lib/db';
import { mountainToUtcIso, todayMountain, addDays } from '@/lib/admin/time';

/**
 * Private calendar feed (.ics) that Google, Apple or Outlook calendar subscribes to.
 * GET /api/calendar?who=all|heidi|illiana&key=<derived from SESSION_SECRET>
 *
 * Calendar apps can't sign in, so the key in the URL is the password. It is derived
 * from SESSION_SECRET, so changing that secret revokes every feed link at once.
 * Deliberately leaves out health information; only name, service, phone and notes.
 */

export const dynamic = 'force-dynamic';

const WHO: Record<string, string | null> = { all: null, heidi: 'Heidi Lynn', illiana: 'Illiana' };
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://athymetoheal.org').replace(/\/$/, '');

/** Escape text per RFC 5545 and fold lines at 75 octets. */
function text(v: string): string {
  return v.replace(/\\/g, '\\\\').replace(/;/g, '\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
}
function fold(line: string): string {
  const out: string[] = [];
  let rest = line;
  while (new TextEncoder().encode(rest).length > 75) {
    let cut = 75;
    while (new TextEncoder().encode(rest.slice(0, cut)).length > 75) cut--;
    out.push(rest.slice(0, cut));
    rest = ' ' + rest.slice(cut);
  }
  out.push(rest);
  return out.join('\r\n');
}
const stamp = (iso: string) => iso.replace(/[-:]/g, '').replace(/\.\d{3}/, '');

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const who = params.get('who') ?? 'all';
  const key = params.get('key') ?? '';
  const expected = who in WHO ? await feedKey(who) : null;
  if (!expected || !safeEqual(key, expected)) return new Response('Not found', { status: 404 });

  const consultant = WHO[who];
  const today = todayMountain();
  const from = mountainToUtcIso(addDays(today, -30), '00:00');
  const to = mountainToUtcIso(addDays(today, 365), '00:00');

  let bookingsQ = getDb()
    .from(TABLES.BOOKED)
    .select('id, date_and_time, duration, first_name, last_name, phone, email, service_type, consultant, notes, created_at')
    .gte('date_and_time', from)
    .lt('date_and_time', to);
  if (consultant) bookingsQ = bookingsQ.or(`consultant.eq.${consultant},consultant.is.null`);

  let offQ = getDb()
    .from(TABLES.ADVISOR_DAYS_OFF)
    .select('id, date, consultant, all_day, start_time, end_time, reason')
    .gte('date', addDays(today, -30));
  if (consultant) offQ = offQ.eq('consultant', consultant);

  const [{ data: bookings, error: e1 }, { data: off, error: e2 }] = await Promise.all([bookingsQ, offQ]);
  if (e1 || e2) return new Response('Calendar temporarily unavailable', { status: 503 });

  const now = stamp(new Date().toISOString());
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//A Thyme to Heal//Bookings//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${text(consultant ? `A Thyme to Heal: ${consultant}` : 'A Thyme to Heal')}`,
    'X-WR-TIMEZONE:America/Denver',
    'REFRESH-INTERVAL;VALUE=DURATION:PT30M',
    'X-PUBLISHED-TTL:PT30M',
  ];

  for (const b of bookings ?? []) {
    const start = new Date(b.date_and_time);
    const end = new Date(start.getTime() + (b.duration || 30) * 60_000);
    const name = [b.first_name, b.last_name].filter(Boolean).join(' ') || 'Blocked time';
    const who = consultant ? '' : ` (${b.consultant ?? 'both'})`;
    const details = [
      b.service_type && `Service: ${b.service_type}`,
      b.phone && `Phone: ${b.phone}`,
      b.email && `Email: ${b.email}`,
      b.notes && `Notes: ${b.notes}`,
      `${SITE_URL}/admin/schedule/${b.id}`,
    ].filter(Boolean);
    lines.push(
      'BEGIN:VEVENT',
      `UID:${b.id}@athymetoheal.org`,
      `DTSTAMP:${now}`,
      `DTSTART:${stamp(start.toISOString())}`,
      `DTEND:${stamp(end.toISOString())}`,
      `SUMMARY:${text(`${name}${b.service_type ? `: ${b.service_type}` : ''}${who}`)}`,
      `DESCRIPTION:${text(details.join('\n'))}`,
      `URL:${SITE_URL}/admin/schedule/${b.id}`,
      'END:VEVENT'
    );
  }

  for (const d of off ?? []) {
    const summary = text(`${d.consultant} off${d.reason ? `: ${d.reason}` : ''}`);
    if (d.all_day || !d.start_time || !d.end_time) {
      lines.push(
        'BEGIN:VEVENT',
        `UID:off-${d.id}@athymetoheal.org`,
        `DTSTAMP:${now}`,
        `DTSTART;VALUE=DATE:${d.date.replace(/-/g, '')}`,
        `DTEND;VALUE=DATE:${addDays(d.date, 1).replace(/-/g, '')}`,
        `SUMMARY:${summary}`,
        'TRANSP:TRANSPARENT',
        'END:VEVENT'
      );
    } else {
      lines.push(
        'BEGIN:VEVENT',
        `UID:off-${d.id}@athymetoheal.org`,
        `DTSTAMP:${now}`,
        `DTSTART:${stamp(mountainToUtcIso(d.date, d.start_time))}`,
        `DTEND:${stamp(mountainToUtcIso(d.date, d.end_time))}`,
        `SUMMARY:${summary}`,
        'END:VEVENT'
      );
    }
  }

  lines.push('END:VCALENDAR');
  return new Response(lines.map(fold).join('\r\n') + '\r\n', {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': 'inline; filename="athymetoheal.ics"',
      'Cache-Control': 'private, no-store',
      'X-Robots-Tag': 'noindex',
    },
  });
}
