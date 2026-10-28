import Link from 'next/link';
import { listClients } from '@/lib/admin/queries';
import { formatStamp } from '@/lib/admin/time';
import { Card, EmptyState, Notice, PageHeader, btnPrimary, btnSecondary, input, Svg, Icon } from '../../_components/ui';

export const metadata = { title: 'Clients' };

export default async function ClientsPage({ searchParams }: { searchParams: Promise<{ q?: string; deleted?: string }> }) {
  const { q = '', deleted } = await searchParams;
  const clients = await listClients(q);

  return (
    <>
      <PageHeader
        title="Clients"
        subtitle="Everyone who filled in the intake form, plus anyone you add."
        action={
          <>
            <Link href="/admin/clients/new" className={btnPrimary}>
              <Svg icon={Icon.plus} className="h-4 w-4" />
              Add client
            </Link>
            <a href="/admin/export?kind=clients" className={btnSecondary}>
              <Svg icon={Icon.download} className="h-4 w-4" />
              Download
            </a>
          </>
        }
      />

      {deleted && <Notice>Client record deleted.</Notice>}

      <form className="mb-5 flex gap-2" role="search">
        <label htmlFor="q" className="sr-only">Search clients</label>
        <input id="q" name="q" type="search" defaultValue={q} placeholder="Search by name, email or phone" className={input} />
        <button type="submit" className={btnSecondary}>Search</button>
      </form>

      <Card>
        {clients.length ? (
          <ul className="divide-y divide-[#2a2319]/10">
            {clients.map((c) => (
              <li key={c.id}>
                <Link href={`/admin/clients/${c.id}`} className="flex flex-col gap-0.5 px-5 py-3.5 transition-colors hover:bg-[#f0e9d2]/40 sm:flex-row sm:items-center sm:gap-4">
                  <span className="font-semibold text-[#2a2319] sm:w-56 sm:shrink-0">
                    {[c.first_name, c.last_name].filter(Boolean).join(' ') || 'No name'}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm text-[#2a2319]/65">
                    {[c.email, c.phone].filter(Boolean).join(' · ')}
                  </span>
                  <span className="text-xs text-[#2a2319]/50">Since {formatStamp(c.created_at).split(' at ')[0]}</span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState title={q ? `No one matches "${q}"` : 'No clients yet'}>
            {q ? 'Try part of a name, or an email or phone number.' : 'Intake forms from the website show up here.'}
          </EmptyState>
        )}
      </Card>
    </>
  );
}
