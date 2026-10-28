'use client';

import { useActionState, useState } from 'react';
import { saveBookingAction, type FormState } from '@/lib/admin/actions';
import { SERVICES, type ServiceType } from '@/lib/db';
import { HALF_HOURS, formatTime, addMinutes } from '@/lib/admin/time';
import { input, label, btnPrimary } from './ui';
import { SubmitButton, FormMessage } from './client';

export interface BookingFormValues {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  serviceType: string;
  consultant: string;
  date: string;
  time: string;
  duration: number;
  notes: string;
}

const DURATIONS = [30, 45, 60, 90, 120, 150, 180, 240];

export default function BookingForm({ initial }: { initial: BookingFormValues }) {
  const [state, formAction] = useActionState<FormState, FormData>(saveBookingAction, {});
  const v = state.values;
  const seed: BookingFormValues = v
    ? {
        id: initial.id,
        firstName: v.firstName ?? '',
        lastName: v.lastName ?? '',
        email: v.email ?? '',
        phone: v.phone ?? '',
        serviceType: v.serviceType ?? initial.serviceType,
        consultant: v.consultant ?? initial.consultant,
        date: v.date ?? initial.date,
        time: v.time ?? initial.time,
        duration: Number(v.duration) || initial.duration,
        notes: v.notes ?? '',
      }
    : initial;
  // Remount on every response so the fields refill with what she typed
  return <BookingFormBody key={state.at ?? 0} initial={seed} state={state} formAction={formAction} />;
}

function BookingFormBody({
  initial,
  state,
  formAction,
}: {
  initial: BookingFormValues;
  state: FormState;
  formAction: (payload: FormData) => void;
}) {
  const [service, setService] = useState(initial.serviceType);
  const [consultant, setConsultant] = useState(initial.consultant);
  const [duration, setDuration] = useState(initial.duration);
  const [time, setTime] = useState(initial.time);

  const allowed = SERVICES[service as ServiceType]?.availableConsultants;
  const durations = DURATIONS.includes(duration) ? DURATIONS : [...DURATIONS, duration].sort((a, b) => a - b);
  const times = HALF_HOURS.includes(time) ? HALF_HOURS : [...HALF_HOURS, time].sort();

  return (
    <form action={formAction} className="space-y-6">
      {initial.id && <input type="hidden" name="id" value={initial.id} />}

      <div className="space-y-4">
        <h3 className="font-serif text-lg text-[#023020]">Client</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="firstName" className={label}>First name</label>
            <input id="firstName" name="firstName" defaultValue={initial.firstName} required autoComplete="off" className={input} />
          </div>
          <div>
            <label htmlFor="lastName" className={label}>Last name</label>
            <input id="lastName" name="lastName" defaultValue={initial.lastName} autoComplete="off" className={input} />
          </div>
          <div>
            <label htmlFor="email" className={label}>Email <span className="font-normal text-[#2a2319]/50">(optional)</span></label>
            <input id="email" name="email" type="email" defaultValue={initial.email} autoComplete="off" className={input} />
          </div>
          <div>
            <label htmlFor="phone" className={label}>Phone <span className="font-normal text-[#2a2319]/50">(optional)</span></label>
            <input id="phone" name="phone" type="tel" defaultValue={initial.phone} autoComplete="off" className={input} />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-serif text-lg text-[#023020]">Appointment</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="serviceType" className={label}>Service</label>
            <select
              id="serviceType"
              name="serviceType"
              value={service}
              onChange={(e) => {
                const next = e.target.value as ServiceType;
                setService(next);
                setDuration(SERVICES[next].duration);
                const only = SERVICES[next].availableConsultants;
                if (only && only.length === 1) setConsultant(only[0]);
              }}
              className={input}
            >
              {Object.values(SERVICES).map((s) => (
                <option key={s.name} value={s.name}>
                  {s.name} ({s.duration} min{s.price ? `, $${s.price}` : ', free'})
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <span className={label}>With</span>
            <div className="flex flex-wrap gap-2">
              {(['Heidi Lynn', 'Illiana'] as const).map((c) => {
                const disabled = !!allowed && !allowed.includes(c);
                return (
                  <label
                    key={c}
                    className={`flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium ${
                      consultant === c ? 'border-[#023020] bg-[#023020] text-[#f0e9d2]' : 'border-[#2a2319]/20 bg-white text-[#2a2319]'
                    } ${disabled ? 'cursor-not-allowed opacity-40' : ''}`}
                  >
                    <input
                      type="radio"
                      name="consultant"
                      value={c}
                      checked={consultant === c}
                      disabled={disabled}
                      onChange={() => setConsultant(c)}
                      className="sr-only"
                    />
                    {c}
                  </label>
                );
              })}
            </div>
            {allowed && allowed.length === 1 && (
              <p className="mt-1.5 text-xs text-[#2a2319]/55">Only {allowed[0]} offers {service}.</p>
            )}
          </div>

          <div>
            <label htmlFor="date" className={label}>Date</label>
            <input id="date" name="date" type="date" defaultValue={initial.date} required className={input} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="time" className={label}>Starts</label>
              <select id="time" name="time" value={time} onChange={(e) => setTime(e.target.value)} className={input}>
                {times.map((t) => (
                  <option key={t} value={t}>{formatTime(t)}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="duration" className={label}>Length</label>
              <select id="duration" name="duration" value={duration} onChange={(e) => setDuration(Number(e.target.value))} className={input}>
                {durations.map((d) => (
                  <option key={d} value={d}>{d >= 60 && d % 60 === 0 ? `${d / 60} hr` : d > 60 ? `${Math.floor(d / 60)} hr ${d % 60} min` : `${d} min`}</option>
                ))}
              </select>
            </div>
          </div>
          <p className="-mt-2 text-xs text-[#2a2319]/55 sm:col-span-2">
            Mountain Time. Ends at {formatTime(addMinutes(time, duration))}, then the usual 30-minute buffer.
          </p>

          <div className="sm:col-span-2">
            <label htmlFor="notes" className={label}>Notes <span className="font-normal text-[#2a2319]/50">(only you see these)</span></label>
            <textarea id="notes" name="notes" rows={3} defaultValue={initial.notes} className={input} />
          </div>
        </div>
      </div>

      {!initial.id && (
        <label className="flex items-start gap-2.5 text-sm text-[#2a2319]">
          <input type="checkbox" name="sendConfirmation" defaultChecked className="mt-0.5 h-4 w-4 accent-[#023020]" />
          <span>
            Email the client a confirmation
            <span className="block text-xs text-[#2a2319]/55">Only if you added an email. It includes their link to reschedule or cancel.</span>
          </span>
        </label>
      )}

      {(state.warning || state.error) && <FormMessage state={state} />}
      {state.warning && (
        <label className="flex items-center gap-2.5 text-sm font-medium text-[#2a2319]">
          <input type="checkbox" name="override" className="h-4 w-4 accent-[#023020]" />
          Book it anyway
        </label>
      )}

      <div className="flex flex-wrap gap-3 border-t border-[#2a2319]/10 pt-5">
        <SubmitButton className={btnPrimary}>{initial.id ? 'Save changes' : 'Add appointment'}</SubmitButton>
      </div>
    </form>
  );
}
