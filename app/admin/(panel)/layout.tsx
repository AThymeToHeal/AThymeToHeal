import Link from 'next/link';
import { logoutAction } from '@/lib/admin/actions';
import { dashboardCounts } from '@/lib/admin/queries';
import { requireSession } from '@/lib/admin/session';
import { SideNav, BottomNav, type NavItem } from '../_components/client';
import { Svg, Icon } from '../_components/ui';

export const dynamic = 'force-dynamic';

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const me = await requireSession();
  const counts = await dashboardCounts();

  const items: NavItem[] = [
    { href: '/admin', label: 'Today', icon: <Svg icon={Icon.sun} /> },
    { href: '/admin/schedule', label: 'Schedule', icon: <Svg icon={Icon.calendar} /> },
    { href: '/admin/time-off', label: 'Time off', icon: <Svg icon={Icon.leaf} /> },
    { href: '/admin/clients', label: 'Clients', icon: <Svg icon={Icon.people} /> },
    { href: '/admin/reviews', label: 'Reviews', icon: <Svg icon={Icon.star} />, badge: counts.pendingReviews },
    { href: '/admin/messages', label: 'Messages', icon: <Svg icon={Icon.mail} /> },
    { href: '/admin/faqs', label: 'FAQs', icon: <Svg icon={Icon.question} /> },
    { href: '/admin/team', label: 'Team & calendar', icon: <Svg icon={Icon.key} /> },
  ];
  // Phones get the four daily screens plus "More"
  const phoneItems: NavItem[] = [
    ...items.slice(0, 4),
    { href: '/admin/more', label: 'More', icon: <Svg icon={Icon.more} />, badge: counts.pendingReviews },
  ];

  return (
    <div className="lg:flex">
      {/* Desktop sidebar */}
      {/* overflow-y-auto: on short screens the links scroll inside the sidebar instead of stretching the page */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col overflow-y-auto bg-[#023020] px-4 py-5 lg:flex">
        <Link href="/admin" className="mb-6 px-3">
          <span className="block whitespace-nowrap font-script text-[2.1rem] leading-tight text-[#d9a066]">A Thyme to Heal</span>
          <span className="mt-1 block text-xs uppercase tracking-[0.2em] text-[#f0e9d2]/60">Practice admin</span>
        </Link>
        <SideNav items={items} />
        <div className="mt-auto space-y-1 px-1 pt-4">
          <p className="truncate px-3 pb-1 text-xs text-[#f0e9d2]/50">Signed in as {me.name}</p>
          <a href="/" target="_blank" rel="noopener noreferrer" className="block rounded-lg px-3 py-2 text-sm text-[#f0e9d2]/70 hover:bg-white/10 hover:text-[#f0e9d2]">
            View website
          </a>
          <form action={logoutAction}>
            <button type="submit" className="w-full rounded-lg px-3 py-2 text-left text-sm text-[#f0e9d2]/70 hover:bg-white/10 hover:text-[#f0e9d2]">
              Sign out
            </button>
          </form>
        </div>
      </aside>

      {/* Phone top bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between bg-[#023020] px-4 py-3 lg:hidden">
        <Link href="/admin" className="font-script text-3xl leading-tight text-[#d9a066]">
          A Thyme to Heal
        </Link>
        <form action={logoutAction}>
          <button type="submit" className="rounded-md px-2.5 py-1.5 text-sm text-[#f0e9d2]/80 hover:bg-white/10">
            Sign out
          </button>
        </form>
      </header>

      <main className="min-w-0 flex-1 px-4 pb-28 pt-6 sm:px-6 lg:px-10 lg:pb-12 lg:pt-10">
        <div className="mx-auto max-w-5xl">{children}</div>
      </main>

      <BottomNav items={phoneItems} />
    </div>
  );
}
