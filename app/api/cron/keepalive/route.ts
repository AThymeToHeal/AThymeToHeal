import { NextResponse } from 'next/server';
import { getDb, TABLES } from '@/lib/db';

/**
 * Daily database keep-alive (vercel.json → crons).
 *
 * Supabase pauses a FREE-plan project after 7 days without activity, and a paused
 * project means the booking form fails. This route runs one tiny read every day.
 *
 * Vercel Cron sends `Authorization: Bearer <CRON_SECRET>` when the CRON_SECRET env
 * var is set on the project. Anything else gets 401, including every request when
 * CRON_SECRET is not set.
 */

export const dynamic = 'force-dynamic';

function authorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return request.headers.get('authorization') === `Bearer ${secret}`;
}

export async function GET(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  // One cheap read (head request: no rows come back).
  const { error } = await getDb().from(TABLES.FAQS).select('id', { head: true, count: 'exact' }).limit(1);
  if (error) {
    console.error(`[keepalive] Supabase read failed: ${error.code ?? ''} ${error.message}`);
    return NextResponse.json({ ok: false, code: 'db_error' }, { status: 500 });
  }
  return NextResponse.json({ ok: true, at: new Date().toISOString() });
}
