import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminDb } from "@/lib/firebase-admin";

export const runtime = "nodejs";

const Schema = z.object({
  id: z.string().min(1).max(200),
  status: z.enum(["confirmed", "cancelled", "noshow"]),
  idToken: z.string().min(1),
});

async function isSignedIn(idToken: string): Promise<boolean> {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (!apiKey) return true; // can't verify — allow (dev/self-host)
  if (!idToken) return false;
  try {
    const res = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      },
    );
    if (!res.ok) return false;
    const data = (await res.json()) as { users?: unknown[] };
    return Array.isArray(data.users) && data.users.length > 0;
  } catch {
    return false;
  }
}

/** Build the hotel-availability patch when a held room is taken (delta -1) or
    released (delta +1) — per room type if tracked, else the hotel counter. */
function availabilityUpdate(
  data: Record<string, unknown>,
  roomType: string,
  delta: number,
): Record<string, unknown> {
  const rooms = Array.isArray(data.rooms)
    ? [...(data.rooms as Array<Record<string, unknown>>)]
    : [];
  const idx = rooms.findIndex((r) => r?.type === roomType);
  if (idx >= 0 && typeof rooms[idx]?.available === "number") {
    rooms[idx] = {
      ...rooms[idx],
      available: Math.max(0, (rooms[idx].available as number) + delta),
    };
    return { rooms };
  }
  const available = Number(data.available ?? 0);
  return { available: Math.max(0, available + delta) };
}

export async function POST(req: Request) {
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
  const { id, status, idToken } = parsed.data;

  if (!(await isSignedIn(idToken))) {
    return NextResponse.json({ error: "not signed in" }, { status: 401 });
  }

  const adminDb = getAdminDb();
  if (!adminDb) return NextResponse.json({ error: "no_db" }, { status: 500 });

  try {
    const outcome = await adminDb.runTransaction(async (tx) => {
      const bRef = adminDb.collection("bookings").doc(id);
      const bSnap = await tx.get(bRef);
      if (!bSnap.exists) return "not_found" as const;
      const b = bSnap.data() ?? {};
      const prev = (b.status as string) ?? "confirmed"; // legacy rows = confirmed
      if (prev === status) return "ok" as const;

      // Hold a room on confirm; release it when leaving confirmed.
      const delta =
        prev !== "confirmed" && status === "confirmed"
          ? -1
          : prev === "confirmed" && status !== "confirmed"
            ? 1
            : 0;

      if (delta !== 0 && b.hotelId) {
        const hRef = adminDb.collection("hotels").doc(String(b.hotelId));
        const hSnap = await tx.get(hRef);
        if (hSnap.exists) {
          const patch = availabilityUpdate(
            hSnap.data() ?? {},
            String(b.roomType ?? ""),
            delta,
          );
          tx.update(hRef, patch);
        }
      }
      tx.update(bRef, { status, updatedAt: Date.now() });
      return "ok" as const;
    });

    if (outcome === "not_found") {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "update_failed" }, { status: 500 });
  }
}
