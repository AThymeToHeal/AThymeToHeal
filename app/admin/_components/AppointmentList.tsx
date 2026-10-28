import Link from 'next/link';
import type { BookingRow } from '@/lib/admin/queries';
import { utcToMountain, formatTime, addMinutes, relativeDay } from '@/lib/admin/time';
import { ConsultantBadge, Pill } from './ui';

/** One tappable row per appointment: time on the left, who and what on the right. */
export function AppointmentRow({ b, showDate = false }: { b: BookingRow; showDate?: boolean }) {
  const { date, time } = utcToMountain(b.date_and_time);
  const name = [b.first_name, b.last_name].filter(Boolean).join(' ');
  const staffAdded = !!b.user_local_time?.startsWith('Added by');
  return (
    <li>
      <Link
        href={`/admin/schedule/${b.id}`}
        className="flex gap-4 px-5 py-3.5 transition-colors hover:bg-[#f0e9d2]/40 focus-visible:bg-[#f0e9d2]/40"
      >
        <div className={`${showDate ? 'w-[112px]' : 'w-[76px]'} shrink-0 pt-0.5 text-sm`}>
          {showDate && <div className="text-xs font-semibold uppercase tracking-wide text-[#2a2319]/55">{relativeDay(date)}</div>}
          <div className="font-semibold text-[#023020]">{formatTime(time)}</div>
          <div className="text-[#2a2319]/50">{formatTime(addMinutes(time, b.duration || 30))}</div>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="truncate font-semibold text-[#2a2319]">{name || 'Blocked time'}</span>
            <ConsultantBadge name={b.consultant} />
            {staffAdded && <Pill>{b.user_local_time}</Pill>}
          </div>
          <div className="mt-0.5 truncate text-sm text-[#2a2319]/65">
            {b.service_type || b.notes || 'No service set'}
            {b.phone ? ` · ${b.phone}` : ''}
          </div>
        </div>
      </Link>
    </li>
  );
}

export function AppointmentList({ rows }: { rows: BookingRow[] }) {
  return (
    <ul className="divide-y divide-[#2a2319]/10">
      {rows.map((b) => (
        <AppointmentRow key={b.id} b={b} />
      ))}
    </ul>
  );
}
