import { NextResponse } from "next/server";
import { z } from "zod";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { getAdminDb } from "@/lib/firebase-admin";
import { notifyHotelApplication } from "@/lib/notify";

export const runtime = "nodejs";

const Schema = z.object({
  hotelName: z.string().min(2).max(120),
  city: z.string().min(2).max(60),
  contactName: z.string().min(2).max(100),
  phone: z.string().min(6).max(40),
  rooms: z.number().int().min(0).max(10_000).optional(),
  note: z.string().max(1000).optional(),
});

/**
 * POST /api/hotel-application — a hotel owner asking to be listed.
 *
 * Owners could already call or email, which meant every listing started as a
 * back-and-forth to collect the same handful of facts. This captures them once
 * and lands in the dashboard, so the conversation starts from a filled form.
 *
 * Deliberately not a self-serve signup: the listing is still created by hand
 * after a real conversation, which is what keeps the directory honest.
 */
export async function POST(req: Request) {
  const ip = clientIp(req);
  const rl = rateLimit(`apply:${ip}`, { limit: 5, windowMs: 600_000 });
  if (!rl.ok) return NextResponse.json({ error: "rate_limited" }, { status: 429 });

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

  const application = {
    ...parsed.data,
    status: "new" as const,
    createdAt: Date.now(),
  };

  const db = getAdminDb();
  if (db) {
    try {
      await db.collection("hotelApplications").add(application);
    } catch {
      /* fall through — the notification still gets it to a human */
    }
  }

  await notifyHotelApplication(application);
  return NextResponse.json({ ok: true });
}
