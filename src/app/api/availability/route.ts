import { NextResponse } from "next/server";
import { z } from "zod";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { getAdminDb } from "@/lib/firebase-admin";

export const runtime = "nodejs";

const Schema = z.object({
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

/** ISO date + n days, still as "YYYY-MM-DD" so it compares as a plain string. */
function addDays(iso: string, n: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

/** A stay [checkIn, checkOut) overlaps [from, to) when it starts before the
    range ends and ends after the range starts. */
function overlaps(checkIn: string, nights: number, from: string, to: string) {
  const checkOut = addDays(checkIn, Math.max(1, nights));
  return checkIn < to && checkOut > from;
}

/**
 * Bookings that hold a room.
 *
 * Only confirmed ones, because only confirming decrements a hotel's counter —
 * a pending request hasn't taken anything yet. Counting them here would inflate
 * the derived capacity (available already excludes confirmed holds, so adding
 * pending on top invents rooms that don't exist). A legacy row with no status
 * is treated as confirmed, as it is everywhere else.
 */
function holdsARoom(status: unknown): boolean {
  return status === "confirmed" || status === undefined;
}

/**
 * POST /api/availability — which hotels have a room free between two dates.
 *
 * Availability on a hotel is a single live counter, not a calendar: confirming
 * a booking for next August decrements it today. So a hotel's real capacity is
 * derived — what's free now, plus what current bookings are holding — and the
 * free count for a range is that capacity minus the bookings overlapping it.
 *
 * Bookings are private, so this runs on the server and returns only counts:
 * no names, phones or dates leave here.
 */
export async function POST(req: Request) {
  const ip = clientIp(req);
  const rl = rateLimit(`avail:${ip}`, { limit: 30, windowMs: 60_000 });
  if (!rl.ok) return NextResponse.json({ hotels: {} }, { status: 429 });

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
  const { from, to } = parsed.data;
  if (to <= from) {
    return NextResponse.json({ error: "invalid_range" }, { status: 400 });
  }

  const db = getAdminDb();
  if (!db) return NextResponse.json({ hotels: {} });

  try {
    const [hotelSnap, bookingSnap] = await Promise.all([
      db.collection("hotels").get(),
      db.collection("bookings").get(),
    ]);

    // per hotel: how many rooms of each type are held now, and in the range
    const heldNow = new Map<string, Map<string, number>>();
    const heldRange = new Map<string, Map<string, number>>();
    const bump = (m: Map<string, Map<string, number>>, h: string, t: string) => {
      const inner = m.get(h) ?? new Map<string, number>();
      inner.set(t, (inner.get(t) ?? 0) + 1);
      m.set(h, inner);
    };

    for (const d of bookingSnap.docs) {
      const b = d.data();
      const hotelId = String(b.hotelId ?? "");
      if (!hotelId || !holdsARoom(b.status)) continue;
      const type = String(b.roomType ?? "");
      const checkIn = String(b.checkIn ?? "");
      const nights = Number(b.nights) || 1;
      if (!checkIn) continue;

      bump(heldNow, hotelId, type);
      if (overlaps(checkIn, nights, from, to)) bump(heldRange, hotelId, type);
    }

    const hotels: Record<string, { free: number; rooms: Record<string, number> }> =
      {};

    for (const d of hotelSnap.docs) {
      const h = d.data();
      if (h.hidden) continue;
      const now = heldNow.get(d.id) ?? new Map<string, number>();
      const range = heldRange.get(d.id) ?? new Map<string, number>();
      const rooms: Record<string, number> = {};
      let free = 0;

      const list = Array.isArray(h.rooms) ? h.rooms : [];
      for (const r of list) {
        const type = String(r?.type ?? "");
        if (!type) continue;
        // an untracked room type has no count to reason about; the owner isn't
        // managing its inventory, so don't hide the hotel over it
        if (typeof r?.available !== "number") {
          rooms[type] = 1;
          free += 1;
          continue;
        }
        const capacity = r.available + (now.get(type) ?? 0);
        const n = Math.max(0, capacity - (range.get(type) ?? 0));
        rooms[type] = n;
        free += n;
      }

      hotels[d.id] = { free, rooms };
    }

    return NextResponse.json({ hotels });
  } catch {
    return NextResponse.json({ hotels: {} });
  }
}
