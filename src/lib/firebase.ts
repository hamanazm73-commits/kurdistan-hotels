import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

/** True only when a real API key has been provided. */
export const firebaseEnabled = Boolean(firebaseConfig.apiKey);

let app: FirebaseApp | undefined;
let authInstance: Auth | undefined;
let dbInstance: Firestore | undefined;

if (firebaseEnabled) {
  app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  authInstance = getAuth(app);
  dbInstance = getFirestore(app);
}

export { app };
export const auth = authInstance;
export const db = dbInstance;

/**
 * Storage on demand. Only the admin upload path needs it, so importing it
 * here eagerly would ship the whole Storage SDK to every visitor who never
 * uploads anything.
 */
export async function getStorageLazy() {
  if (!app) return null;
  const { getStorage } = await import("firebase/storage");
  return getStorage(app);
}
export const OWNER_EMAIL = (
  process.env.NEXT_PUBLIC_OWNER_EMAIL || ""
).toLowerCase();
