import BookingForm from '../../../_components/BookingForm';
import { BackLink, Card, PageHeader } from '../../../_components/ui';
import { todayMountain } from '@/lib/admin/time';

export const metadata = { title: 'Add appointment' };

export default async function NewAppointmentPage({ searchParams }: { searchParams: Promise<{ date?: string }> }) {
  const { date } = await searchParams;
  return (
    <>
      <BackLink href="/admin/schedule">Schedule</BackLink>
      <PageHeader title="Add appointment" subtitle="For bookings made by phone, text or in person. It blocks that time on the website straight away." />
      <Card className="p-5 sm:p-7">
        <BookingForm
          initial={{
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            serviceType: 'Health Consult',
            consultant: 'Illiana',
            date: date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : todayMountain(),
            time: '10:00',
            duration: 60,
            notes: '',
          }}
        />
      </Card>
    </>
  );
}
