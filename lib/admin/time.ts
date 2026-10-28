/**
 * Mountain Time helpers for the admin. Appointments are stored in UTC; the practice
 * runs on America/Denver, so everything in /admin is shown and entered in Mountain Time.
 */

export const TZ = 'America/Denver';

function parts(date: Date): Record<string, string> {
  const out: Record<string, string> = {};
  new Intl.DateTimeFormat('en-US', {
    timeZone: TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
    .formatToParts(date)
    .forEach((p) => (out[p.type] = p.value));
  if (out.hour === '24') out.hour = '00';
  return out;
}

/** "YYYY-MM-DD" + "HH:MM" in Mountain Time -> UTC ISO string (DST-correct). */
export function mountainToUtcIso(date: string, time: string): string {
  const [y, m, d] = date.split('-').map(Number);
  const [h, min] = time.split(':').map(Number);
  const guess = Date.UTC(y, m - 1, d, h, min);
  const p = parts(new Date(guess));
  const wallAsUtc = Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute);
  return new Date(guess - (wallAsUtc - guess)).toISOString();
}

/** UTC ISO -> { date: "YYYY-MM-DD", time: "HH:MM" } in Mountain Time. */
export function utcToMountain(iso: string): { date: string; time: string } {
  const p = parts(new Date(iso));
  return { date: `${p.year}-${p.month}-${p.day}`, time: `${p.hour}:${p.minute}` };
}

/** Today's date in Mountain Time, "YYYY-MM-DD". */
export function todayMountain(): string {
  return utcToMountain(new Date().toISOString()).date;
}

/** Add whole days to a "YYYY-MM-DD" string. */
export function addDays(date: string, days: number): string {
  const [y, m, d] = date.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + days));
  return dt.toISOString().slice(0, 10);
}

/** "2026-10-28" -> "Wednesday, Oct 28" (adds the year when it isn't this year). */
export function formatDay(date: string): string {
  const [y, m, d] = date.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d, 12));
  const sameYear = y === Number(todayMountain().slice(0, 4));
  return dt.toLocaleDateString('en-US', {
    timeZone: 'UTC',
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    ...(sameYear ? {} : { year: 'numeric' }),
  });
}

/** "Today" / "Tomorrow" / "Yesterday" or the formatted day. */
export function relativeDay(date: string): string {
  const today = todayMountain();
  if (date === today) return 'Today';
  if (date === addDays(today, 1)) return 'Tomorrow';
  if (date === addDays(today, -1)) return 'Yesterday';
  return formatDay(date);
}

/** "13:30" -> "1:30 PM" */
export function formatTime(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const suffix = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${String(m).padStart(2, '0')} ${suffix}`;
}

/** Start time + minutes -> end "HH:MM". */
export function addMinutes(time: string, minutes: number): string {
  const [h, m] = time.split(':').map(Number);
  const total = h * 60 + m + minutes;
  return `${String(Math.floor(total / 60) % 24).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

/** Every half hour from 7:00 AM to 8:30 PM, for time pickers. */
export const HALF_HOURS: string[] = Array.from({ length: 28 }, (_, i) => {
  const minutes = 7 * 60 + i * 30;
  return `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
});

/** UTC ISO -> "Oct 27, 2026 at 3:12 PM" (Mountain Time), for "received" stamps. */
export function formatStamp(iso: string): string {
  const { date, time } = utcToMountain(iso);
  const [y, m, d] = date.split('-').map(Number);
  const day = new Date(Date.UTC(y, m - 1, d, 12)).toLocaleDateString('en-US', {
    timeZone: 'UTC',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  return `${day} at ${formatTime(time)}`;
}
