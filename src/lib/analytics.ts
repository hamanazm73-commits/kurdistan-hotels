"use client";

import { getAnalytics, isSupported, logEvent } from "firebase/analytics";
import type { Analytics } from "firebase/analytics";
import { app, firebaseEnabled } from "./firebase";

/**
 * Firebase Analytics, loaded lazily on the client.
 *
 * The project already carries a measurementId, so this needs no new service or
 * dependency. `isSupported()` matters: Analytics throws in environments without
 * cookies/IndexedDB (private modes, some in-app browsers), and a hotel listing
 * must not break because a metric couldn't be recorded.
 */
let instance: Analytics | null = null;
let ready: Promise<Analytics | null> | null = null;

function get(): Promise<Analytics | null> {
  if (instance) return Promise.resolve(instance);
  if (ready) return ready;
  ready = (async () => {
    if (!firebaseEnabled || !app || typeof window === "undefined") return null;
    if (!process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID) return null;
    try {
      if (!(await isSupported())) return null;
      instance = getAnalytics(app);
      return instance;
    } catch {
      return null;
    }
  })();
  return ready;
}

/** Record an event. Never throws and never blocks the caller. */
export function track(name: string, params?: Record<string, unknown>) {
  void get()
    .then((a) => {
      if (a) logEvent(a, name, params);
    })
    .catch(() => {});
}
