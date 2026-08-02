import { createHmac, timingSafeEqual } from "crypto";

/**
 * Short-lived HMAC token that lets the "guest" NextAuth provider establish a
 * session for a shadow guest account right after `continueAsGuest` creates it.
 * Guests have no password, so this is the only way their session can be minted
 * — and only server code holding AUTH_SECRET can issue a valid token.
 */

const TOKEN_TTL_MS = 10 * 60 * 1000; // 10 minutes

function secret(): string {
  const s = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
  if (!s) throw new Error("AUTH_SECRET is not set");
  return s;
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("hex");
}

export function createGuestToken(userId: string): string {
  const exp = Date.now() + TOKEN_TTL_MS;
  const payload = `${userId}.${exp}`;
  return `${payload}.${sign(payload)}`;
}

/** Returns the userId if the token is valid and unexpired, else null. */
export function verifyGuestToken(
  token: string | undefined | null
): string | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [userId, expStr, sig] = parts;
  const exp = Number(expStr);
  if (!Number.isFinite(exp) || exp < Date.now()) return null;
  const expected = sign(`${userId}.${expStr}`);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  return userId;
}
