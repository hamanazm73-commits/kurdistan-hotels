import { NextResponse } from "next/server";
import { z } from "zod";
import { FieldValue } from "firebase-admin/firestore";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { getAdminDb } from "@/lib/firebase-admin";

export const runtime = "nodejs";

const Schema = z.object({ hotelId: z.string().min(1).max(200) });

/** POST /api/views — bump a hotel's view counter by one. The client only calls
    this once per session per hotel, and it's rate-limited, to keep counts sane. */
export async function POST(req: Request) {
  const ip = clientIp(req);
  const rl = rateLimit(`view:${ip}`, { limit: 40, windowMs: 60_000 });
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

  const db = getAdminDb();
  if (!db) return NextResponse.json({ ok: false });
  try {
    await db
      .collection("hotels")
      .doc(parsed.data.hotelId)
      .update({ views: FieldValue.increment(1) });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
