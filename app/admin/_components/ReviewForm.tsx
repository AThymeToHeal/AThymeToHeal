'use client';

import { useActionState } from 'react';
import { saveReviewAction, type FormState } from '@/lib/admin/actions';
import type { TestimonialRow } from '@/lib/admin/queries';
import { input, label, btnPrimary } from './ui';
import { SubmitButton, FormMessage } from './client';

export default function ReviewForm({ review }: { review?: TestimonialRow }) {
  const [state, formAction] = useActionState<FormState, FormData>(saveReviewAction, {});
  return <ReviewFormBody key={state.at ?? 0} review={review} state={state} formAction={formAction} />;
}

function ReviewFormBody({
  review: saved,
  state,
  formAction,
}: {
  review?: TestimonialRow;
  state: FormState;
  formAction: (payload: FormData) => void;
}) {
  const key = saved?.id ?? 'new';
  const v = state.values;
  // Refill after an error, or after saving an edit. A newly added review clears the form.
  const keep = v && (state.error || saved);
  const review = keep
    ? { name: v.name ?? '', text: v.text ?? '', rating: v.rating ? Number(v.rating) : null, approved: v.approved != null }
    : saved;

  return (
    <form action={formAction} className="space-y-4">
      {saved && <input type="hidden" name="id" value={saved.id} />}
      <div className="grid gap-4 sm:grid-cols-[1fr_160px]">
        <div>
          <label htmlFor={`name-${key}`} className={label}>Name shown on the site</label>
          <input id={`name-${key}`} name="name" defaultValue={review?.name ?? ''} required className={input} />
        </div>
        <div>
          <label htmlFor={`rating-${key}`} className={label}>Stars</label>
          <select id={`rating-${key}`} name="rating" defaultValue={review ? (review.rating ?? '') : 5} className={input}>
            <option value="">None</option>
            {[5, 4, 3, 2, 1].map((n) => (
              <option key={n} value={n}>{n} {n === 1 ? 'star' : 'stars'}</option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label htmlFor={`text-${key}`} className={label}>Review</label>
        <textarea id={`text-${key}`} name="text" rows={5} defaultValue={review?.text ?? ''} required maxLength={2000} className={input} />
      </div>
      <label className="flex items-center gap-2.5 text-sm font-medium text-[#2a2319]">
        <input type="checkbox" name="approved" defaultChecked={review ? review.approved : true} className="h-4 w-4 accent-[#023020]" />
        Show it on the website
      </label>
      <FormMessage state={state} />
      <SubmitButton className={btnPrimary}>{saved ? 'Save review' : 'Add review'}</SubmitButton>
    </form>
  );
}
