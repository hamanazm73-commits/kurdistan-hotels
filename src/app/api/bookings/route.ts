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
    // Transaction: check availability, decrement the hotel by 1, save booking.
    const outcome = await adminDb.runTransaction(async (tx) => {
      let roomsLeft: number | null = null;
      let notifyEmail: string | undefined;

      if (hotelId) {
        const hotelRef = adminDb.collection("hotels").doc(hotelId);
        const snap = await tx.get(hotelRef);
        if (snap.exists) {
          const data = snap.data() ?? {};
          if (typeof data.notifyEmail === "string") notifyEmail = data.notifyEmail;
          const rooms = Array.isArray(data.rooms) ? [...data.rooms] : [];
          const idx = rooms.findIndex((r) => r?.type === booking.roomType);
          const roomTracked =
            idx >= 0 && typeof rooms[idx]?.available === "number";
          const available = Number(data.available ?? 0);

          // When the booked room type tracks availability, it decides sold-out;
          // otherwise fall back to the hotel-level counter.
          if (roomTracked) {
            const roomAvail = Number(rooms[idx].available);
            if (roomAvail <= 0) return { soldOut: true as const };
            rooms[idx] = { ...rooms[idx], available: roomAvail - 1 };
          } else if (available <= 0) {
            return { soldOut: true as const };
          }

          const update: Record<string, unknown> = {};
          if (roomTracked) update.rooms = rooms;
          if (available > 0) update.available = available - 1;
          if (Object.keys(update).length > 0) tx.update(hotelRef, update);

          roomsLeft = roomTracked
            ? Number(rooms[idx].available)
            : Math.max(0, available - 1);
        }
      }

      const bookingRef = adminDb.collection("bookings").doc();
      tx.set(bookingRef, {
        ...booking,
        hotelId: hotelId ?? null,
        createdAt: Date.now(),
      });
      return { soldOut: false as const, roomsLeft, notifyEmail };
    });

    if (outcome.soldOut) {
      return NextResponse.json({ error: "sold_out" }, { status: 409 });
    }
    await notifyBooking(parsed.data);
    await sendBookingEmail(parsed.data, outcome.notifyEmail);
    return NextResponse.json({
      ok: true,
      persisted: true,
      roomsLeft: outcome.roomsLeft,
    });
  } catch {
    return NextResponse.json({ error: "write_failed" }, { status: 500 });
  }
}
