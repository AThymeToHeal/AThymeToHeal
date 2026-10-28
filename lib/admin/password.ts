/**
 * Password hashing with PBKDF2-SHA256 via Web Crypto, so it runs on Vercel (Node) and
 * Cloudflare Workers alike. Workers cap PBKDF2 at 100,000 iterations, hence that number.
 * Stored format: pbkdf2$<iterations>$<saltHex>$<hashHex>
 */

const ITERATIONS = 100_000;

function toHex(buf: ArrayBuffer | Uint8Array): string {
  return Array.from(buf instanceof Uint8Array ? buf : new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function fromHex(hex: string): Uint8Array {
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  return out;
}

async function derive(password: string, salt: Uint8Array, iterations: number): Promise<string> {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt: salt as BufferSource, iterations },
    key,
    256
  );
  return toHex(bits);
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  return `pbkdf2$${ITERATIONS}$${toHex(salt)}$${await derive(password, salt, ITERATIONS)}`;
}

export async function checkPassword(password: string, stored: string | null): Promise<boolean> {
  if (!stored) return false;
  const [scheme, iter, saltHex, hashHex] = stored.split('$');
  if (scheme !== 'pbkdf2' || !iter || !saltHex || !hashHex) return false;
  const actual = await derive(password, fromHex(saltHex), Number(iter));
  if (actual.length !== hashHex.length) return false;
  let diff = 0;
  for (let i = 0; i < actual.length; i++) diff |= actual.charCodeAt(i) ^ hashHex.charCodeAt(i);
  return diff === 0;
}

/** Random URL-safe token (hex) and its SHA-256, which is what gets stored. */
export async function newToken(): Promise<{ token: string; hash: string }> {
  const token = toHex(crypto.getRandomValues(new Uint8Array(32)));
  return { token, hash: await sha256(token) };
}

export async function sha256(value: string): Promise<string> {
  return toHex(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value)));
}
