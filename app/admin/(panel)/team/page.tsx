import { listTeam } from '@/lib/admin/queries';
import { requireSession } from '@/lib/admin/session';
import { resendInviteAction, removeMemberAction } from '@/lib/admin/team-actions';
import { FEEDS, feedUrl } from '@/lib/calendar';
import { formatStamp } from '@/lib/admin/time';
import InviteForm from '../../_components/InviteForm';
import CopyField from '../../_components/CopyField';
import InviteLinkButton from '../../_components/InviteLinkButton';
import { ConfirmButton, SubmitButton } from '../../_components/client';
import { Card, CardTitle, Notice, PageHeader, Pill, btnQuiet } from '../../_components/ui';

export const metadata = { title: 'Team & calendar' };

export default async function TeamPage() {
  const me = await requireSession();
  const [team, feeds] = await Promise.all([
    listTeam(),
    Promise.all(FEEDS.map(async (f) => ({ ...f, url: await feedUrl(f.who) }))),
  ]);

  return (
    <>
      <PageHeader title="Team & calendar" subtitle="Who can sign in, and your bookings on your phone's calendar." />

      {me.id === 'owner' && (
        <Notice tone="gold">
          You&apos;re signed in with the shared setup password. Invite yourself and Heidi below. Once one of you
          chooses a password from their invite link, the shared password stops working and everyone signs in with their own.
        </Notice>
      )}

      <div className="space-y-6">
        <Card>
          <CardTitle>People who can sign in</CardTitle>
          {team.length ? (
            <ul className="divide-y divide-[#2a2319]/10">
              {team.map((m) => (
                <li key={m.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-3.5">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-[#2a2319]">{m.name}</span>
                      {m.id === me.id && <Pill tone="green">You</Pill>}
                      {!m.has_password && <Pill tone="gold">Invite sent</Pill>}
                    </div>
                    <div className="text-sm text-[#2a2319]/60">
                      {m.email}
                      {m.last_login_at ? ` · last signed in ${formatStamp(m.last_login_at)}` : ''}
                    </div>
                  </div>
                  {m.id !== me.id && <InviteLinkButton id={m.id} name={m.name} pending={!m.has_password} />}
                  {!m.has_password && (
                    <form action={resendInviteAction}>
                      <input type="hidden" name="id" value={m.id} />
                      <SubmitButton className={btnQuiet} pending="Sending…">Send invite again</SubmitButton>
                    </form>
                  )}
                  {m.id !== me.id && (
                    <form action={removeMemberAction} className="order-last sm:order-none">
                      <input type="hidden" name="id" value={m.id} />
                      <ConfirmButton className={btnQuiet} message={`Remove ${m.name}? They won't be able to sign in any more.`}>
                        Remove
                      </ConfirmButton>
                    </form>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-5 py-4 text-sm text-[#2a2319]/65">No one yet. Invite yourself first.</p>
          )}
          <div className="border-t border-[#2a2319]/10 p-5">
            <h3 className="mb-3 font-serif text-lg text-[#023020]">Invite someone</h3>
            <InviteForm />
          </div>
        </Card>

        <Card>
          <CardTitle>Bookings on your phone&apos;s calendar</CardTitle>
          <div className="space-y-5 p-5">
            <p className="text-sm text-[#2a2319]/75">
              Subscribe once and every booking and day off appears in Google Calendar, Apple Calendar or Outlook,
              updating on its own (Google can take a few hours between refreshes).
            </p>
            {feeds.map((f) =>
              f.url ? (
                <div key={f.who}>
                  <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-[#2a2319]">{f.label}</span>
                    <a href={f.url.replace(/^https?:/, 'webcal:')} className="text-sm font-medium text-[#023020] underline underline-offset-2">
                      Add on this iPhone or Mac
                    </a>
                  </div>
                  <CopyField value={f.url} label={`Calendar link: ${f.label}`} />
                </div>
              ) : null
            )}
            <div className="rounded-lg bg-[#faf7ee] p-4 text-sm text-[#2a2319]/75">
              <p className="font-semibold text-[#2a2319]">Google Calendar</p>
              <p className="mt-1">
                On a computer, open Google Calendar, click the + next to &ldquo;Other calendars&rdquo;, choose
                &ldquo;From URL&rdquo;, and paste the link.
              </p>
              <p className="mt-3 font-semibold text-[#2a2319]">Keep these links private</p>
              <p className="mt-1">Anyone with a link can see client names and phone numbers. If one is ever shared by mistake, ask Web Launch Academy to reset it.</p>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}
