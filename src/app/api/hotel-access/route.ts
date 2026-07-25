import { NextResponse } from "next/server";
import { z } from "zod";
import { randomBytes } from "crypto";
import { getAdminDb } from "@/lib/firebase-admin";
import { requireAdmin, bearer } from "@/lib/api-auth";

export const runtime = "nodejs";

const SITE = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://hotelskurdistan.com"
).replace(/\/$/, "");
// synthetic, non-deliverable login accounts live under this domain so they can
// be told apart from real admin/owner emails.
const ACCESS_DOMAIN = "link.hotelskurdistan.com";

const rand = (n: number) => randomBytes(n).toString("base64url");

function linkUrl(token: string) {
  return `${SITE}/access/${token}`;
}

/** Create a Firebase email/password account via the Identity Toolkit REST API
    (no firebase-admin/auth). Returns true on success. */
async function signUpAccount(email: string, password: string): Promise<boolean> {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (!apiKey) return false;
  try {
    const res = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, returnSecureToken: false }),
      },
    );
    return res.ok;
  } catch {
    return false;
  }
}

const Body = z.object({
  hotelId: z.string().min(1).max(200),
  regenerate: z.boolean().optional(),
});

/** Current login link for a hotel (if one exists). Admin only. */
export async function GET(req: Request) {
  if (!(await requireAdmin(bearer(req)))) {
    return NextResponse.json({ error: "forbidden" }, { status: 401 });
  }
  const hotelId = new URL(req.url).searchParams.get("hotelId") || "";
  if (!hotelId) return NextResponse.json({ error: "no_hotel" }, { status: 400 });
  const db = getAdminDb();
  if (!db) return NextResponse.json({ url: null });
  const snap = await db.doc(`hotelAccess/${hotelId}`).get();
  const token = snap.data()?.token as string | undefined;
  return NextResponse.json({ url: token ? linkUrl(token) : null });
}

/** Create (or regenerate) a hotel owner's login link. Admin only. */
export async function POST(req: Request) {
  if (!(await requireAdmin(bearer(req)))) {
    return NextResponse.json({ error: "forbidden" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const parsed = Body.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  }
  const { hotelId, regenerate } = parsed.data;

  const db = getAdminDb();
  if (!db) {
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }

  const hotelSnap = await db.doc(`hotels/${hotelId}`).get();
  if (!hotelSnap.exists) {
    return NextResponse.json({ error: "hotel_not_found" }, { status: 404 });
  }
  const hotelName = (hotelSnap.data()?.name as string) ?? "";

  const ptrRef = db.doc(`hotelAccess/${hotelId}`);
  const existing = (await ptrRef.get()).data() as
    | { token?: string; email?: string }
    | undefined;

  // reuse the existing link unless the admin explicitly regenerates
  if (existing?.token && !regenerate) {
    return NextResponse.json({ url: linkUrl(existing.token), email: existing.email });
  }

  // revoke the previous link: disable its role and drop its token mapping
  if (existing) {
    if (existing.email) {
      await db
        .doc(`roles/${existing.email}`)
        .set({ enabled: false }, { merge: true })
        .catch(() => {});
    }
    if (existing.token) {
      await db.doc(`accessLinks/${existing.token}`).delete().catch(() => {});
    }
  }

  // a fresh throwaway account so we always know its password (no reset needed).
  // lowercase throughout: Firebase lowercases the token email, and both the
  // role doc id and the security rules key on the lowercased email.
  const email =
    `h-${hotelId.toLowerCase()}-${rand(3)}@${ACCESS_DOMAIN}`.toLowerCase();
  const password = rand(18);
  if (!(await signUpAccount(email, password))) {
    return NextResponse.json({ error: "account_failed" }, { status: 500 });
  }

  await db.doc(`roles/${email}`).set({
    role: "hotel",
    hotelId,
    hotelName,
    enabled: true,
    via: "link",
    createdAt: Date.now(),
  });

  const token = rand(18);
  await db.doc(`accessLinks/${token}`).set({
    hotelId,
    email,
    password,
    createdAt: Date.now(),
  });
  await ptrRef.set({ token, email, createdAt: Date.now() });

  return NextResponse.json({ url: linkUrl(token), email });
}
