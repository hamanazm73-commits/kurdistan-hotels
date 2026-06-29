import "server-only";
import { existsSync, readdirSync } from "fs";
import { join } from "path";
import { initializeApp, getApps, getApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

/**
 * Server-side Firebase Admin. Used by API routes (e.g. the rate-limited
 * booking endpoint) so writes bypass client rules safely and can run
 * transactions (decrementing room availability).
 *
 * Credentials, easiest first:
 *   1. a `service-account.json` file in the project root, OR
 *   2. the raw `*firebase-adminsdk*.json` you downloaded (any name), OR
 *   3. FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY in .env.local
 * Returns null when none are present so callers degrade gracefully.
 */
function findServiceAccountFile(): string | null {
  const root = process.cwd();
  const named = join(root, "service-account.json");
  if (existsSync(named)) return named;
  try {
    const match = readdirSync(root).find(
      (n) => n.includes("firebase-adminsdk") && n.endsWith(".json"),
    );
    if (match) return join(root, match);
  } catch {
    /* ignore */
  }
  return null;
}

export function getAdminDb() {
  if (getApps().length) return getFirestore(getApp());

  const jsonPath = findServiceAccountFile();

  let credential;
  if (jsonPath) {
    credential = cert(jsonPath);
  } else if (
    process.env.FIREBASE_CLIENT_EMAIL &&
    process.env.FIREBASE_PRIVATE_KEY
  ) {
    credential = cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    });
  } else {
    return null;
  }

  const app = initializeApp({ credential });
  return getFirestore(app);
}
