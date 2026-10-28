'use server';

/**
 * Sign-in, invites, password resets and the team list.
 *
 * Until someone on the team has set their own password, the shared ADMIN_PASSWORD signs
 * you in as "Owner" so the first people can be invited. After that it stops working.
 * Every action that changes the team starts with requireSession().
 */

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { SESSION_COOKIE_NAME, isValidPassword, signSession, sessionCookieOptions } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { sendAdminLink } from '@/lib/email';
import { requireSession, teamIsActive } from './session';
import { hashPassword, checkPassword, newToken, sha256 } from './password';
import type { FormState } from './actions';

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://athymetoheal.org').replace(/\/$/, '');
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD = 10;

function str(form: FormData, key: string): string {
  const v = form.get(key);
  return typeof v === 'string' ? v.trim() : '';
}

async function startSession(subject: string): Promise<void> {
  (await cookies()).set(SESSION_COOKIE_NAME, await signSession(subject), sessionCookieOptions);
}

const slow = () => new Promise((resolve) => setTimeout(resolve, 1200)); // cheap brute-force throttle

/** Create a one-time set-password link for a team member (invite: 7 days, reset: 1 hour). */
async function createLink(userId: string, kind: 'invite' | 'reset'): Promise<string> {
  const { token, hash } = await newToken();
  const ttl = kind === 'invite' ? 7 * 24 * 60 : 60; // minutes
  const { error } = await getDb()
    .from('admin_tokens')
    .insert({ token_hash: hash, user_id: userId, expires_at: new Date(Date.now() + ttl * 60_000).toISOString() });
  if (error) throw error;
  return `${SITE_URL}/admin/set-password?token=${token}`;
}

/** Create a link and email it. Returns the link and whether the email went out. */
async function issueLink(user: { id: string; email: string; name: string }, kind: 'invite' | 'reset'): Promise<{ url: string; sent: boolean }> {
  const url = await createLink(user.id, kind);
  return { url, sent: await sendAdminLink(user.email, user.name, url, kind) };
}

// ─── Sign in / out ──────────────────────────────────────────────────────────

export async function loginAction(_prev: FormState, form: FormData): Promise<FormState> {
  const email = str(form, 'email').toLowerCase();
  const password = typeof form.get('password') === 'string' ? (form.get('password') as string) : '';
  if (!password) return { error: 'Enter your password to continue.', values: { email }, at: Date.now() };
  if (!process.env.SESSION_SECRET) return { error: "Sign-in isn't set up yet. Please contact Web Launch Academy." };

  if (email) {
    const { data: user, error } = await getDb()
      .from('admin_users')
      .select('id, password_hash')
      .eq('email', email)
      .maybeSingle();
    if (error) throw error;
    if (!user || !(await checkPassword(password, user.password_hash))) {
      await slow();
      return { error: "That email and password don't match. Try again, or use “Forgot your password?”.", values: { email }, at: Date.now() };
    }
    await getDb().from('admin_users').update({ last_login_at: new Date().toISOString() }).eq('id', user.id);
    await startSession(user.id);
    redirect('/admin');
  }

  // Shared password: only while nobody on the team has their own login yet
  if ((await teamIsActive()) || !isValidPassword(password)) {
    await slow();
    return { error: "That password didn't match. Please try again." };
  }
  await startSession('owner');
  redirect('/admin/team');
}

/** "Forgot your password?" Always answers the same way, so it can't be used to test emails. */
export async function requestResetAction(_prev: FormState, form: FormData): Promise<FormState> {
  const email = str(form, 'email').toLowerCase();
  if (!EMAIL_RE.test(email)) return { error: 'Enter the email address you sign in with.' };
  const { data: user } = await getDb().from('admin_users').select('id, email, name, password_hash').eq('email', email).maybeSingle();
  if (user) await issueLink(user, user.password_hash ? 'reset' : 'invite');
  else await slow();
  return { ok: `If ${email} is on the team, a link to set a new password is on its way. It works for 1 hour.` };
}

