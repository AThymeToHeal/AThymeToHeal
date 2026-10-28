import Link from 'next/link';
import { listBookings, listDaysOff, dashboardCounts, groupByDay } from '@/lib/admin/queries';
import { todayMountain, addDays, relativeDay, formatDay, formatTime, utcToMountain } from '@/lib/admin/time';
import { AppointmentList } from '../_components/AppointmentList';
import { Card, CardTitle, EmptyState, PageHeader, ConsultantBadge, btnPrimary, btnSecondary, Svg, Icon } from '../_components/ui';

export const metadata = { title: 'Today' };

function greeting(): string {
  const hour = Number(utcToMountain(new Date().toISOString()).time.slice(0, 2));
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export default async function TodayPage() {
  const today = todayMountain();
  const [todayRows, weekRows, daysOff, counts] = await Promise.all([
    listBookings(today, today),
    listBookings(addDays(today, 1), addDays(today, 7)),
    listDaysOff(today),
    dashboardCounts(),
  ]);
  const comingUp = groupByDay(weekRows);
  const offSoon = daysOff.filter((d) => d.date <= addDays(today, 7));

  return (
    <>
      <PageHeader
        title={greeting()}
        subtitle={formatDay(today)}
        action={
          <>
            <Link href="/admin/schedule/new" className={btnPrimary}>
              <Svg icon={Icon.plus} className="h-4 w-4" />
              Add appointment
            </Link>
            <Link href="/admin/time-off" className={btnSecondary}>
              Take time off
            </Link>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <div className="min-w-0 space-y-6">
          <Card>
            <CardTitle
              action={
                <span className="text-sm text-[#2a2319]/60">
                  {todayRows.length} {todayRows.length === 1 ? 'appointment' : 'appointments'}
                </span>
              }
            >
              Today
            </CardTitle>
            {todayRows.length ? (
              <AppointmentList rows={todayRows} />
            ) : (
              <EmptyState title="Nothing booked today">Enjoy the breathing room.</EmptyState>
            )}
          </Card>

          <Card>
            <CardTitle
              action={
                <Link href="/admin/schedule" className="text-sm font-medium text-[#023020] hover:underline">
                  Full schedule
                </Link>
              }
            >
              The next 7 days
            </CardTitle>
            {comingUp.length ? (
              comingUp.map((g) => (
                <div key={g.date}>
                  <h3 className="bg-[#faf7ee] px-5 py-2 text-xs font-semibold uppercase tracking-wider text-[#2a2319]/60">
                    {relativeDay(g.date)}
                  </h3>
                  <AppointmentList rows={g.rows} />
                </div>
              ))
            ) : (
              <EmptyState title="No appointments this week yet" />
            )}
          </Card>
        </div>

        <div className="space-y-4">
          <Link href="/admin/reviews" className="block rounded-xl border border-[#2a2319]/10 bg-white p-5 transition-colors hover:border-[#023020]/40">
            <div className="text-3xl font-serif text-[#023020]">{counts.pendingReviews}</div>
            <div className="mt-1 text-sm text-[#2a2319]/70">
              {counts.pendingReviews === 1 ? 'review is' : 'reviews are'} waiting for your approval
            </div>
          </Link>
          <Link href="/admin/messages" className="block rounded-xl border border-[#2a2319]/10 bg-white p-5 transition-colors hover:border-[#023020]/40">
            <div className="text-3xl font-serif text-[#023020]">{counts.newMessages}</div>
            <div className="mt-1 text-sm text-[#2a2319]/70">
              new {counts.newMessages === 1 ? 'message' : 'messages'} in the last 7 days
            </div>
          </Link>
          <Card>
            <CardTitle>Time off this week</CardTitle>
            {offSoon.length ? (
              <ul className="divide-y divide-[#2a2319]/10">
                {offSoon.map((d) => (
                  <li key={d.id} className="flex items-center justify-between gap-2 px-5 py-3 text-sm">
                    <span>
                      {relativeDay(d.date)}
                      <span className="block text-[#2a2319]/60">
                        {d.all_day ? 'All day' : `${formatTime(d.start_time!)} – ${formatTime(d.end_time!)}`}
                      </span>
                    </span>
                    <ConsultantBadge name={d.consultant} />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="px-5 py-4 text-sm text-[#2a2319]/60">Both of you are on the schedule.</p>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}
