import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminDb } from "@/lib/firebase-admin";

export const runtime = "nodejs";

/** Look up the live status of the guest's own bookings. Takes the booking ids
    the device already knows and returns ONLY their status strings — no names,
    phones or other data — so it needs no auth (you must already hold the id). */
const Schema = z.object({
  ids: z.array(z.string().min(1).max(200)).max(50),
});

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
  const { ids } = parsed.data;
  if (ids.length === 0) return NextResponse.json({ statuses: {} });

  const adminDb = getAdminDb();
  if (!adminDb) return NextResponse.json({ statuses: {} });

  try {
    const refs = ids.map((id) => adminDb.collection("bookings").doc(id));
    const snaps = await adminDb.getAll(...refs);
    const statuses: Record<string, string> = {};
    for (const s of snaps) {
      // a booking with no status is a legacy row → treat as confirmed
      if (s.exists) statuses[s.id] = (s.data()?.status as string) ?? "confirmed";
    }
    return NextResponse.json({ statuses });
  } catch {
    return NextResponse.json({ statuses: {} });
  }
}