export async function setPasswordAction(_prev: FormState, form: FormData): Promise<FormState> {
  const token = str(form, 'token');
  const password = typeof form.get('password') === 'string' ? (form.get('password') as string) : '';
  const confirm = typeof form.get('confirm') === 'string' ? (form.get('confirm') as string) : '';

  if (password.length < MIN_PASSWORD) return { error: `Use at least ${MIN_PASSWORD} characters. A few words strung together works well.` };
  if (password !== confirm) return { error: "The two passwords don't match." };

  const db = getDb();
  const { data: row, error } = await db
    .from('admin_tokens')
    .select('token_hash, user_id, expires_at, used_at')
    .eq('token_hash', await sha256(token))
    .maybeSingle();
  if (error) throw error;
  if (!row || row.used_at || new Date(row.expires_at) < new Date()) {
    return { error: 'This link has expired or was already used. Ask for a new one from the sign-in page.' };
  }

  // Mark used first so a double-submit can't reuse it
  const { data: claimed } = await db
    .from('admin_tokens')
    .update({ used_at: new Date().toISOString() })
    .eq('token_hash', row.token_hash)
    .is('used_at', null)
    .select('token_hash');
  if (!claimed?.length) return { error: 'This link was already used. Ask for a new one from the sign-in page.' };

  const { error: upd } = await db
    .from('admin_users')
    .update({ password_hash: await hashPassword(password), last_login_at: new Date().toISOString() })
    .eq('id', row.user_id);
  if (upd) throw upd;

  await startSession(row.user_id);
  redirect('/admin?welcome=1');
}

// ─── Team ───────────────────────────────────────────────────────────────────

export async function inviteAction(_prev: FormState, form: FormData): Promise<FormState> {
  await requireSession();
  const name = str(form, 'name');
  const email = str(form, 'email').toLowerCase();
  const back = { values: { name, email }, at: Date.now() };
  if (!name) return { error: 'Add their name.', ...back };
  if (!EMAIL_RE.test(email)) return { error: "That email address doesn't look right.", ...back };

  const { data: user, error } = await getDb().from('admin_users').insert({ name, email }).select('id, email, name').single();
  if (error) {
    if (error.code === '23505') return { error: `${email} is already on the team.`, ...back };
    throw error;
  }
  const { url, sent } = await issueLink(user, 'invite');
  revalidatePath('/admin/team');
  return sent
    ? { ok: `Invite emailed to ${email}. You can also copy their link below. It works once, for 7 days.`, link: url, at: Date.now() }
    : {
        warning: `${name} was added, but the invite email couldn't be sent from here. Copy their link below and email it to them yourself. It works once, for 7 days.`,
        link: url,
        at: Date.now(),
      };
}

export async function resendInviteAction(form: FormData): Promise<void> {
  await requireSession();
  const { data: user } = await getDb().from('admin_users').select('id, email, name, password_hash').eq('id', str(form, 'id')).maybeSingle();
  if (!user) throw new Error('That person is no longer on the team.');
  await issueLink(user, user.password_hash ? 'reset' : 'invite');
  revalidatePath('/admin/team');
}

/**
 * A fresh set-password link to hand over yourself (when email isn't working, or it's quicker).
 * New people get a 7-day invite; people who already have a password get a 1-hour reset.
 */
export async function copyInviteLinkAction(id: string): Promise<{ url?: string; error?: string }> {
  await requireSession();
  const { data: user } = await getDb().from('admin_users').select('id, password_hash').eq('id', id).maybeSingle();
  if (!user) return { error: 'That person is no longer on the team.' };
  return { url: await createLink(user.id, user.password_hash ? 'reset' : 'invite') };
}

export async function removeMemberAction(form: FormData): Promise<void> {
  const me = await requireSession();
  const id = str(form, 'id');
  if (id === me.id) throw new Error("You can't remove yourself.");
  const { error } = await getDb().from('admin_users').delete().eq('id', id);
  if (error) throw error;
  revalidatePath('/admin/team');
}
