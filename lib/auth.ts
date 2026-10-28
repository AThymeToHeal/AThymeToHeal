/**
 * Edge-compatible auth helpers for the /admin CMS. Uses the Web Crypto API so
 * the same code runs in both Node.js (server actions) and the Edge runtime
 * (the proxy/middleware gate).
 *
 * Env vars:
 *   SESSION_SECRET  — a random string, at least 32 chars, used to sign the cookie
 *   ADMIN_PASSWORD  — shared bootstrap password, honoured only until a team member
 *                     has set their own password (see lib/admin/session.ts)
 *
 * Copied from the WLA cms skill. Generic plumbing.
 */

export const SESSION_COOKIE_NAME = "admin_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days

function getAdminPassword(): string | null {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw) return null;
  return pw;
}

function getSessionSecret(): string | null {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) return null;
  return secret;
}

async function importHmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

function bufferToHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Constant-time string comparison. Returns true iff a and b are byte-identical.
 * Implemented in JS to stay Edge-compatible.
 */
function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

/**
 * Constant-time password comparison. Returns false (not throw) if ADMIN_PASSWORD
 * is missing — keeps the admin inaccessible without crashing requests.
 */
export function isValidPassword(input: string): boolean {
  const expected = getAdminPassword();
  if (!expected) return false;
  return constantTimeEqual(input, expected);
}

/**
 * Issue a signed session token for a subject: an admin_users id, or "owner" for the
 * shared ADMIN_PASSWORD (only honoured until someone on the team has set a password).
 * Format: `${subject}.${expiry}.${hmac}`. Throws if SESSION_SECRET is missing.
 */
export async function signSession(subject: string): Promise<string> {
  const secret = getSessionSecret();
  if (!secret) throw new Error("SESSION_SECRET env var must be set and at least 32 chars");
  const expiry = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  const payload = `${subject}.${expiry}`;
  const key = await importHmacKey(secret);
  const sigBuf = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return `${payload}.${bufferToHex(sigBuf)}`;
}

/**
 * Verify a session token. Returns the subject iff the HMAC is valid AND the expiry
 * hasn't passed, else null. Never throws: this runs in the middleware gate.
 */
export async function verifySession(token: string | undefined): Promise<string | null> {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [subject, expiryStr, hmacFromCookie] = parts;
  const expiry = parseInt(expiryStr, 10);
  if (!subject || !Number.isFinite(expiry)) return null;
  if (expiry < Math.floor(Date.now() / 1000)) return null;

  const secret = getSessionSecret();
  if (!secret) return null;

  try {
    const key = await importHmacKey(secret);
    const sigBuf = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${subject}.${expiryStr}`));
    return constantTimeEqual(hmacFromCookie, bufferToHex(sigBuf)) ? subject : null;
  } catch {
    return null;
  }
}

/** Stable secret derived from SESSION_SECRET for a purpose (e.g. the calendar feed key). */
export async function derivedKey(purpose: string): Promise<string | null> {
  const secret = getSessionSecret();
  if (!secret) return null;
  const key = await importHmacKey(secret);
  const sigBuf = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(purpose));
  return bufferToHex(sigBuf).slice(0, 40);
}

/** Constant-time compare, exported for feed keys. */
export function safeEqual(a: string, b: string): boolean {
  return constantTimeEqual(a, b);
}

export const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: SESSION_TTL_SECONDS,
};
