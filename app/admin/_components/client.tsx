'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useFormStatus } from 'react-dom';
import type { ReactNode } from 'react';
import type { FormState } from '@/lib/admin/actions';

/** Submit button that shows a pending label while its form is saving. */
export function SubmitButton({ children, pending: pendingLabel = 'Saving…', className }: { children: ReactNode; pending?: string; className: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={className}>
      {pending ? pendingLabel : children}
    </button>
  );
}

/** A submit button that asks first. For anything that deletes. */
export function ConfirmButton({ children, message, className }: { children: ReactNode; message: string; className: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={className}
      onClick={(e) => {
        if (!window.confirm(message)) e.preventDefault();
      }}
    >
      {pending ? 'Working…' : children}
    </button>
  );
}

export function FormMessage({ state }: { state: FormState }) {
  if (state.error)
    return (
      <p role="alert" className="rounded-lg border border-[#b4441c]/30 bg-[#b4441c]/10 px-4 py-3 text-sm text-[#8a3214]">
        {state.error}
      </p>
    );
  if (state.warning)
    return (
      <p role="alert" className="rounded-lg border border-[#d9a066]/50 bg-[#d9a066]/15 px-4 py-3 text-sm text-[#5a3810]">
        {state.warning}
      </p>
    );
  if (state.ok)
    return (
      <p role="status" className="rounded-lg border border-[#023020]/20 bg-[#023020]/5 px-4 py-3 text-sm text-[#023020]">
        {state.ok}
      </p>
    );
  return null;
}

export interface NavItem {
  href: string;
  label: string;
  icon: ReactNode;
  badge?: number;
}

const MORE_PATHS = ['/admin/more', '/admin/reviews', '/admin/messages', '/admin/faqs', '/admin/team'];

function isActive(pathname: string, href: string) {
  if (href === '/admin') return pathname === '/admin';
  if (href === '/admin/more') return MORE_PATHS.some((p) => pathname.startsWith(p));
  return pathname.startsWith(href);
}

/** Sidebar on desktop. */
export function SideNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-1" aria-label="Admin">
      {items.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? 'page' : undefined}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-[15px] transition-colors ${
              active ? 'bg-[#f0e9d2] font-semibold text-[#023020]' : 'text-[#f0e9d2]/80 hover:bg-white/10 hover:text-[#f0e9d2]'
            }`}
          >
            {item.icon}
            <span className="flex-1">{item.label}</span>
            {!!item.badge && (
              <span className="rounded-full bg-[#d9a066] px-2 py-0.5 text-xs font-bold text-[#2a2319]">{item.badge}</span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

/** Bottom tab bar on phones. */
export function BottomNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Admin"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-[#2a2319]/10 bg-white pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      <div className="flex">
        {items.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={`relative flex min-w-0 flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-medium ${
                active ? 'text-[#023020]' : 'text-[#2a2319]/55'
              }`}
            >
              {active && <span className="absolute inset-x-3 top-0 h-0.5 rounded-full bg-[#023020]" />}
              {item.icon}
              <span className="truncate">{item.label}</span>
              {!!item.badge && (
                <span className="absolute right-[calc(50%-18px)] top-1 h-2 w-2 rounded-full bg-[#d9a066]" aria-label={`${item.badge} waiting`} />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
