import "server-only";
import { existsSync, readdirSync } from "fs";
import { join } from "path";
import {
  initializeApp,
  getApps,
  getApp,
  cert,
  type App,
} from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

/**
 * Server-side Firebase Admin. Used by API routes (e.g. the rate-limited
 * booking endpoint) so writes bypass client rules safely and can run
 * transactions (decrementing room availability).
 *
 * Credentials, easiest first:
 *   1. FIREBASE_SERVICE_ACCOUNT env var = the whole JSON (best for Vercel), OR
 *   2. a `service-account.json` / `*firebase-adminsdk*.json` file locally, OR
 *   3. FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY env vars
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

/** Initialise (once) and return the Admin app, or null when no creds exist. */
function getAdminApp(): App | null {
  if (getApps().length) return getApp();

  const saJson = process.env.FIREBASE_SERVICE_ACCOUNT;
  const jsonPath = findServiceAccountFile();

  let credential;
  if (saJson) {
    const j = JSON.parse(saJson);
    credential = cert({
      projectId: j.project_id,
      clientEmail: j.client_email,
      privateKey: j.private_key,
    });
  } else if (jsonPath) {
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

  return initializeApp({ credential });
}

export function getAdminDb() {
  const app = getAdminApp();
  return app ? getFirestore(app) : null;
}
