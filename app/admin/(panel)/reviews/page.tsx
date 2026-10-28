import { listTestimonials, type TestimonialRow } from '@/lib/admin/queries';
import { setReviewApprovedAction, deleteReviewAction } from '@/lib/admin/actions';
import { formatStamp } from '@/lib/admin/time';
import ReviewForm from '../../_components/ReviewForm';
import { ConfirmButton, SubmitButton } from '../../_components/client';
import { Card, CardTitle, EmptyState, PageHeader, Pill, btnPrimary, btnSecondary, btnQuiet } from '../../_components/ui';

export const metadata = { title: 'Reviews' };

function Stars({ n }: { n: number | null }) {
  if (!n) return null;
  return (
    <span className="text-[#d9a066]" aria-label={`${n} out of 5 stars`}>
      {'★'.repeat(n)}
      <span className="text-[#2a2319]/20">{'★'.repeat(5 - n)}</span>
    </span>
  );
}

function ReviewCard({ r }: { r: TestimonialRow }) {
  return (
    <li className="px-5 py-5">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="font-semibold text-[#2a2319]">{r.name || 'No name'}</span>
        <Stars n={r.rating} />
        {r.approved ? <Pill tone="green">On the website</Pill> : <Pill tone="gold">Waiting</Pill>}
        <span className="text-xs text-[#2a2319]/50">{formatStamp(r.created_at).split(' at ')[0]}</span>
      </div>
      <blockquote className="mt-2.5 whitespace-pre-wrap font-serif text-[16px] leading-relaxed text-[#2a2319]/85">
        &ldquo;{r.text}&rdquo;
      </blockquote>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <form action={setReviewApprovedAction}>
          <input type="hidden" name="id" value={r.id} />
          <input type="hidden" name="approved" value={r.approved ? 'false' : 'true'} />
          <SubmitButton className={r.approved ? btnSecondary : btnPrimary} pending={r.approved ? 'Hiding…' : 'Approving…'}>
            {r.approved ? 'Hide from website' : 'Approve'}
          </SubmitButton>
        </form>
        <details className="group">
          <summary className={`${btnQuiet} cursor-pointer list-none`}>Edit</summary>
          <div className="mt-3 w-full rounded-lg border border-[#2a2319]/10 bg-[#faf7ee] p-4 sm:min-w-[480px]">
            <ReviewForm review={r} />
          </div>
        </details>
        <form action={deleteReviewAction}>
          <input type="hidden" name="id" value={r.id} />
          <ConfirmButton className={btnQuiet} message={`Delete ${r.name || 'this'}'s review for good?`}>
            Delete
          </ConfirmButton>
        </form>
      </div>
    </li>
  );
}

export default async function ReviewsPage() {
  const reviews = await listTestimonials();
  const waiting = reviews.filter((r) => !r.approved);
  const live = reviews.filter((r) => r.approved);

  return (
    <>
      <PageHeader title="Reviews" subtitle="Reviews people leave on the website wait here until you approve them." />

      <div className="space-y-6">
        <Card>
          <CardTitle action={<span className="text-sm text-[#2a2319]/60">{waiting.length}</span>}>Waiting for approval</CardTitle>
          {waiting.length ? (
            <ul className="divide-y divide-[#2a2319]/10">{waiting.map((r) => <ReviewCard key={r.id} r={r} />)}</ul>
          ) : (
            <EmptyState title="All caught up">New reviews from the website will appear here.</EmptyState>
          )}
        </Card>

        <Card>
          <CardTitle action={<span className="text-sm text-[#2a2319]/60">{live.length}</span>}>On the website</CardTitle>
          {live.length ? (
            <ul className="divide-y divide-[#2a2319]/10">{live.map((r) => <ReviewCard key={r.id} r={r} />)}</ul>
          ) : (
            <EmptyState title="No reviews showing yet" />
          )}
        </Card>

        <Card>
          <CardTitle>Add a review you received elsewhere</CardTitle>
          <div className="p-5">
            <p className="mb-4 text-sm text-[#2a2319]/65">For kind words that came by text, email or in person. Ask the client before you post them.</p>
            <ReviewForm />
          </div>
        </Card>
      </div>
    </>
  );
}
