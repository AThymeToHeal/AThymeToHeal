'use client';

import { useActionState } from 'react';
import { setPasswordAction } from '@/lib/admin/team-actions';
import type { FormState } from '@/lib/admin/actions';

const field =
  'w-full rounded-lg border border-[#f0e9d2]/25 bg-white/10 px-4 py-3 text-base text-[#f0e9d2] focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#d9a066]';

export default function SetPasswordForm({ token }: { token: string }) {
  const [state, formAction, isPending] = useActionState<FormState, FormData>(setPasswordAction, {});
  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="token" value={token} />
      <div>
        <label htmlFor="password" className="mb-2 block text-sm font-medium text-[#f0e9d2]/85">New password</label>
        <input id="password" name="password" type="password" required minLength={10} autoFocus autoComplete="new-password" className={field} />
        <p className="mt-1.5 text-xs text-[#f0e9d2]/60">At least 10 characters. A few words strung together is easy to remember.</p>
      </div>
      <div>
        <label htmlFor="confirm" className="mb-2 block text-sm font-medium text-[#f0e9d2]/85">Type it again</label>
        <input id="confirm" name="confirm" type="password" required autoComplete="new-password" className={field} />
      </div>
      {state.error && <p role="alert" className="text-sm text-[#f5c29a]">{state.error}</p>}
      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-lg bg-[#f0e9d2] py-3.5 text-base font-semibold text-[#023020] transition-colors hover:bg-white disabled:opacity-60"
      >
        {isPending ? 'Saving…' : 'Save password and sign in'}
      </button>
    </form>
  );
}
