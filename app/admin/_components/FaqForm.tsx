'use client';

import { useActionState } from 'react';
import { saveFaqAction, type FormState } from '@/lib/admin/actions';
import type { FaqRow } from '@/lib/admin/queries';
import { input, label, btnPrimary } from './ui';
import { SubmitButton, FormMessage } from './client';

export default function FaqForm({ faq, categories }: { faq?: FaqRow; categories: string[] }) {
  const [state, formAction] = useActionState<FormState, FormData>(saveFaqAction, {});
  return <FaqFormBody key={state.at ?? 0} faq={faq} categories={categories} state={state} formAction={formAction} />;
}

function FaqFormBody({
  faq,
  categories,
  state,
  formAction,
}: {
  faq?: FaqRow;
  categories: string[];
  state: FormState;
  formAction: (payload: FormData) => void;
}) {
  const key = faq?.id ?? 'new';
  // Refill after an error or an edit; a newly added FAQ clears the form
  const v = state.values && (state.error || faq) ? state.values : undefined;
  return (
    <form action={formAction} className="space-y-4">
      {faq && <input type="hidden" name="id" value={faq.id} />}
      <div>
        <label htmlFor={`q-${key}`} className={label}>Question</label>
        <input id={`q-${key}`} name="question" defaultValue={v?.question ?? faq?.question ?? ''} required className={input} />
      </div>
      <div>
        <label htmlFor={`a-${key}`} className={label}>Answer</label>
        <textarea id={`a-${key}`} name="answer" rows={5} defaultValue={v?.answer ?? faq?.answer ?? ''} required className={input} />
      </div>
      <div className="sm:max-w-xs">
        <label htmlFor={`c-${key}`} className={label}>Topic</label>
        <input id={`c-${key}`} name="category" list="faq-topics" defaultValue={v?.category ?? faq?.category ?? ''} placeholder="e.g. Services" className={input} />
        <datalist id="faq-topics">
          {categories.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
      </div>
      <label className="flex items-center gap-2.5 text-sm font-medium text-[#2a2319]">
        <input
          type="checkbox"
          name="isVisible"
          defaultChecked={v ? v.isVisible != null : faq ? faq.is_visible : true}
          className="h-4 w-4 accent-[#023020]"
        />
        Show it on the FAQ page
      </label>
      <FormMessage state={state} />
      <SubmitButton className={btnPrimary}>{faq ? 'Save' : 'Add question'}</SubmitButton>
    </form>
  );
}
