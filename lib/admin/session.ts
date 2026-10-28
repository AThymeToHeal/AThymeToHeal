import { cache } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { SESSION_COOKIE_NAME, verifySession } from '@/lib/auth';
import { getDb } from '@/lib/db';

export interface AdminUser {
  id: string; // admin_users id, or "owner" for the shared bootstrap password
  name: string;
  email: string | null;
}

export const OWNER: AdminUser = { id: 'owner', name: 'Owner', email: null };

/**
 * True once anyone on the team has set their own password. From then on the shared
 * ADMIN_PASSWORD (and any session signed with it) stops working.
 */
export async function teamIsActive(): Promise<boolean> {
  const { count, error } = await getDb()
    .from('admin_users')
    .select('id', { count: 'exact', head: true })
    .not('password_hash', 'is', null);
  if (error) throw error;
  return (count ?? 0) > 0;
}

/**
 * The signed-in person, or null. Checks the database so removed people are locked out at once.
 * Memoised per request: pages call requireSession() from several data reads.
 */
export const currentUser = cache(async (): Promise<AdminUser | null> => {
  const subject = await verifySession((await cookies()).get(SESSION_COOKIE_NAME)?.value);
  if (!subject) return null;

  if (subject === 'owner') return (await teamIsActive()) ? null : OWNER;

  const { data, error } = await getDb()
    .from('admin_users')
    .select('id, name, email, password_hash')
    .eq('id', subject)
    .maybeSingle();
  if (error) throw error;
  if (!data || !data.password_hash) return null;
  return { id: data.id, name: data.name, email: data.email };
});

/**
 * Authorisation gate for /admin. The middleware protects page routes, but server
 * actions are public POST endpoints, so every action and every admin data read
 * calls this first. Never remove it from one.
 * Signed-out callers are redirected to /admin/login, never shown data.
 */
export async function requireSession(): Promise<AdminUser> {
  const user = await currentUser();
  // Expired, revoked or removed: send them to sign in (works from pages and server actions alike)
  if (!user) redirect('/admin/login');
  return user;
}
