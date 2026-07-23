import { NextResponse } from "next/server";
import { z } from "zod";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { getAdminDb } from "@/lib/firebase-admin";

export const runtime = "nodejs";

const ReviewSchema = z.object({
  hotelId: z.string().min(1).max(200),
  name: z.string().min(2).max(60),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(3).max(600),
});

/** GET /api/reviews?hotelId=… — approved reviews for a hotel (public). */
export async function GET(req: Request) {
  const hotelId = new URL(req.url).searchParams.get("hotelId");
  if (!hotelId) return NextResponse.json({ reviews: [] });
  const db = getAdminDb();
  if (!db) return NextResponse.json({ reviews: [] });
  try {
    const snap = await db
      .collection("reviews")
      .where("hotelId", "==", hotelId)
      .where("status", "==", "approved")
      .get();
    const reviews = snap.docs
      .map((d) => {
        const r = d.data();
        return {
          id: d.id,
          name: String(r.name ?? ""),
          rating: Number(r.rating ?? 0),
          comment: String(r.comment ?? ""),
          createdAt: Number(r.createdAt ?? 0),
        };
      })
      .sort((a, b) => b.createdAt - a.createdAt);
    return NextResponse.json({ reviews });
  } catch {
    return NextResponse.json({ reviews: [] });
  }
}

/** POST /api/reviews — submit a review. Stored as "pending" until an
    owner/admin approves it, so nothing unmoderated shows publicly. */
export async function POST(req: Request) {
  const ip = clientIp(req);
  const rl = rateLimit(`review:${ip}`, { limit: 3, windowMs: 60_000 });
  if (!rl.ok) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const parsed = ReviewSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  }

  const db = getAdminDb();
  if (!db) return NextResponse.json({ error: "no_db" }, { status: 500 });
  try {
    await db.collection("reviews").add({
      hotelId: parsed.data.hotelId,
      name: parsed.data.name.trim(),
      rating: parsed.data.rating,
      comment: parsed.data.comment.trim(),
      status: "pending",
      createdAt: Date.now(),
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "write_failed" }, { status: 500 });
  }
}
