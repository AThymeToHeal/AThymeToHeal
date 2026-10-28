import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getBooking, listClients } from '@/lib/admin/queries';
import { deleteBookingAction } from '@/lib/admin/actions';
import { utcToMountain, formatDay, formatTime, addMinutes, formatStamp } from '@/lib/admin/time';
import BookingForm from '../../../_components/BookingForm';
import { ConfirmButton } from '../../../_components/client';
import CopyField from '../../../_components/CopyField';
import { manageUrl } from '@/lib/email';
import { BackLink, Card, CardTitle, ConsultantBadge, Detail, Notice, btnDanger, btnSecondary, Svg, Icon } from '../../../_components/ui';

export const metadata = { title: 'Appointment' };

export default async function AppointmentPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const { id } = await params;
  const { saved } = await searchParams;
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const b = await getBooking(id);
  if (!b) notFound();

  const { date, time } = utcToMountain(b.date_and_time);
  const name = [b.first_name, b.last_name].filter(Boolean).join(' ') || 'Blocked time';
  const client = b.email ? (await listClients(b.email)).find((c) => c.email?.toLowerCase() === b.email?.toLowerCase()) : undefined;
  const staffAdded = !!b.user_local_time?.startsWith('Added by');

  return (
    <>
      <BackLink href="/admin/schedule">Schedule</BackLink>
      {saved && <Notice>Saved. The website&apos;s booking form already reflects it.</Notice>}

      <div className="mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-serif text-3xl text-[#023020] sm:text-4xl">{name}</h1>
          <ConsultantBadge name={b.consultant} />
        </div>
        <p className="mt-2 text-lg text-[#2a2319]/80">
          {formatDay(date)}, {formatTime(time)} – {formatTime(addMinutes(time, b.duration || 30))}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {b.phone && (
            <a href={`tel:${b.phone.replace(/[^\d+]/g, '')}`} className={btnSecondary}>
              <Svg icon={Icon.phone} className="h-4 w-4" />
              Call {b.phone}
            </a>
          )}
          {b.email && (
            <a href={`mailto:${b.email}`} className={btnSecondary}>
              <Svg icon={Icon.mail} className="h-4 w-4" />
              Email
            </a>
          )}
          {client && (
            <Link href={`/admin/clients/${client.id}`} className={btnSecondary}>
              <Svg icon={Icon.people} className="h-4 w-4" />
              Client record
            </Link>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.3fr]">
        <Card className="self-start">
          <CardTitle>Details</CardTitle>
          <dl className="divide-y divide-[#2a2319]/10 px-5">
            <Detail term="Service">{b.service_type}</Detail>
            <Detail term="Price">{b.price != null ? (Number(b.price) === 0 ? 'Free' : `$${Number(b.price)}`) : null}</Detail>
            <Detail term="Email">{b.email}</Detail>
            <Detail term="Phone">{b.phone}</Detail>
            <Detail term="Their local time">{staffAdded ? null : b.user_local_time}</Detail>
            <Detail term="Notes">{b.notes}</Detail>
            <Detail term="Reminder">{b.reminder_sent_at ? `Emailed ${formatStamp(b.reminder_sent_at)}` : b.email ? 'Emails the day before' : null}</Detail>
            <Detail term="Booked">{`${formatStamp(b.created_at)}${staffAdded ? ` (${b.user_local_time!.replace("Added by", "added by")})` : ' online'}`}</Detail>
          </dl>
          {b.manage_token && b.email && (
            <div className="border-t border-[#2a2319]/10 px-5 py-4">
              <p className="mb-2 text-sm text-[#2a2319]/65">Their private link to reschedule or cancel (it&apos;s in their emails too):</p>
              <CopyField value={manageUrl(b.manage_token)} label="Client's reschedule link" />
            </div>
          )}
          <div className="border-t border-[#2a2319]/10 px-5 py-4">
            <form action={deleteBookingAction}>
              <input type="hidden" name="id" value={b.id} />
              <ConfirmButton
                className={btnDanger}
                message={`Cancel ${name}'s appointment on ${formatDay(date)}? This frees the time on the website. It does not email them.`}
              >
                Cancel appointment
              </ConfirmButton>
            </form>
          </div>
        </Card>

        <Card>
          <CardTitle>Change it</CardTitle>
          <div className="p-5">
            <BookingForm
              initial={{
                id: b.id,
                firstName: b.first_name ?? '',
                lastName: b.last_name ?? '',
                email: b.email ?? '',
                phone: b.phone ?? '',
                serviceType: b.service_type ?? 'Health Consult',
                consultant: b.consultant ?? 'Illiana',
                date,
                time,
                duration: b.duration || 30,
                notes: b.notes ?? '',
              }}
            />
          </div>
        </Card>
      </div>
    </>
  );
}
