import Link from 'next/link';
import { listBookings, groupByDay } from '@/lib/admin/queries';
import { todayMountain, addDays, relativeDay } from '@/lib/admin/time';
import { AppointmentList } from '../../_components/AppointmentList';
import { Card, EmptyState, Notice, PageHeader, TabLinks, btnPrimary, Svg, Icon } from '../../_components/ui';

export const metadata = { title: 'Schedule' };

const WHO: Record<string, string | undefined> = { all: undefined, heidi: 'Heidi Lynn', illiana: 'Illiana' };

export default async function SchedulePage({
  searchParams,
}: {
  searchParams: Promise<{ who?: string; when?: string; cancelled?: string }>;
}) {
  const sp = await searchParams;
  const who = sp.who && sp.who in WHO ? sp.who : 'all';
  const past = sp.when === 'past';
  const today = todayMountain();

  const rows = past
    ? await listBookings(addDays(today, -180), addDays(today, -1), { consultant: WHO[who], descending: true })
    : await listBookings(today, addDays(today, 180), { consultant: WHO[who] });
  const groups = groupByDay(rows);

  const href = (w: string, p: boolean) => `/admin/schedule?who=${w}${p ? '&when=past' : ''}`;

  return (
    <>
      <PageHeader
        title="Schedule"
        subtitle="Everything booked online or added by you, in Mountain Time."
        action={
          <Link href="/admin/schedule/new" className={btnPrimary}>
            <Svg icon={Icon.plus} className="h-4 w-4" />
            Add appointment
          </Link>
        }
      />

      {sp.cancelled && <Notice>Appointment cancelled. That time is open on the website again.</Notice>}

      <div className="flex flex-wrap items-start justify-between gap-x-6">
        <TabLinks
          tabs={[
            { href: href(who, false), label: 'Upcoming', active: !past },
            { href: href(who, true), label: 'Past', active: past },
          ]}
        />
        <TabLinks
          tabs={[
            { href: href('all', past), label: 'Everyone', active: who === 'all' },
            { href: href('heidi', past), label: 'Heidi Lynn', active: who === 'heidi' },
            { href: href('illiana', past), label: 'Illiana', active: who === 'illiana' },
          ]}
        />
      </div>

      <Card>
        {groups.length ? (
          groups.map((g, i) => (
            <div key={g.date}>
              <h2
                className={`flex items-baseline justify-between bg-[#faf7ee] px-5 py-2.5 text-sm font-semibold text-[#023020] ${
                  i === 0 ? 'rounded-t-xl' : 'border-t border-[#2a2319]/10'
                }`}
              >
                {relativeDay(g.date)}
                <span className="text-xs font-normal text-[#2a2319]/55">{g.rows.length} booked</span>
              </h2>
              <AppointmentList rows={g.rows} />
            </div>
          ))
        ) : (
          <EmptyState title={past ? 'No past appointments in the last 6 months' : 'Nothing booked yet'}>
            {past ? null : 'New online bookings appear here the moment they are made.'}
          </EmptyState>
        )}
      </Card>
      <p className="mt-3 text-xs text-[#2a2319]/50">
        Showing {past ? 'the last' : 'the next'} 6 months.
      </p>
    </>
  );
}
