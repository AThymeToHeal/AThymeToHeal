import { listDaysOff, type DayOffRow } from '@/lib/admin/queries';
import { ADVISOR_SCHEDULES } from '@/lib/db';
import { deleteTimeOffAction } from '@/lib/admin/actions';
import { todayMountain, addDays, formatDay, formatTime } from '@/lib/admin/time';
import TimeOffForm from '../../_components/TimeOffForm';
import { ConfirmButton } from '../../_components/client';
import { Card, CardTitle, ConsultantBadge, EmptyState, PageHeader, btnQuiet } from '../../_components/ui';

export const metadata = { title: 'Time off' };

interface Span {
  ids: string[];
  consultant: string;
  from: string;
  to: string;
  hours: string;
  reason: string | null;
}

/** Merge consecutive days with the same person, hours and note into one line ("Nov 3 – Nov 7"). */
function toSpans(rows: DayOffRow[]): Span[] {
  const sorted = [...rows].sort((a, b) => a.consultant.localeCompare(b.consultant) || a.date.localeCompare(b.date));
  const spans: Span[] = [];
  for (const r of sorted) {
    const hours = r.all_day ? 'All day' : `${formatTime(r.start_time!)} – ${formatTime(r.end_time!)}`;
    const last = spans[spans.length - 1];
    if (last && last.consultant === r.consultant && last.hours === hours && last.reason === r.reason && addDays(last.to, 1) === r.date) {
      last.to = r.date;
      last.ids.push(r.id);
    } else {
      spans.push({ ids: [r.id], consultant: r.consultant, from: r.date, to: r.date, hours, reason: r.reason });
    }
  }
  return spans.sort((a, b) => a.from.localeCompare(b.from) || a.consultant.localeCompare(b.consultant));
}

export default async function TimeOffPage() {
  const today = todayMountain();
  const spans = toSpans(await listDaysOff(today));

  return (
    <>
      <PageHeader
        title="Time off"
        subtitle="Days or hours you add here disappear from the booking form on the website right away."
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <Card>
          <CardTitle>Add time off</CardTitle>
          <div className="p-5">
            <TimeOffForm today={today} />
          </div>
        </Card>

        <Card className="self-start">
          <CardTitle>Coming up</CardTitle>
          {spans.length ? (
            <ul className="divide-y divide-[#2a2319]/10">
              {spans.map((s) => (
                <li key={s.ids[0]} className="flex items-start justify-between gap-3 px-5 py-3.5">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-[#2a2319]">
                        {s.from === s.to ? formatDay(s.from) : `${formatDay(s.from)} – ${formatDay(s.to)}`}
                      </span>
                      <ConsultantBadge name={s.consultant} />
                    </div>
                    <div className="mt-0.5 text-sm text-[#2a2319]/65">
                      {s.hours}
                      {s.reason ? ` · ${s.reason}` : ''}
                    </div>
                  </div>
                  <form action={deleteTimeOffAction}>
                    <input type="hidden" name="ids" value={s.ids.join(',')} />
                    <ConfirmButton className={btnQuiet} message="Remove this time off? Those hours open up for booking again.">
                      Remove
                    </ConfirmButton>
                  </form>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState title="No time off scheduled">Your regular hours are all open for booking.</EmptyState>
          )}
        </Card>
      </div>

      <Card className="mt-6">
        <CardTitle>Regular weekly hours</CardTitle>
        <div className="grid gap-4 p-5 text-sm sm:grid-cols-2">
          {(['Illiana', 'Heidi Lynn'] as const).map((c) => (
            <div key={c}>
              <ConsultantBadge name={c} />
              <ul className="mt-2 space-y-0.5 text-[#2a2319]/75">
                {Object.entries(ADVISOR_SCHEDULES[c])
                  .filter(([, h]) => h?.isActive)
                  .map(([day, h]) => (
                    <li key={day}>
                      <span className="inline-block w-24">{day}</span>
                      {formatTime(h!.start)} – {formatTime(h!.end)}
                    </li>
                  ))}
              </ul>
            </div>
          ))}
          <p className="text-xs text-[#2a2319]/55 sm:col-span-2">
            All Mountain Time. To change your regular hours, ask Web Launch Academy.
          </p>
        </div>
      </Card>
    </>
  );
}
