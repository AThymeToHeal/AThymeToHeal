'use client';

import { useActionState } from 'react';
import { inviteAction } from '@/lib/admin/team-actions';
import type { FormState } from '@/lib/admin/actions';
import { input, label, btnPrimary } from './ui';
import { SubmitButton, FormMessage } from './client';
import CopyField from './CopyField';

export default function InviteForm() {
  const [state, formAction] = useActionState<FormState, FormData>(inviteAction, {});
  const v = state.error ? state.values : undefined;
  return (
    <form key={state.at ?? 0} action={formAction} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="invite-name" className={label}>Name</label>
          <input id="invite-name" name="name" defaultValue={v?.name} required className={input} />
        </div>
        <div>
          <label htmlFor="invite-email" className={label}>Email</label>
          <input id="invite-email" name="email" type="email" defaultValue={v?.email} required className={input} />
        </div>
      </div>
      <FormMessage state={state} />
      {state.link && <CopyField value={state.link} label="Invite link" />}
      <SubmitButton className={btnPrimary} pending="Sending…">Send invite</SubmitButton>
    </form>
  );
}
