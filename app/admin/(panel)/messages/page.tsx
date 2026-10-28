import { listContacts, listNewsletter } from '@/lib/admin/queries';
import { deleteContactAction, setSubscriberStatusAction } from '@/lib/admin/actions';
import { formatStamp } from '@/lib/admin/time';
import { ConfirmButton, SubmitButton } from '../../_components/client';
import { Card, EmptyState, PageHeader, Pill, TabLinks, btnQuiet, btnSecondary, Svg, Icon } from '../../_components/ui';

export const metadata = { title: 'Messages' };

export default async function MessagesPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab } = await searchParams;
  const showNewsletter = tab === 'newsletter';
  const [contacts, subscribers] = await Promise.all([listContacts(), listNewsletter()]);
  const active = subscribers.filter((s) => s.status === 'Active');

  return (
    <>
      <PageHeader
        title="Messages"
        subtitle="Contact-form messages and newsletter sign-ups from the website."
        action={
          <a href={`/admin/export?kind=${showNewsletter ? 'newsletter' : 'contacts'}`} className={btnSecondary}>
            <Svg icon={Icon.download} className="h-4 w-4" />
            Download {showNewsletter ? 'subscribers' : 'messages'}
          </a>
        }
      />

      <TabLinks
        tabs={[
          { href: '/admin/messages', label: 'Contact messages', active: !showNewsletter, count: contacts.length },
          { href: '/admin/messages?tab=newsletter', label: 'Newsletter', active: showNewsletter, count: active.length },
        ]}
      />

      {!showNewsletter ? (
        <Card>
          {contacts.length ? (
            <ul className="divide-y divide-[#2a2319]/10">
              {contacts.map((c) => {
                const name = [c.first_name, c.last_name].filter(Boolean).join(' ') || 'No name';
                return (
                  <li key={c.id} className="px-5 py-5">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <span className="font-semibold text-[#2a2319]">{name}</span>
                      <span className="text-xs text-[#2a2319]/50">{formatStamp(c.created_at)}</span>
                    </div>
                    <div className="mt-0.5 text-sm text-[#2a2319]/65">
                      {c.email && <a href={`mailto:${c.email}${c.subject ? `?subject=Re: ${encodeURIComponent(c.subject)}` : ''}`} className="text-[#023020] underline-offset-2 hover:underline">{c.email}</a>}
                      {c.phone && <> · <a href={`tel:${c.phone.replace(/[^\d+]/g, '')}`} className="text-[#023020] underline-offset-2 hover:underline">{c.phone}</a></>}
                    </div>
                    {c.subject && <p className="mt-3 font-semibold text-[#2a2319]">{c.subject}</p>}
                    <p className="mt-1.5 whitespace-pre-wrap text-[15px] leading-relaxed text-[#2a2319]/85">{c.message}</p>
                    <form action={deleteContactAction} className="mt-3">
                      <input type="hidden" name="id" value={c.id} />
                      <ConfirmButton className={btnQuiet} message={`Delete the message from ${name}?`}>
                        Delete
                      </ConfirmButton>
                    </form>
                  </li>
                );
              })}
            </ul>
          ) : (
            <EmptyState title="No messages yet">Messages sent through the contact page land here.</EmptyState>
          )}
        </Card>
      ) : (
        <Card>
          {subscribers.length ? (
            <ul className="divide-y divide-[#2a2319]/10">
              {subscribers.map((s) => (
                <li key={s.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-3">
                  <span className="min-w-0 flex-1 truncate">
                    <span className="font-medium text-[#2a2319]">{s.email}</span>
                    {s.name && <span className="text-[#2a2319]/60"> · {s.name}</span>}
                  </span>
                  <span className="text-xs text-[#2a2319]/50">{formatStamp(s.created_at).split(' at ')[0]}</span>
                  {s.status === 'Active' ? <Pill tone="green">Subscribed</Pill> : <Pill>Unsubscribed</Pill>}
                  <form action={setSubscriberStatusAction}>
                    <input type="hidden" name="id" value={s.id} />
                    <input type="hidden" name="status" value={s.status === 'Active' ? 'Unsubscribed' : 'Active'} />
                    <SubmitButton className={btnQuiet} pending="…">
                      {s.status === 'Active' ? 'Unsubscribe' : 'Resubscribe'}
                    </SubmitButton>
                  </form>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState title="No sign-ups yet" />
          )}
        </Card>
      )}
    </>
  );
}
