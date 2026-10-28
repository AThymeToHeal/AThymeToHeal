import Link from 'next/link';
import { dashboardCounts } from '@/lib/admin/queries';
import { logoutAction } from '@/lib/admin/actions';
import { Card, PageHeader, Svg, Icon } from '../../_components/ui';

export const metadata = { title: 'More' };

export default async function MorePage() {
  const counts = await dashboardCounts();
  const links = [
    { href: '/admin/reviews', label: 'Reviews', note: counts.pendingReviews ? `${counts.pendingReviews} waiting for approval` : 'Approve and manage reviews', icon: Icon.star },
    { href: '/admin/messages', label: 'Messages', note: 'Contact form and newsletter', icon: Icon.mail },
    { href: '/admin/faqs', label: 'FAQs', note: 'Edit the questions on your FAQ page', icon: Icon.question },
    { href: '/admin/team', label: 'Team & calendar', note: 'Logins, and bookings on your phone calendar', icon: Icon.key },
  ];
  return (
    <>
      <PageHeader title="More" />
      <Card>
        <ul className="divide-y divide-[#2a2319]/10">
          {links.map((l) => (
            <li key={l.href}>
              <Link href={l.href} className="flex items-center gap-4 px-5 py-4 hover:bg-[#f0e9d2]/40">
                <span className="text-[#023020]"><Svg icon={l.icon} /></span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold text-[#2a2319]">{l.label}</span>
                  <span className="block text-sm text-[#2a2319]/60">{l.note}</span>
                </span>
                <Svg icon={Icon.chevron} className="h-4 w-4 text-[#2a2319]/40" />
              </Link>
            </li>
          ))}
        </ul>
      </Card>
      <div className="mt-6 flex flex-wrap gap-3">
        <a href="/" target="_blank" rel="noopener noreferrer" className="rounded-lg border border-[#2a2319]/20 bg-white px-4 py-2.5 text-sm font-semibold text-[#2a2319]">
          View website
        </a>
        <form action={logoutAction}>
          <button type="submit" className="rounded-lg border border-[#2a2319]/20 bg-white px-4 py-2.5 text-sm font-semibold text-[#2a2319]">
            Sign out
          </button>
        </form>
      </div>
    </>
  );
}
