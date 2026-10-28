import { listAllFaqs } from '@/lib/admin/queries';
import { moveFaqAction, deleteFaqAction } from '@/lib/admin/actions';
import FaqForm from '../../_components/FaqForm';
import { ConfirmButton, SubmitButton } from '../../_components/client';
import { Card, CardTitle, EmptyState, PageHeader, Pill, btnQuiet } from '../../_components/ui';

export const metadata = { title: 'FAQs' };

export default async function FaqsPage() {
  const faqs = await listAllFaqs();
  const categories = [...new Set(faqs.map((f) => f.category).filter((c): c is string => !!c))].sort();

  return (
    <>
      <PageHeader
        title="FAQs"
        subtitle={
          <>
            The questions on your{' '}
            <a href="/faq" target="_blank" rel="noopener noreferrer" className="text-[#023020] underline underline-offset-2">
              FAQ page
            </a>
            , in this order. Changes show there within a few seconds.
          </>
        }
      />

      <div className="space-y-6">
        <Card>
          <CardTitle action={<span className="text-sm text-[#2a2319]/60">{faqs.filter((f) => f.is_visible).length} showing</span>}>
            Questions
          </CardTitle>
          {faqs.length ? (
            <ol className="divide-y divide-[#2a2319]/10">
              {faqs.map((f, i) => (
                <li key={f.id} className="px-5 py-4">
                  <div className="flex gap-3">
                    <div className="flex shrink-0 flex-col">
                      <form action={moveFaqAction}>
                        <input type="hidden" name="id" value={f.id} />
                        <input type="hidden" name="direction" value="up" />
                        <SubmitButton className={`${btnQuiet} px-2 disabled:opacity-30`} pending="…">
                          <span aria-hidden="true">↑</span>
                          <span className="sr-only">Move up</span>
                        </SubmitButton>
                      </form>
                      <form action={moveFaqAction}>
                        <input type="hidden" name="id" value={f.id} />
                        <input type="hidden" name="direction" value="down" />
                        <SubmitButton className={`${btnQuiet} px-2 disabled:opacity-30`} pending="…">
                          <span aria-hidden="true">↓</span>
                          <span className="sr-only">Move down</span>
                        </SubmitButton>
                      </form>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs text-[#2a2319]/45">{i + 1}.</span>
                        <span className="font-semibold text-[#2a2319]">{f.question}</span>
                      </div>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {f.category && <Pill>{f.category}</Pill>}
                        {f.is_visible ? <Pill tone="green">Showing</Pill> : <Pill tone="gold">Hidden</Pill>}
                      </div>
                      <p className="mt-2 line-clamp-2 text-sm text-[#2a2319]/70">{f.answer}</p>
                      <div className="mt-2 flex flex-wrap items-start gap-2">
                        <details className="open:w-full sm:open:w-auto">
                          <summary className={`${btnQuiet} cursor-pointer list-none`}>Edit</summary>
                          <div className="mt-3 rounded-lg border border-[#2a2319]/10 bg-[#faf7ee] p-4 sm:min-w-[520px]">
                            <FaqForm faq={f} categories={categories} />
                          </div>
                        </details>
                        <form action={deleteFaqAction}>
                          <input type="hidden" name="id" value={f.id} />
                          <ConfirmButton className={btnQuiet} message="Delete this question for good? (Hiding it keeps it for later.)">
                            Delete
                          </ConfirmButton>
                        </form>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <EmptyState title="No questions yet" />
          )}
        </Card>

        <Card>
          <CardTitle>Add a question</CardTitle>
          <div className="p-5">
            <FaqForm categories={categories} />
          </div>
        </Card>
      </div>
    </>
  );
}
