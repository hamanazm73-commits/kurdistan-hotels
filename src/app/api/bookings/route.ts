import { NextResponse } from "next/server";
import { z } from "zod";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { getAdminDb } from "@/lib/firebase-admin";
import { notifyBooking, sendBookingEmail } from "@/lib/notify";

export const runtime = "nodejs";

const BookingSchema = z.object({
  hotel: z.string().min(1).max(120),
  hotelId: z.string().min(1).max(200).optional(),
  name: z.string().min(2).max(100),
  phone: z.string().min(5).max(30),
  roomType: z.string().min(1).max(60),
  roomPrice: z.number().nonnegative().max(10_000_000),
  checkIn: z.string().min(4).max(40),
  nights: z.number().int().min(1).max(60),
});

export async function POST(req: Request) {
  // 1) rate limit — 5 bookings per IP per minute
  const ip = clientIp(req);
  const rl = rateLimit(`booking:${ip}`, { limit: 5, windowMs: 60_000 });
  if (!rl.ok) {
    return NextResponse.json(
      { error: "rate_limited" },
      {
        status: 429,
        headers: { "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)) },
      },
    );
  }

  // 2) validate input
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const parsed = BookingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_input", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  // 3) persist via Admin SDK when configured (writes bypass client rules safely)
  const adminDb = getAdminDb();
  if (!adminDb) {
    await notifyBooking(parsed.data);
    return NextResponse.json({ ok: true, persisted: false });
  }

  const { hotelId, ...booking } = parsed.data;

  try {
    // A booking is a PENDING request — no room is held until the hotel owner
    // confirms it (see /api/bookings/update). So we just save it and notify.
    let notifyEmail: string | undefined;
    if (hotelId) {
      const snap = await adminDb.collection("hotels").doc(hotelId).get();
      const em = snap.exists ? snap.data()?.notifyEmail : undefined;
      if (typeof em === "string") notifyEmail = em;
    }

    const ref = await adminDb.collection("bookings").add({
      ...booking,
      hotelId: hotelId ?? null,
      status: "pending",
      createdAt: Date.now(),
    });

    await notifyBooking(parsed.data);
    await sendBookingEmail(parsed.data, notifyEmail);
    // id lets the guest's device follow this booking's live status
    return NextResponse.json({ ok: true, persisted: true, status: "pending", id: ref.id });
  } catch {
    return NextResponse.json({ error: "write_failed" }, { status: 500 });
  }
}
