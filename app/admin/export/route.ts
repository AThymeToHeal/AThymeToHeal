import { requireSession } from '@/lib/admin/session';
import { listClients, listContacts, listNewsletter, listBookings } from '@/lib/admin/queries';
import { utcToMountain, todayMountain, addDays } from '@/lib/admin/time';

export const dynamic = 'force-dynamic';

/** Spreadsheet-safe CSV cell: quoted, and formula-looking values neutralised. */
function cell(v: unknown): string {
  let s = v === null || v === undefined ? '' : String(v);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
}

function csv(header: string[], rows: unknown[][]): string {
  return [header, ...rows].map((r) => r.map(cell).join(',')).join('\r\n');
}

export async function GET(request: Request) {
  try {
    await requireSession();
  } catch {
    return new Response('Not signed in', { status: 401 });
  }

  const kind = new URL(request.url).searchParams.get('kind');
  let body: string;

  if (kind === 'clients') {
    const rows = await listClients();
    body = csv(
      ['First name', 'Last name', 'Email', 'Phone', 'Prefers', 'Health goals', 'Health conditions', 'Medications', 'Dietary restrictions', 'Added'],
      rows.map((c) => [c.first_name, c.last_name, c.email, c.phone, c.preferred_contact_method, c.health_goals, c.health_conditions, c.current_medications, c.dietary_restrictions, c.created_at.slice(0, 10)])
    );
  } else if (kind === 'contacts') {
    const rows = await listContacts();
    body = csv(
      ['Received', 'First name', 'Last name', 'Email', 'Phone', 'Subject', 'Message'],
      rows.map((c) => [c.created_at.slice(0, 10), c.first_name, c.last_name, c.email, c.phone, c.subject, c.message])
    );
  } else if (kind === 'newsletter') {
    const rows = await listNewsletter();
    body = csv(['Email', 'Name', 'Status', 'Source', 'Signed up'], rows.map((s) => [s.email, s.name, s.status, s.source, s.created_at.slice(0, 10)]));
  } else if (kind === 'bookings') {
    const today = todayMountain();
    const rows = await listBookings(addDays(today, -365), addDays(today, 365));
    body = csv(
      ['Date', 'Time (MT)', 'Minutes', 'With', 'Service', 'First name', 'Last name', 'Email', 'Phone', 'Price', 'Notes'],
      rows.map((b) => {
        const { date, time } = utcToMountain(b.date_and_time);
        return [date, time, b.duration, b.consultant ?? 'Both', b.service_type, b.first_name, b.last_name, b.email, b.phone, b.price, b.notes];
      })
    );
  } else {
    return new Response('Unknown export', { status: 400 });
  }

  return new Response('﻿' + body, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="athymetoheal-${kind}-${todayMountain()}.csv"`,
      'Cache-Control': 'no-store',
    },
  });
}
