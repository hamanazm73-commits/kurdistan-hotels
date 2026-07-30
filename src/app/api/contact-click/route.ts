import { NextResponse } from "next/server";
import { z } from "zod";
import { FieldValue } from "firebase-admin/firestore";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { getAdminDb } from "@/lib/firebase-admin";

export const runtime = "nodejs";

const Schema = z.object({
  hotelId: z.string().min(1).max(200),
  kind: z.enum(["whatsapp", "call", "map"]),
});

/** Keep the recent-stamp array bounded; 30 days is what the panel reports on. */
const WINDOW_MS = 30 * 86_400_000;
const MAX_STAMPS = 300;

/**
 * POST /api/contact-click — record that a guest tapped WhatsApp, call or map
 * on a hotel.
 *
 * A view says someone looked; this says someone tried to reach the hotel, and
 * that is the number an owner actually cares about when deciding whether being
 * listed is worth anything. Kept as pruned timestamps so the dashboard can say
 * "this month" honestly rather than quoting a total that only ever grows.
 */
export async function POST(req: Request) {
  const ip = clientIp(req);
  const rl = rateLimit(`click:${ip}`, { limit: 40, windowMs: 60_000 });
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
  const { hotelId, kind } = parsed.data;

  const db = getAdminDb();
  if (!db) return NextResponse.json({ ok: false });
  try {
    const ref = db.collection("hotels").doc(hotelId);
    const now = Date.now();
    const prev = (await ref.get()).data()?.contactClicksAt;

    // Each entry carries when and how, so the owner can line an unexplained
    // WhatsApp message up against a tap a minute earlier. That matching is the
    // only attribution that holds: the text we prefill is a draft in the
    // guest's own app and they can clear it before sending.
    //
    // Older rows are bare timestamps; keep reading those rather than dropping
    // the history when the shape changed.
    const kept = (Array.isArray(prev) ? prev : [])
      .map((e) =>
        typeof e === "number"
          ? { at: e, kind: "" }
          : { at: Number(e?.at), kind: String(e?.kind ?? "") },
      )
      .filter((e) => Number.isFinite(e.at) && now - e.at < WINDOW_MS);

    await ref.update({
      // a lifetime total, for the owner's own sense of scale
      [`contactClicks.${kind}`]: FieldValue.increment(1),
      contactClicksAt: [{ at: now, kind }, ...kept].slice(0, MAX_STAMPS),
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false });
  }
}
