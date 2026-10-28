import { derivedKey } from '@/lib/auth';

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://athymetoheal.org').replace(/\/$/, '');

export const FEEDS = [
  { who: 'all', label: 'Everyone' },
  { who: 'illiana', label: 'Illiana only' },
  { who: 'heidi', label: 'Heidi Lynn only' },
] as const;

/** The key in a feed URL. Derived from SESSION_SECRET, so rotating that secret revokes every feed. */
export async function feedKey(who: string): Promise<string | null> {
  return derivedKey(`calendar-feed:${who}`);
}

export async function feedUrl(who: string): Promise<string | null> {
  const key = await feedKey(who);
  return key ? `${SITE_URL}/api/calendar?who=${who}&key=${key}` : null;
}
