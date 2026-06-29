/**
 * Tiny in-memory sliding-window rate limiter.
 *
 * Good enough for a single Node instance (which is what `next start`
 * runs). For multi-instance / serverless deployments swap the Map for
 * Upstash Redis or Vercel KV — the interface stays the same.
 */
type Hit = { count: number; resetAt: number };

const buckets = new Map<string, Hit>();

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  resetAt: number;
}

export function rateLimit(
  key: string,
  { limit = 5, windowMs = 60_000 }: { limit?: number; windowMs?: number } = {},
): RateLimitResult {
  const now = Date.now();
  const hit = buckets.get(key);

  if (!hit || hit.resetAt < now) {
    const resetAt = now + windowMs;
    buckets.set(key, { count: 1, resetAt });
    return { ok: true, remaining: limit - 1, resetAt };
  }

  hit.count += 1;
  const ok = hit.count <= limit;
  return { ok, remaining: Math.max(0, limit - hit.count), resetAt: hit.resetAt };
}

/** Best-effort client IP from request headers. */
export function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "unknown";
}

// periodic cleanup so the map doesn't grow forever
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [k, v] of buckets) if (v.resetAt < now) buckets.delete(k);
  }, 5 * 60_000).unref?.();
}
