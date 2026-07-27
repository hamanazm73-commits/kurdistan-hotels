import { NextResponse } from "next/server";
import { z } from "zod";
import { FieldValue } from "firebase-admin/firestore";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { getAdminDb } from "@/lib/firebase-admin";

export const runtime = "nodejs";

const Schema = z.object({ q: z.string().min(2).max(80) });

/**
 * POST /api/search-miss — record a search that found nothing.
 *
 * A search with no results is the one moment a visitor tells us exactly what
 * the site is missing, and today it's thrown away. Stored per normalized term
 * with a count, so the dashboard can rank what to add next. Best-effort: this
 * must never slow down or break searching.
 */
export async function POST(req: Request) {
  const ip = clientIp(req);
  const rl = rateLimit(`miss:${ip}`, { limit: 20, windowMs: 60_000 });
  if (!rl.ok) return NextResponse.json({ ok: false }, { status: 429 });

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

  // one row per term, however it was typed
  const term = parsed.data.q.trim().toLowerCase().replace(/\s+/g, " ");
  if (!term) return NextResponse.json({ ok: false });

  const db = getAdminDb();
  if (!db) return NextResponse.json({ ok: false });
  try {
    // the doc id is a hash-free slug of the term, so repeats land on one row
    const id = encodeURIComponent(term).slice(0, 200);
    await db
      .collection("searchMisses")
      .doc(id)
      .set(
        { term, count: FieldValue.increment(1), lastAt: Date.now() },
        { merge: true },
      );
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false });
  }
}
