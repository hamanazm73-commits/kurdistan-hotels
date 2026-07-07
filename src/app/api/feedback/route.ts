import { NextResponse } from "next/server";
import { z } from "zod";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { getAdminDb } from "@/lib/firebase-admin";
import { notifyFeedback } from "@/lib/notify";
import type { Feedback } from "@/lib/types";

export const runtime = "nodejs";

const FeedbackSchema = z.object({
  name: z.string().max(100).optional(),
  contact: z.string().max(120).optional(),
  rating: z.number().int().min(1).max(5).optional(),
  message: z.string().min(2).max(2000),
  page: z.string().max(300).optional(),
});

/** Verify a Firebase ID token via the Identity Toolkit REST API (no admin/auth
    needed). Returns true when the token belongs to a real signed-in user. */
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

/** Create a feedback entry. Public + rate-limited; the write goes through the
    Admin SDK so no client rules are involved. */
export async function POST(req: Request) {
  const ip = clientIp(req);
  const rl = rateLimit(`feedback:${ip}`, { limit: 4, windowMs: 60_000 });
  if (!rl.ok) {
    return NextResponse.json(
      { error: "rate_limited" },
      {
        status: 429,
        headers: { "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)) },
      },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const parsed = FeedbackSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  }

  const adminDb = getAdminDb();
  if (!adminDb) {
    await notifyFeedback(parsed.data);
    return NextResponse.json({ ok: true, persisted: false });
  }

  try {
    await adminDb
      .collection("feedback")
      .add({ ...parsed.data, createdAt: Date.now() });
    await notifyFeedback(parsed.data);
    return NextResponse.json({ ok: true, persisted: true });
  } catch {
    return NextResponse.json({ error: "write_failed" }, { status: 500 });
  }
}

/** List feedback for the admin panel. Requires a signed-in user (bearer token);
    reads via the Admin SDK so no client rules are needed. */
export async function GET(req: Request) {
  const auth = req.headers.get("authorization") || "";
  const idToken = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!(await isSignedIn(idToken))) {
    return NextResponse.json({ error: "not signed in" }, { status: 401 });
  }

  const adminDb = getAdminDb();
  if (!adminDb) return NextResponse.json({ items: [] });

  try {
    const snap = await adminDb
      .collection("feedback")
      .orderBy("createdAt", "desc")
      .limit(200)
      .get();
    const items = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Feedback) }));
    return NextResponse.json({ items });
  } catch {
    return NextResponse.json({ error: "read_failed" }, { status: 500 });
  }
}

/** Delete one feedback entry (signed-in only). */
export async function DELETE(req: Request) {
  const auth = req.headers.get("authorization") || "";
  const idToken = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!(await isSignedIn(idToken))) {
    return NextResponse.json({ error: "not signed in" }, { status: 401 });
  }
  const id = new URL(req.url).searchParams.get("id") || "";
  if (!id) return NextResponse.json({ error: "invalid_input" }, { status: 400 });

  const adminDb = getAdminDb();
  if (!adminDb) return NextResponse.json({ error: "no_db" }, { status: 500 });

  try {
    await adminDb.collection("feedback").doc(id).delete();
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "delete_failed" }, { status: 500 });
  }
}
