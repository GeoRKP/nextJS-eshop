/**
 * Simple in-memory rate limiter for single-instance deployments.
 * For multi-instance, replace with @upstash/ratelimit + Redis.
 */

import { headers } from "next/headers";

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

// Cleanup stale entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitMap) {
    if (now > value.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}, 5 * 60 * 1000);

/**
 * Client address to key rate limits on.
 *
 * Each hop appends to X-Forwarded-For, so anything the client sent itself sits
 * at the FRONT of the list and the address our own reverse proxy observed sits
 * at the END. Reading the first entry lets an attacker choose their own bucket
 * and sidestep every limit, so read the last one.
 */
export async function clientIp(): Promise<string> {
  const h = await headers();
  const forwarded = h
    .get("x-forwarded-for")
    ?.split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  if (forwarded?.length) {
    return forwarded[forwarded.length - 1];
  }

  return h.get("x-real-ip")?.trim() || "unknown";
}

export function rateLimit({
  key,
  limit,
  windowMs,
}: {
  key: string;
  limit: number;
  windowMs: number;
}): { success: boolean; remaining: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
    return { success: true, remaining: limit - 1 };
  }

  if (entry.count >= limit) {
    return { success: false, remaining: 0 };
  }

  entry.count++;
  return { success: true, remaining: limit - entry.count };
}
