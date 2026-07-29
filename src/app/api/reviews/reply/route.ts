import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminDb } from "@/lib/firebase-admin";

export const runtime = "nodejs";

const Schema = z.object({
  idToken: z.string().min(1),
  id: z.string().min(1).max(200),
  /** empty string removes an existing reply */
  reply: z.string().max(1000),
});

/** The caller's lowercased email, via the Identity Toolkit REST API. */
async function callerEmail(idToken: string): Promise<string | null> {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (!apiKey) return "dev@local"; // dev / self-host
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

/**
 * POST /api/reviews/reply — the hotel answers a review about itself.
 *
 * Separate from /api/reviews/update on purpose. Moderation decides whether a
 * review is published at all and stays with the platform, because a hotel that
 * can bury criticism makes every rating on the site worthless. Replying is the
 * opposite: it's the hotel's own voice next to the complaint, and a measured
 * answer usually does more for a reader's trust than the complaint costs.
 *
 * So a hotel owner may reply — but only on reviews of their own hotel, and only
 * on ones already approved. Admins may reply to any.
 */
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
  const { idToken, id, reply } = parsed.data;

  const db = getAdminDb();
  if (!db) return NextResponse.json({ error: "no_db" }, { status: 500 });

  const email = await callerEmail(idToken);
  if (!email) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const ownerEmail = (process.env.NEXT_PUBLIC_OWNER_EMAIL || "").toLowerCase();
  const role = (await db.collection("roles").doc(email).get()).data() ?? {};
  const isAdmin =
    (ownerEmail && email === ownerEmail) ||
    (role.enabled === true && (role.role === "admin" || role.role === "owner"));
  const ownHotelId =
    role.enabled === true && role.role === "hotel"
      ? String(role.hotelId ?? "")
      : "";

  if (!isAdmin && !ownHotelId) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  try {
    const ref = db.collection("reviews").doc(id);
    const snap = await ref.get();
    if (!snap.exists) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }
    const rv = snap.data() ?? {};

    if (!isAdmin) {
      if (String(rv.hotelId ?? "") !== ownHotelId) {
        return NextResponse.json({ error: "forbidden" }, { status: 403 });
      }
      // replying to something not yet published would be answering into the void
      if (rv.status !== "approved") {
        return NextResponse.json({ error: "not_published" }, { status: 409 });
      }
    }

    const text = reply.trim();
    await ref.update(
      text
        ? { reply: text, repliedAt: Date.now() }
        : { reply: "", repliedAt: Date.now() },
    );
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "update_failed" }, { status: 500 });
  }
}
