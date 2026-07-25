// Shared helper for the /admin session cookie. Edge-safe: uses only the global
// Web Crypto API (available in both the middleware edge runtime and Node 18+
// route handlers), so it can be imported from middleware.ts and route handlers
// alike. Do NOT import node-only modules here.

export const ADMIN_COOKIE = 'admin_session';

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const buf = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * The value a valid session cookie must hold: a hash derived from the server
 * secret, so the raw secret is never placed in the cookie. Rotating
 * ADMIN_SESSION_SECRET invalidates all existing sessions.
 */
export async function sessionToken(): Promise<string> {
  const secret =
    process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || 'dev-insecure-secret';
  return sha256Hex('admin-session:' + secret);
}

/** True if the request's cookie matches the expected session token. */
export async function hasValidSession(cookieValue: string | undefined): Promise<boolean> {
  if (!cookieValue) return false;
  return cookieValue === (await sessionToken());
}
