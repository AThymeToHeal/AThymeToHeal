import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: { default: 'Admin', template: '%s · Admin | A Thyme to Heal' },
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <div className="admin-root min-h-screen bg-[#faf7ee] text-[#2a2319]">{children}</div>;
}
