'use client';

import { useActionState } from 'react';
import { saveClientAction, type FormState } from '@/lib/admin/actions';
import type { ClientRow } from '@/lib/admin/queries';
import { input, label, btnPrimary } from './ui';
import { SubmitButton, FormMessage } from './client';

const HEALTH_FIELDS: Array<[keyof ClientRow, string, string]> = [
  ['health_goals', 'healthGoals', 'Health goals'],
  ['health_conditions', 'healthConditions', 'Health conditions'],
  ['current_medications', 'currentMedications', 'Current medications'],
  ['dietary_restrictions', 'dietaryRestrictions', 'Dietary restrictions'],
];

// Form field name for each column, used to refill from echoed values
const FIELD_NAMES: Partial<Record<keyof ClientRow, string>> = {
  first_name: 'firstName',
  last_name: 'lastName',
  email: 'email',
  phone: 'phone',
  preferred_contact_method: 'preferredContactMethod',
  health_goals: 'healthGoals',
  health_conditions: 'healthConditions',
  current_medications: 'currentMedications',
  dietary_restrictions: 'dietaryRestrictions',
};

export default function ClientForm({ client }: { client?: ClientRow }) {
  const [state, formAction] = useActionState<FormState, FormData>(saveClientAction, {});
  return <ClientFormBody key={state.at ?? 0} client={client} state={state} formAction={formAction} />;
}

function ClientFormBody({
  client,
  state,
  formAction,
}: {
  client?: ClientRow;
  state: FormState;
  formAction: (payload: FormData) => void;
}) {
  const v = (k: keyof ClientRow) => {
    const echoed = state.values?.[FIELD_NAMES[k] ?? ''];
    return echoed ?? (client?.[k] as string | null) ?? '';
  };

  return (
    <form action={formAction} className="space-y-5">
      {client && <input type="hidden" name="id" value={client.id} />}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="firstName" className={label}>First name</label>
          <input id="firstName" name="firstName" defaultValue={v('first_name')} required className={input} />
        </div>
        <div>
          <label htmlFor="lastName" className={label}>Last name</label>
          <input id="lastName" name="lastName" defaultValue={v('last_name')} className={input} />
        </div>
        <div>
          <label htmlFor="email" className={label}>Email</label>
          <input id="email" name="email" type="email" defaultValue={v('email')} className={input} />
        </div>
        <div>
          <label htmlFor="phone" className={label}>Phone</label>
          <input id="phone" name="phone" type="tel" defaultValue={v('phone')} className={input} />
        </div>
        <div>
          <label htmlFor="preferredContactMethod" className={label}>Prefers to be contacted by</label>
          <select id="preferredContactMethod" name="preferredContactMethod" defaultValue={v('preferred_contact_method')} className={input}>
            <option value="">Not given</option>
            <option>Email</option>
            <option>Phone</option>
            <option>Text</option>
          </select>
        </div>
      </div>
      {HEALTH_FIELDS.map(([key, name, text]) => (
        <div key={name}>
          <label htmlFor={name} className={label}>{text}</label>
          <textarea id={name} name={name} rows={3} defaultValue={v(key)} className={input} />
        </div>
      ))}
      <FormMessage state={state} />
      <SubmitButton className={btnPrimary}>{client ? 'Save changes' : 'Add client'}</SubmitButton>
    </form>
  );
}
