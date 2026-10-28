'use client';

import { useActionState, useState } from 'react';
import { loginAction, requestResetAction } from '@/lib/admin/team-actions';
import type { FormState } from '@/lib/admin/actions';

const field =
  'w-full rounded-lg border border-[#f0e9d2]/25 bg-white/10 px-4 py-3 text-base text-[#f0e9d2] focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#d9a066]';
const fieldLabel = 'mb-2 block text-sm font-medium text-[#f0e9d2]/85';
const submit =
  'w-full rounded-lg bg-[#f0e9d2] py-3.5 text-base font-semibold text-[#023020] transition-colors hover:bg-white disabled:opacity-60';

/** `team` = at least one person has their own login, so ask for email + password. */
export default function LoginForm({ team }: { team: boolean }) {
  const [state, formAction, isPending] = useActionState<FormState, FormData>(loginAction, {});
  const [reset, resetAction, resetPending] = useActionState<FormState, FormData>(requestResetAction, {});
  const [forgot, setForgot] = useState(false);

  if (forgot) {
    return (
      <form action={resetAction} className="space-y-5">
        <p className="text-sm text-[#f0e9d2]/75">We&apos;ll email you a link to choose a new password.</p>
        <div>
          <label htmlFor="reset-email" className={fieldLabel}>Your email</label>
          <input id="reset-email" name="email" type="email" required autoComplete="email" className={field} />
        </div>
        {reset.error && <p role="alert" className="text-sm text-[#f5c29a]">{reset.error}</p>}
        {reset.ok && <p role="status" className="text-sm text-[#c1cf95]">{reset.ok}</p>}
        <button type="submit" disabled={resetPending} className={submit}>
          {resetPending ? 'Sending…' : 'Email me a link'}
        </button>
        <button type="button" onClick={() => setForgot(false)} className="w-full text-sm text-[#f0e9d2]/70 underline-offset-4 hover:underline">
          Back to sign in
        </button>
      </form>
    );
  }

  return (
    <form action={formAction} className="space-y-5" key={state.at ?? 0}>
      {team && (
        <div>
          <label htmlFor="email" className={fieldLabel}>Email</label>
          <input id="email" name="email" type="email" required autoFocus autoComplete="username" defaultValue={state.values?.email} className={field} />
        </div>
      )}
      <div>
        <label htmlFor="password" className={fieldLabel}>Password</label>
        <input id="password" name="password" type="password" required autoFocus={!team} autoComplete="current-password" className={field} />
      </div>

      {state.error && (
        <p role="alert" className="text-sm text-[#f5c29a]">
          {state.error}
        </p>
      )}

      <button type="submit" disabled={isPending} className={submit}>
        {isPending ? 'Signing in…' : 'Sign in'}
      </button>
      {team && (
        <button type="button" onClick={() => setForgot(true)} className="w-full text-sm text-[#f0e9d2]/70 underline-offset-4 hover:underline">
          Forgot your password?
        </button>
      )}
    </form>
  );
}
