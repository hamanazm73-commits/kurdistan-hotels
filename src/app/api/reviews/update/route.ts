import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminDb } from "@/lib/firebase-admin";
import type { Firestore } from "firebase-admin/firestore";

export const runtime = "nodejs";

/** Verify a Firebase ID token via the Identity Toolkit REST API. Returns the
    caller's lowercased email, or null when the token is invalid. */
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

/** Who is the caller: an admin (all reviews) or a hotel owner (their hotel
    only). Returns null when the token/role is not authorized. */
async function resolveScope(
  db: Firestore,
  idToken: string,
): Promise<{ isAdmin: boolean; ownHotelId: string | null } | null> {
  if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
    return { isAdmin: true, ownHotelId: null }; // dev / self-host
  }
  const email = await verifyEmail(idToken);
  if (!email) return null;
  const ownerEmail = (process.env.NEXT_PUBLIC_OWNER_EMAIL || "").toLowerCase();
  if (ownerEmail && email === ownerEmail) {
    return { isAdmin: true, ownHotelId: null };
  }
  const r: Record<string, unknown> =
    (await db.collection("roles").doc(email).get()).data() ?? {};
  if (r.enabled === true && (r.role === "admin" || r.role === "owner")) {
    return { isAdmin: true, ownHotelId: null };
  }
  if (r.enabled === true && r.role === "hotel") {
    return { isAdmin: false, ownHotelId: r.hotelId ? String(r.hotelId) : null };
  }
  return null;
}

const Schema = z.object({
  idToken: z.string().min(1),
  // present => update mode; absent => list mode
  id: z.string().min(1).max(200).optional(),
  status: z.enum(["approved", "rejected", "pending"]).optional(),
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
  const { idToken, id, status } = parsed.data;

  const db = getAdminDb();
  if (!db) return NextResponse.json({ error: "no_db" }, { status: 500 });

  const scope = await resolveScope(db, idToken);
  if (!scope) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  // ---- LIST mode: return reviews the caller may moderate ----
  if (!id || !status) {
    try {
      const q = scope.isAdmin
        ? db.collection("reviews")
        : db
            .collection("reviews")
            .where("hotelId", "==", scope.ownHotelId ?? "__none__");
      const snap = await q.get();
      const reviews = snap.docs
        .slice()
        .sort(
          (a, b) => Number(b.data().createdAt ?? 0) - Number(a.data().createdAt ?? 0),
        )
        .map((d) => ({ id: d.id, ...d.data() }));
      return NextResponse.json({ reviews });
    } catch {
      return NextResponse.json({ error: "read_failed" }, { status: 500 });
    }
  }

  // ---- UPDATE mode: approve / reject a review ----
  try {
    const ref = db.collection("reviews").doc(id);
    const snap = await ref.get();
    if (!snap.exists) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }
    const rv = snap.data() ?? {};
    if (!scope.isAdmin && String(rv.hotelId ?? "") !== scope.ownHotelId) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }
    await ref.update({ status });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "update_failed" }, { status: 500 });
  }
}
