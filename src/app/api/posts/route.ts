import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminDb } from "@/lib/firebase-admin";
import type { BlogPost } from "@/lib/types";

export const runtime = "nodejs";

/** Verify a Firebase ID token via the Identity Toolkit REST API. */
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

function bearer(req: Request): string {
  const a = req.headers.get("authorization") || "";
  return a.startsWith("Bearer ") ? a.slice(7) : "";
}

const PostSchema = z.object({
  id: z.string().max(200).optional(),
  slug: z.string().min(1).max(120),
  title: z.string().min(1).max(200),
  excerpt: z.string().max(400).optional(),
  content: z.string().min(1).max(40_000),
  coverImage: z.string().max(2000).optional(),
  lang: z.enum(["ckb", "kmr", "en", "ar"]),
  published: z.boolean(),
});

/** All posts (including drafts) — for the dashboard. Signed-in only. */
export async function GET(req: Request) {
  if (!(await isSignedIn(bearer(req)))) {
    return NextResponse.json({ error: "not signed in" }, { status: 401 });
  }
  const db = getAdminDb();
  if (!db) return NextResponse.json({ items: [] });
  try {
    const snap = await db.collection("posts").get();
    const items = snap.docs
      .map((d) => ({ id: d.id, ...(d.data() ?? {}) }) as BlogPost)
      .sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
    return NextResponse.json({ items });
  } catch {
    return NextResponse.json({ error: "read_failed" }, { status: 500 });
  }
}

/** Create a post, or update it when `id` is given. Signed-in only. */
export async function POST(req: Request) {
  if (!(await isSignedIn(bearer(req)))) {
    return NextResponse.json({ error: "not signed in" }, { status: 401 });
  }
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const parsed = PostSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  }
  const db = getAdminDb();
  if (!db) return NextResponse.json({ error: "no_db" }, { status: 500 });

  const { id, ...data } = parsed.data;
  try {
    // slugs must be unique so /blog/<slug> always resolves to one post
    const clash = await db
      .collection("posts")
      .where("slug", "==", data.slug)
      .get();
    if (clash.docs.some((d) => d.id !== id)) {
      return NextResponse.json({ error: "slug_taken" }, { status: 409 });
    }

    if (id) {
      await db
        .collection("posts")
        .doc(id)
        .set({ ...data, updatedAt: Date.now() }, { merge: true });
      return NextResponse.json({ ok: true, id });
    }
    const ref = await db
      .collection("posts")
      .add({ ...data, createdAt: Date.now(), updatedAt: Date.now() });
    return NextResponse.json({ ok: true, id: ref.id });
  } catch {
    return NextResponse.json({ error: "write_failed" }, { status: 500 });
  }
}

/** Delete a post. Signed-in only. */
export async function DELETE(req: Request) {
  if (!(await isSignedIn(bearer(req)))) {
    return NextResponse.json({ error: "not signed in" }, { status: 401 });
  }
  const id = new URL(req.url).searchParams.get("id") || "";
  if (!id) return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  const db = getAdminDb();
  if (!db) return NextResponse.json({ error: "no_db" }, { status: 500 });
  try {
    await db.collection("posts").doc(id).delete();
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "delete_failed" }, { status: 500 });
  }
}
