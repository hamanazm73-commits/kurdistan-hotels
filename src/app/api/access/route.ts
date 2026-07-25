import { NextResponse } from "next/server";
import { z } from "zod";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { getAdminDb } from "@/lib/firebase-admin";

export const runtime = "nodejs";

const Body = z.object({ token: z.string().min(10).max(200) });

/** Redeem a hotel access link: given the link's secret token, return the
    throwaway account's credentials so the browser can sign in. The token IS
    the secret (it lives only in the link), so this is public but rate-limited
    and the tokens are long and unguessable. */
export async function POST(req: Request) {
  const ip = clientIp(req);
  const rl = rateLimit(`access:${ip}`, { limit: 10, windowMs: 60_000 });
  if (!rl.ok) {
    return NextResponse.json(
      { error: "rate_limited" },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)),
        },
      },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const parsed = Body.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  const db = getAdminDb();
  if (!db) return NextResponse.json({ error: "unavailable" }, { status: 503 });

  const snap = await db.doc(`accessLinks/${parsed.data.token}`).get();
  if (!snap.exists) {
    return NextResponse.json({ error: "invalid_link" }, { status: 404 });
  }
  const d = snap.data() as { email?: string; password?: string };
  if (!d.email || !d.password) {
    return NextResponse.json({ error: "invalid_link" }, { status: 404 });
  }
  return NextResponse.json({ email: d.email, password: d.password });
}
