'use client';

import { useActionState, useState, useTransition } from 'react';
import Link from 'next/link';
import { getSlotsAction, rescheduleAction, cancelAction, type ManageState } from '@/lib/booking-actions';

const btn = 'inline-flex items-center justify-center rounded-md px-5 py-3 font-semibold transition-colors disabled:opacity-60';

function localLabel(iso: string): string {
  return new Date(iso).toLocaleString('en-US', { weekday: 'long', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

function mtLabel(time: string): string {
  const [h, m] = time.split(':').map(Number);
  return `${h % 12 === 0 ? 12 : h % 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
}

export default function ManageBooking({
  token,
  consultant,
  workdays,
  minDate,
}: {
  token: string;
  consultant: string;
  workdays: string;
  minDate: string;
}) {
  const [mode, setMode] = useState<'menu' | 'reschedule' | 'cancel'>('menu');
  const [date, setDate] = useState('');
  const [slots, setSlots] = useState<Array<{ time: string; iso: string }> | null>(null);
  const [slotError, setSlotError] = useState<string | undefined>();
  const [picked, setPicked] = useState('');
  const [loading, startLoading] = useTransition();
  const [moved, moveAction, moving] = useActionState<ManageState, FormData>(rescheduleAction.bind(null, token), {});
  const [cancelled, cancelFormAction, cancelling] = useActionState<ManageState, FormData>(cancelAction.bind(null, token), {});
  const userTz = typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'America/Denver';
  const showLocal = userTz !== 'America/Denver';

  if (cancelled.done === 'cancelled') {
    return (
      <div className="mt-8 rounded-xl border border-taupe p-6">
        <h2 className="font-serif text-2xl text-primary">Your appointment is cancelled</h2>
        <p className="mt-2 text-brown/80">We&apos;ve emailed you a confirmation. We&apos;d love to see you another time.</p>
        <Link href="/how-we-can-help-you" className={`${btn} mt-5 bg-primary text-secondary hover:bg-primary/90`}>
          Book another time
        </Link>
      </div>
    );
  }

  if (moved.done === 'rescheduled' && moved.newTime) {
    return (
      <div className="mt-8 rounded-xl border border-taupe p-6">
        <h2 className="font-serif text-2xl text-primary">You&apos;re all set</h2>
        <p className="mt-2 text-brown">Your new time: {localLabel(moved.newTime)}{showLocal ? ' (your time)' : ''}.</p>
        <p className="mt-2 text-brown/80">A confirmation is on its way to your inbox.</p>
      </div>
    );
  }

  if (mode === 'menu') {
    return (
      <div className="mt-8">
        <p className="text-brown/80">Need to make a change? You can do it here until 24 hours before your appointment.</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <button type="button" onClick={() => setMode('reschedule')} className={`${btn} bg-primary text-secondary hover:bg-primary/90`}>
            Pick a new time
          </button>
          <button type="button" onClick={() => setMode('cancel')} className={`${btn} border border-taupe text-brown hover:border-primary`}>
            Cancel appointment
          </button>
        </div>
      </div>
    );
  }

  if (mode === 'cancel') {
    return (
      <form action={cancelFormAction} className="mt-8 rounded-xl border border-taupe p-6">
        <h2 className="font-serif text-2xl text-primary">Cancel this appointment?</h2>
        <p className="mt-2 text-brown/80">Your time will open up for someone else. You can always book again.</p>
        {cancelled.error && <p role="alert" className="mt-4 text-orange">{cancelled.error}</p>}
        <div className="mt-5 flex flex-wrap gap-3">
          <button type="submit" disabled={cancelling} className={`${btn} bg-[#b4441c] text-white hover:bg-[#9a3a17]`}>
            {cancelling ? 'Cancelling…' : 'Yes, cancel it'}
          </button>
          <button type="button" onClick={() => setMode('menu')} className={`${btn} border border-taupe text-brown hover:border-primary`}>
            Keep my appointment
          </button>
        </div>
      </form>
    );
  }

  return (
    <form action={moveAction} className="mt-8 rounded-xl border border-taupe p-6">
      <h2 className="font-serif text-2xl text-primary">Pick a new time with {consultant}</h2>
      <p className="mt-1 text-sm text-brown/70">{consultant} sees clients {workdays}.</p>

      <label htmlFor="date" className="mt-5 block text-sm font-medium text-brown">Day</label>
      <input
        id="date"
        name="date"
        type="date"
        min={minDate}
        value={date}
        onChange={(e) => {
          const next = e.target.value;
          setDate(next);
          setPicked('');
          setSlots(null);
          if (!next) return;
          startLoading(async () => {
            const res = await getSlotsAction(token, next);
            setSlots(res.slots);
            setSlotError(res.error);
          });
        }}
        className="mt-1.5 w-full rounded-md border border-taupe px-4 py-3 text-brown focus:outline-none focus:ring-2 focus:ring-accent"
      />

      {loading && <p className="mt-4 text-brown/70">Checking openings…</p>}
      {!loading && slotError && <p role="alert" className="mt-4 text-orange">{slotError}</p>}
      {!loading && slots && slots.length === 0 && !slotError && (
        <p className="mt-4 text-brown/80">No openings that day. Try another day; {consultant} sees clients {workdays}.</p>
      )}
      {!loading && slots && slots.length > 0 && (
        <fieldset className="mt-5">
          <legend className="text-sm font-medium text-brown">
            Time {showLocal ? '(Mountain Time, with your time underneath)' : '(Mountain Time)'}
          </legend>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {slots.map((s) => (
              <label
                key={s.time}
                className={`cursor-pointer rounded-md border px-3 py-2.5 text-center ${
                  picked === s.time ? 'border-primary bg-primary text-secondary' : 'border-taupe text-brown hover:border-primary'
                }`}
              >
                <input type="radio" name="time" value={s.time} checked={picked === s.time} onChange={() => setPicked(s.time)} className="sr-only" />
                <span className="block font-semibold">{mtLabel(s.time)}</span>
                {showLocal && (
                  <span className="block text-xs opacity-75">
                    {new Date(s.iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} yours
                  </span>
                )}
              </label>
            ))}
          </div>
        </fieldset>
      )}

      {moved.error && <p role="alert" className="mt-4 text-orange">{moved.error}</p>}

      <div className="mt-6 flex flex-wrap gap-3">
        <button type="submit" disabled={!picked || moving} className={`${btn} bg-primary text-secondary hover:bg-primary/90`}>
          {moving ? 'Saving…' : 'Move my appointment'}
        </button>
        <button type="button" onClick={() => setMode('menu')} className={`${btn} border border-taupe text-brown hover:border-primary`}>
          Back
        </button>
      </div>
    </form>
  );
}
