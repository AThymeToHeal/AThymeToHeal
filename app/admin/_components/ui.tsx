import Link from 'next/link';
import type { ReactNode } from 'react';

/**
 * Shared look for /admin. Server-safe (no hooks).
 * Palette is the site's own: forest #023020, cream #f0e9d2, gold #d9a066, sage #c1cf95, brown #2a2319.
 * Colours are written as hex (not the CSS vars) because Tailwind v3 can't apply /opacity to var() colours.
 */

export const input =
  'w-full rounded-lg border border-[#2a2319]/20 bg-white px-3.5 py-2.5 text-base text-[#2a2319] placeholder:text-[#2a2319]/40 focus:border-[#023020] focus:outline-none focus:ring-2 focus:ring-[#023020]/20';
export const label = 'mb-1.5 block text-sm font-medium text-[#2a2319]/80';
export const btnPrimary =
  'inline-flex items-center justify-center gap-2 rounded-lg bg-[#023020] px-4 py-2.5 text-sm font-semibold text-[#f0e9d2] transition-colors hover:bg-[#0b4a33] disabled:opacity-60';
export const btnSecondary =
  'inline-flex items-center justify-center gap-2 rounded-lg border border-[#2a2319]/20 bg-white px-4 py-2.5 text-sm font-semibold text-[#2a2319] transition-colors hover:border-[#023020] hover:text-[#023020] disabled:opacity-60';
export const btnDanger =
  'inline-flex items-center justify-center gap-2 rounded-lg border border-[#b4441c]/30 bg-white px-4 py-2.5 text-sm font-semibold text-[#b4441c] transition-colors hover:bg-[#b4441c] hover:text-white disabled:opacity-60';
export const btnQuiet =
  'inline-flex items-center justify-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium text-[#2a2319]/70 transition-colors hover:bg-[#023020]/5 hover:text-[#023020]';

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-serif text-3xl text-[#023020] sm:text-4xl">{title}</h1>
        {subtitle && <p className="mt-1.5 text-[15px] text-[#2a2319]/70">{subtitle}</p>}
      </div>
      {action && <div className="flex flex-wrap gap-2">{action}</div>}
    </div>
  );
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-xl border border-[#2a2319]/10 bg-white ${className}`}>{children}</section>;
}

export function CardTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-[#2a2319]/10 px-5 py-3.5">
      <h2 className="font-serif text-lg text-[#023020]">{children}</h2>
      {action}
    </div>
  );
}

/** Each advisor has her own colour everywhere in the admin. */
export function ConsultantBadge({ name }: { name: string | null }) {
  const style =
    name === 'Heidi Lynn'
      ? 'bg-[#c1cf95]/50 text-[#33401a]'
      : name === 'Illiana'
        ? 'bg-[#d9a066]/30 text-[#6b4114]'
        : 'bg-[#2a2319]/10 text-[#2a2319]/80';
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${style}`}>
      {name ?? 'Both'}
    </span>
  );
}

export function Pill({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'neutral' | 'green' | 'gold' | 'red' }) {
  const tones = {
    neutral: 'bg-[#2a2319]/10 text-[#2a2319]/75',
    green: 'bg-[#023020]/10 text-[#023020]',
    gold: 'bg-[#d9a066]/25 text-[#6b4114]',
    red: 'bg-[#b4441c]/10 text-[#b4441c]',
  };
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${tones[tone]}`}>{children}</span>;
}

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="px-5 py-10 text-center">
      <p className="font-serif text-lg text-[#023020]">{title}</p>
      {children && <div className="mt-1.5 text-sm text-[#2a2319]/65">{children}</div>}
    </div>
  );
}

