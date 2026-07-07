import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminDb } from "@/lib/firebase-admin";

export const runtime = "nodejs";

const Schema = z.object({
  id: z.string().min(1).max(200),
  status: z.enum(["confirmed", "cancelled", "noshow"]),
  idToken: z.string().min(1),
});

/** Verify a Firebase ID token via the Identity Toolkit REST API (keeps this
    route free of the Admin Auth SDK, which fails to load on Vercel). Returns
    the caller's lowercased email, or null when the token is invalid. */
async function verifyEmail(idToken: string): Promise<string | null> {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (!apiKey || !idToken) return null;
  try {
    const res = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      },
    );
    if (!res.ok) return null;
    const data = (await res.json()) as { users?: { email?: string }[] };
    const email = data.users?.[0]?.email;
    return email ? email.toLowerCase() : null;
  } catch {
    return null;
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

  const adminDb = getAdminDb();
  if (!adminDb) return NextResponse.json({ error: "no_db" }, { status: 500 });

  // Authorize the caller. The site owner/admins may change any booking; a hotel
  // owner may change bookings only for their own hotel. Being merely signed in
  // is NOT enough — otherwise any account could touch anyone's bookings.
  let isAdmin = false;
  let ownHotelId: string | null = null;
  if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
    isAdmin = true; // dev / self-host: no Firebase to verify against
  } else {
    const email = await verifyEmail(idToken);
    if (!email) {
      return NextResponse.json({ error: "not signed in" }, { status: 401 });
    }
    const ownerEmail = (process.env.NEXT_PUBLIC_OWNER_EMAIL || "").toLowerCase();
    if (ownerEmail && email === ownerEmail) {
      isAdmin = true;
    } else {
      const rSnap = await adminDb.collection("roles").doc(email).get();
      const r: Record<string, unknown> =
        (rSnap.exists ? rSnap.data() : undefined) ?? {};
      if (r.enabled === true && (r.role === "admin" || r.role === "owner")) {
        isAdmin = true;
      } else if (r.enabled === true && r.role === "hotel") {
        ownHotelId = r.hotelId ? String(r.hotelId) : null;
      }
    }
    if (!isAdmin && !ownHotelId) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }
  }

  try {
    const outcome = await adminDb.runTransaction(async (tx) => {
      const bRef = adminDb.collection("bookings").doc(id);
      const bSnap = await tx.get(bRef);
      if (!bSnap.exists) return "not_found" as const;
      const b = bSnap.data() ?? {};

      // A hotel owner may only manage bookings for their own hotel.
      if (!isAdmin && String(b.hotelId ?? "") !== ownHotelId) {
        return "forbidden" as const;
      }

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
    if (outcome === "forbidden") {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "update_failed" }, { status: 500 });
  }
}
