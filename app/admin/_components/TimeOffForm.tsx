'use client';

import { useActionState, useState } from 'react';
import { addTimeOffAction, type FormState } from '@/lib/admin/actions';
import { HALF_HOURS, formatTime } from '@/lib/admin/time';
import { input, label, btnPrimary } from './ui';
import { SubmitButton, FormMessage } from './client';

const choice = (active: boolean) =>
  `flex cursor-pointer items-center rounded-lg border px-4 py-2.5 text-sm font-medium ${
    active ? 'border-[#023020] bg-[#023020] text-[#f0e9d2]' : 'border-[#2a2319]/20 bg-white text-[#2a2319]'
  }`;

export default function TimeOffForm({ today }: { today: string }) {
  const [state, formAction] = useActionState<FormState, FormData>(addTimeOffAction, {});
  return <TimeOffFormBody key={state.at ?? 0} today={today} state={state} formAction={formAction} />;
}

function TimeOffFormBody({
  today,
  state,
  formAction,
}: {
  today: string;
  state: FormState;
  formAction: (payload: FormData) => void;
}) {
  const v = state.error ? state.values : undefined; // refill only after an error
  const [who, setWho] = useState(v?.consultant ?? 'Illiana');
  const [mode, setMode] = useState<'day' | 'hours'>(v?.allDay === 'hours' ? 'hours' : 'day');
  const [start, setStart] = useState(v?.startDate ?? today);
  return (
    <form action={formAction} className="space-y-5">
      <div>
        <span className={label}>Who is off?</span>
        <div className="flex flex-wrap gap-2">
          {[
            ['Illiana', 'Illiana'],
            ['Heidi Lynn', 'Heidi Lynn'],
            ['both', 'Both of us'],
          ].map(([value, text]) => (
            <label key={value} className={choice(who === value)}>
              <input type="radio" name="consultant" value={value} checked={who === value} onChange={() => setWho(value)} className="sr-only" />
              {text}
            </label>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="startDate" className={label}>First day</label>
          <input id="startDate" name="startDate" type="date" min={today} value={start} onChange={(e) => setStart(e.target.value)} required className={input} />
        </div>
        <div>
          <label htmlFor="endDate" className={label}>
            Last day <span className="font-normal text-[#2a2319]/50">(optional)</span>
          </label>
          <input id="endDate" name="endDate" type="date" min={start} defaultValue={v?.endDate} className={input} />
        </div>
      </div>

      <div>
        <span className={label}>How much of the day?</span>
        <div className="flex flex-wrap gap-2">
          <label className={choice(mode === 'day')}>
            <input type="radio" name="allDay" value="day" checked={mode === 'day'} onChange={() => setMode('day')} className="sr-only" />
            The whole day
          </label>
          <label className={choice(mode === 'hours')}>
            <input type="radio" name="allDay" value="hours" checked={mode === 'hours'} onChange={() => setMode('hours')} className="sr-only" />
            Just some hours
          </label>
        </div>
      </div>

      {mode === 'hours' && (
        <div className="grid grid-cols-2 gap-3 sm:max-w-sm">
          <div>
            <label htmlFor="startTime" className={label}>From</label>
            <select id="startTime" name="startTime" defaultValue={v?.startTime ?? '09:00'} className={input}>
              {HALF_HOURS.map((t) => (
                <option key={t} value={t}>{formatTime(t)}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="endTime" className={label}>Until</label>
            <select id="endTime" name="endTime" defaultValue={v?.endTime ?? '13:00'} className={input}>
              {[...HALF_HOURS.slice(1), '21:00'].map((t) => (
                <option key={t} value={t}>{formatTime(t)}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      <div>
        <label htmlFor="reason" className={label}>
          Note <span className="font-normal text-[#2a2319]/50">(optional, only you see it)</span>
        </label>
        <input id="reason" name="reason" defaultValue={v?.reason} placeholder="Vacation, conference, appointment…" className={input} />
      </div>

      <FormMessage state={state} />

      <SubmitButton className={btnPrimary}>Block this time</SubmitButton>
    </form>
  );
}
