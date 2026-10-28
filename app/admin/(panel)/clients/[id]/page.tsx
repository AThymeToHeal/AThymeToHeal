import { notFound } from 'next/navigation';
import { getClient, bookingsForEmail } from '@/lib/admin/queries';
import { deleteClientAction } from '@/lib/admin/actions';
import { formatStamp } from '@/lib/admin/time';
import ClientForm from '../../../_components/ClientForm';
import { AppointmentRow } from '../../../_components/AppointmentList';
import { ConfirmButton } from '../../../_components/client';
import { BackLink, Card, CardTitle, EmptyState, btnDanger, btnSecondary, Svg, Icon } from '../../../_components/ui';

export const metadata = { title: 'Client' };

export default async function ClientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const client = await getClient(id);
  if (!client) notFound();

  const name = [client.first_name, client.last_name].filter(Boolean).join(' ') || 'No name';
  const history = client.email ? await bookingsForEmail(client.email) : [];

  return (
    <>
      <BackLink href="/admin/clients">Clients</BackLink>
      <div className="mb-6">
        <h1 className="font-serif text-3xl text-[#023020] sm:text-4xl">{name}</h1>
        <p className="mt-1.5 text-sm text-[#2a2319]/60">
          Client since {formatStamp(client.created_at).split(' at ')[0]}
          {client.consent ? ' · Agreed to the privacy policy' : ''}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {client.phone && (
            <a href={`tel:${client.phone.replace(/[^\d+]/g, '')}`} className={btnSecondary}>
              <Svg icon={Icon.phone} className="h-4 w-4" />
              Call
            </a>
          )}
          {client.email && (
            <a href={`mailto:${client.email}`} className={btnSecondary}>
              <Svg icon={Icon.mail} className="h-4 w-4" />
              Email
            </a>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <Card>
          <CardTitle>Details and intake answers</CardTitle>
          <div className="p-5">
            <ClientForm client={client} />
          </div>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardTitle>Appointments</CardTitle>
            {history.length ? (
              <ul className="divide-y divide-[#2a2319]/10">
                {history.map((b) => (
                  <AppointmentRow key={b.id} b={b} showDate />
                ))}
              </ul>
            ) : (
              <EmptyState title="No appointments found">
                {client.email ? 'None booked with this email address.' : 'Add an email to match their bookings.'}
              </EmptyState>
            )}
          </Card>

          <Card className="p-5">
            <p className="mb-3 text-sm text-[#2a2319]/65">
              If a client asks you to remove their information, delete their record here. Their past appointments stay on the schedule.
            </p>
            <form action={deleteClientAction}>
              <input type="hidden" name="id" value={client.id} />
              <ConfirmButton className={btnDanger} message={`Delete ${name}'s client record and intake answers? This can't be undone.`}>
                Delete client record
              </ConfirmButton>
            </form>
          </Card>
        </div>
      </div>
    </>
  );
}
