import { NextResponse } from "next/server";
import { z } from "zod";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { notifyClientError } from "@/lib/notify";

export const runtime = "nodejs";

const Schema = z.object({
  message: z.string().min(1).max(500),
  digest: z.string().max(120).optional(),
  path: z.string().max(300).optional(),
  ua: z.string().max(300).optional(),
});

/**
 * POST /api/client-error — a visitor hit the error screen.
 *
 * Until now a broken page was invisible: the visitor saw "something went
 * wrong", left, and nobody found out. Rate limited hard, because a genuinely
 * broken page can throw for every visitor at once and the point is to learn
 * that it's broken, not to receive a thousand messages about it.
 */
export async function POST(req: Request) {
  const ip = clientIp(req);
  const rl = rateLimit(`err:${ip}`, { limit: 3, windowMs: 300_000 });
  if (!rl.ok) return NextResponse.json({ ok: false }, { status: 429 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  }

  await notifyClientError(parsed.data);
  return NextResponse.json({ ok: true });
}
