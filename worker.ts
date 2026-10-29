/**
 * Cloudflare Worker entry (wrangler.jsonc → main).
 *
 * Wraps the worker OpenNext generates so Cloudflare Cron Triggers can run the same
 * daily routes Vercel Cron runs (vercel.json → crons). Cloudflare ignores
 * vercel.json, so without this the keep-alive and the reminder emails never fire.
 *
 * Each trigger in wrangler.jsonc → triggers.crons maps to one route below, called
 * in-process with `Authorization: Bearer <CRON_SECRET>`, the header the routes
 * already check. CRON_SECRET must be set as a Worker secret.
 *
 * Excluded from tsconfig: .open-next/worker.js only exists after `opennextjs-cloudflare build`.
 */

// @ts-ignore generated at build time
import { default as handler } from './.open-next/worker.js';

const CRON_ROUTES: Record<string, string> = {
  '17 9 * * *': '/api/cron/keepalive',
  '10 16 * * *': '/api/cron/reminders', // 10 min after Vercel's run, so while both hosts are live, reminder_sent_at stops a double send
};

type Env = { CRON_SECRET?: string } & Record<string, unknown>;
type Ctx = { waitUntil(p: Promise<unknown>): void; passThroughOnException(): void };

export default {
  fetch: handler.fetch,

  async scheduled(controller: { cron: string }, env: Env, ctx: Ctx) {
    const path = CRON_ROUTES[controller.cron];
    if (!path) {
      console.error(`[cron] no route for trigger "${controller.cron}"`);
      return;
    }
    const req = new Request(`https://cron.internal${path}`, {
      headers: { authorization: `Bearer ${env.CRON_SECRET ?? ''}` },
    });
    const res: Response = await handler.fetch(req, env, ctx);
    const body = await res.text();
    if (!res.ok) throw new Error(`[cron] ${path} → ${res.status} ${body.slice(0, 200)}`);
    console.log(`[cron] ${path} → ${res.status} ${body.slice(0, 200)}`);
  },
};

// @ts-ignore generated at build time
export { DOQueueHandler, DOShardedTagCache, BucketCachePurge } from './.open-next/worker.js';
