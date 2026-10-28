import Link from 'next/link';
import type { Metadata } from 'next';
import { getDb, TABLES, SERVICES, ADVISOR_SCHEDULES, type ServiceType, type ConsultantType } from '@/lib/db';
import { utcToMountain, formatDay, formatTime, addMinutes, todayMountain, addDays } from '@/lib/admin/time';
import ManageBooking from './ManageBooking';

export const metadata: Metadata = {
  title: 'Your appointment',
  robots: { index: false, follow: false },
};
export const dynamic = 'force-dynamic';

/** Hours from now until an ISO time (negative when past). Kept out of the component body. */
function hoursUntil(iso: string): number {
  return (new Date(iso).getTime() - Date.now()) / 3600_000;
}

function NotFound() {
  return (
    <section className="mx-auto max-w-xl px-5 py-20 text-center">
      <h1 className="font-serif text-3xl text-primary">We couldn&apos;t find that appointment</h1>
      <p className="mt-3 text-brown/80">
        It may already be cancelled, or the link is incomplete. If you need help, just{' '}
        <Link href="/contact" className="underline">send us a message</Link>.
      </p>
    </section>
  );
}

export default async function ManageBookingPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!/^[0-9a-f]{64}$/.test(token)) return <NotFound />;

  const { data: b } = await getDb()
    .from(TABLES.BOOKED)
    .select('date_and_time, duration, first_name, service_type, consultant')
    .eq('manage_token', token)
    .maybeSingle();
  if (!b) return <NotFound />;

  const { date, time } = utcToMountain(b.date_and_time);
  const hoursAway = hoursUntil(b.date_and_time);
  const isPast = hoursAway < 0;
  const canChange = hoursAway > 24;
  const serviceKnown = !!b.service_type && b.service_type in SERVICES && !!b.consultant;
  const workdays = b.consultant
    ? Object.entries(ADVISOR_SCHEDULES[b.consultant as ConsultantType] ?? {})
        .filter(([, h]) => h?.isActive)
        .map(([d]) => d.slice(0, 3))
        .join(', ')
    : '';

  return (
    <section className="mx-auto max-w-xl px-5 py-14 sm:py-20">
      <p className="text-sm uppercase tracking-[0.2em] text-brown/60">Your appointment</p>
      <h1 className="mt-2 font-serif text-3xl text-primary sm:text-4xl">
        {b.first_name ? `Hi ${b.first_name}` : 'Hello'}
      </h1>

      <div className="mt-6 rounded-xl border border-taupe bg-[#f0e9d2]/40 p-6">
        <p className="font-serif text-xl text-primary">{b.service_type}</p>
        <p className="mt-1 text-brown">with {b.consultant ?? 'our team'}</p>
        <p className="mt-4 text-lg text-brown">
          {formatDay(date)}
          <br />
          {formatTime(time)} – {formatTime(addMinutes(time, b.duration || SERVICES[b.service_type as ServiceType]?.duration || 60))} Mountain Time
        </p>
      </div>

      {isPast ? (
        <p className="mt-6 text-brown/80">This appointment has already happened. We hope to see you again soon.</p>
      ) : !canChange || !serviceKnown ? (
        <p className="mt-6 text-brown/80">
          Your appointment is coming up soon, so changes need a personal touch. Please reply to your confirmation email or{' '}
          <Link href="/contact" className="underline">send us a message</Link>.
        </p>
      ) : (
        <ManageBooking
          token={token}
          consultant={b.consultant!}
          workdays={workdays}
          minDate={addDays(todayMountain(), 1)}
        />
      )}
    </section>
  );
}
