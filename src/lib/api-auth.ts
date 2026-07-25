import "server-only";
import { getAdminDb } from "./firebase-admin";

const OWNER_EMAIL = (process.env.NEXT_PUBLIC_OWNER_EMAIL || "")
  .trim()
  .toLowerCase();

/** Extract the `Bearer <idToken>` from an incoming request. */
export function bearer(req: Request): string {
  const a = req.headers.get("authorization") || "";
  return a.startsWith("Bearer ") ? a.slice(7) : "";
}

/** Look up the account behind an ID token via the Identity Toolkit REST API
    (no firebase-admin/auth needed). Returns the lowercased email or null. */
export async function lookupUser(
  idToken: string,
): Promise<{ email: string; localId: string } | null> {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (!idToken || !apiKey) return null;
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
    const data = (await res.json()) as {
      users?: { email?: string; localId?: string }[];
    };
    const u = data.users?.[0];
    if (!u?.email) return null;
    return { email: u.email.toLowerCase(), localId: u.localId ?? "" };
  } catch {
    return null;
  }
}

/** Returns the caller's email when they are the site owner or an enabled
    admin/owner role, otherwise null. For privileged endpoints. */
export async function requireAdmin(idToken: string): Promise<string | null> {
  const u = await lookupUser(idToken);
  if (!u) return null;
  if (OWNER_EMAIL && u.email === OWNER_EMAIL) return u.email;
  const db = getAdminDb();
  if (!db) return null;
  try {
    const snap = await db.doc(`roles/${u.email}`).get();
    const d = snap.data() as { role?: string; enabled?: boolean } | undefined;
    if (d?.enabled && (d.role === "admin" || d.role === "owner")) return u.email;
  } catch {
    /* ignore — treated as not an admin */
  }
  return null;
}