export function Notice({ tone = 'green', children }: { tone?: 'green' | 'gold' | 'red'; children: ReactNode }) {
  const tones = {
    green: 'border-[#023020]/20 bg-[#023020]/5 text-[#023020]',
    gold: 'border-[#d9a066]/50 bg-[#d9a066]/15 text-[#5a3810]',
    red: 'border-[#b4441c]/30 bg-[#b4441c]/10 text-[#8a3214]',
  };
  return <div className={`mb-5 rounded-lg border px-4 py-3 text-sm ${tones[tone]}`}>{children}</div>;
}

export function TabLinks({ tabs }: { tabs: Array<{ href: string; label: string; active: boolean; count?: number }> }) {
  return (
    <div className="mb-5 flex flex-wrap gap-2">
      {tabs.map((t) => (
        <Link
          key={t.href}
          href={t.href}
          className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
            t.active ? 'bg-[#023020] text-[#f0e9d2]' : 'border border-[#2a2319]/15 bg-white text-[#2a2319]/75 hover:border-[#023020] hover:text-[#023020]'
          }`}
        >
          {t.label}
          {t.count !== undefined && <span className={t.active ? 'ml-1.5 text-[#f0e9d2]/70' : 'ml-1.5 text-[#2a2319]/45'}>{t.count}</span>}
        </Link>
      ))}
    </div>
  );
}

/** One label/value line for detail views. Renders nothing when empty. */
export function Detail({ term, children }: { term: string; children: ReactNode }) {
  if (children === null || children === undefined || children === '') return null;
  return (
    <div className="grid grid-cols-1 gap-0.5 py-2.5 sm:grid-cols-[160px_1fr] sm:gap-4">
      <dt className="text-sm text-[#2a2319]/60">{term}</dt>
      <dd className="whitespace-pre-wrap break-words text-[15px] text-[#2a2319]">{children}</dd>
    </div>
  );
}

export const Icon = {
  sun: <path d="M12 3v2m0 14v2m9-9h-2M5 12H3m15.36-6.36-1.42 1.42M7.06 16.94l-1.42 1.42m12.72 0-1.42-1.42M7.06 7.06 5.64 5.64M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" />,
  calendar: <path d="M8 3v3m8-3v3M4 9h16M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z" />,
  leaf: <path d="M5 19c0-8 6-14 15-14 0 9-6 15-14 15H5v-1Zm0 0 7-7" />,
  people: <path d="M16 19v-1a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v1m17 0v-1a4 4 0 0 0-3-3.87M13 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Zm3-3.87a3.5 3.5 0 0 1 0 6.75" />,
  star: <path d="m12 4 2.47 5 5.53.8-4 3.9.94 5.5L12 16.6l-4.94 2.6.94-5.5-4-3.9 5.53-.8L12 4Z" />,
  mail: <path d="M4 6h16v12H4V6Zm0 0 8 7 8-7" />,
  plus: <path d="M12 5v14m-7-7h14" />,
  phone: <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a1 1 0 0 1-1 1A16 16 0 0 1 4 5a1 1 0 0 1 1-1Z" />,
  arrowLeft: <path d="M19 12H5m6-6-6 6 6 6" />,
  download: <path d="M12 4v11m0 0-4-4m4 4 4-4M5 20h14" />,
  question: <path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6V14m0 3h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />,
  key: <path d="M15 7a2 2 0 0 1 2 2m4 0a6 6 0 0 1-7.74 5.74L11 17H9v2H7v2H4a1 1 0 0 1-1-1v-2.59a1 1 0 0 1 .29-.7l5.97-5.97A6 6 0 1 1 21 9Z" />,
  more: <path d="M5 12h.01M12 12h.01M19 12h.01" />,
  chevron: <path d="m9 6 6 6-6 6" />,
};

export function Svg({ icon, className = 'h-5 w-5' }: { icon: ReactNode; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      {icon}
    </svg>
  );
}

export function BackLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-[#2a2319]/65 hover:text-[#023020]">
      <Svg icon={Icon.arrowLeft} className="h-4 w-4" />
      {children}
    </Link>
  );
}
