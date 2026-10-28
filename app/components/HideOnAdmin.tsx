'use client';

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

/** Renders its children everywhere except the /admin area, which has its own chrome. */
export default function HideOnAdmin({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (pathname?.startsWith('/admin')) return null;
  return <>{children}</>;
}
