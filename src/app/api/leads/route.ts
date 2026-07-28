import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminDb } from "@/lib/firebase-admin";

export const runtime = "nodejs";

/** Verify a Firebase ID token via the Identity Toolkit REST API, and check the
    caller is the owner or an admin. Leads are the sales pipeline — a hotel
    owner with a dashboard login must not see who else is being approached. */
async function isAdmin(idToken: string): Promise<boolean> {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (!apiKey) return true; // dev / self-host
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
    const data = (await res.json()) as { users?: { email?: string }[] };
    const email = data.users?.[0]?.email?.toLowerCase();
    if (!email) return false;

    const ownerEmail = (process.env.NEXT_PUBLIC_OWNER_EMAIL || "").toLowerCase();
    if (ownerEmail && email === ownerEmail) return true;

    const db = getAdminDb();
    if (!db) return false;
    const r = (await db.collection("roles").doc(email).get()).data() ?? {};
    return r.enabled === true && (r.role === "admin" || r.role === "owner");
  } catch {
    return false;
  }
}

function token(req: Request): string {
  const a = req.headers.get("authorization") || "";
  return a.startsWith("Bearer ") ? a.slice(7) : "";
}

export const LEAD_STATUSES = [
  "new",
  "contacted",
  "interested",
  "listed",
  "declined",
] as const;

const CreateSchema = z.object({
  hotelName: z.string().min(1).max(120),
  city: z.string().max(60).optional(),
  phone: z.string().max(40).optional(),
  mapUrl: z.string().max(500).optional(),
  note: z.string().max(1000).optional(),
});

const UpdateSchema = z.object({
  id: z.string().min(1).max(200),
  status: z.enum(LEAD_STATUSES).optional(),
  note: z.string().max(1000).optional(),
  phone: z.string().max(40).optional(),
});

/**
 * GET — the pipeline, newest first, plus the searches that found nothing.
 *
 * Those misses are the best lead list there is: someone typed that name into
 * the site and we had no hotel to show them. They come back in the same call
 * so the panel can put them next to the pipeline.
 */
export async function GET(req: Request) {
  if (!(await isAdmin(token(req)))) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const db = getAdminDb();
  if (!db) return NextResponse.json({ items: [], misses: [] });
  try {
    const [leadSnap, missSnap] = await Promise.all([
      db.collection("leads").get(),
      db.collection("searchMisses").get(),
    ]);

    const items = leadSnap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .sort(
        (a, b) =>
          Number((b as { createdAt?: number }).createdAt ?? 0) -
          Number((a as { createdAt?: number }).createdAt ?? 0),
      );

    const misses = missSnap.docs
      .map((d) => ({
        term: String(d.data().term ?? ""),
        count: Number(d.data().count ?? 0),
      }))
      .filter((m) => m.term)
      .sort((a, b) => b.count - a.count)
      .slice(0, 12);

    return NextResponse.json({ items, misses });
  } catch {
    return NextResponse.json({ error: "read_failed" }, { status: 500 });
  }
}

/** POST — add a hotel to visit. */
export async function POST(req: Request) {
  if (!(await isAdmin(token(req)))) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  }
  const db = getAdminDb();
  if (!db) return NextResponse.json({ error: "no_db" }, { status: 500 });
  try {
    const ref = await db.collection("leads").add({
      ...parsed.data,
      status: "new",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    return NextResponse.json({ ok: true, id: ref.id });
  } catch {
    return NextResponse.json({ error: "write_failed" }, { status: 500 });
  }
}

/** PATCH — move a lead along, or leave a note after a visit. */
export async function PATCH(req: Request) {
  if (!(await isAdmin(token(req)))) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const parsed = UpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  }
  const { id, ...rest } = parsed.data;
  const db = getAdminDb();
  if (!db) return NextResponse.json({ error: "no_db" }, { status: 500 });
  try {
    await db
      .collection("leads")
      .doc(id)
      .update({ ...rest, updatedAt: Date.now() });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "write_failed" }, { status: 500 });
  }
}

/** DELETE — drop a lead entirely (?id=…). */
export async function DELETE(req: Request) {
  if (!(await isAdmin(token(req)))) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  const db = getAdminDb();
  if (!db) return NextResponse.json({ error: "no_db" }, { status: 500 });
  try {
    await db.collection("leads").doc(id).delete();
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "delete_failed" }, { status: 500 });
  }
}
