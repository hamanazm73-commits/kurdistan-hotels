import "server-only";
import { cache } from "react";
import { getAdminDb } from "./firebase-admin";
import type { Hotel } from "./types";

export interface ApprovedReview {
  name: string;
  rating: number;
  comment: string;
  createdAt: number;
}

/**
 * Approved reviews for a hotel, read on the server for structured data
 * (aggregateRating → star rich snippets in Google). Cached per request.
 * Returns [] when Admin creds are missing so pages render without ratings.
 */
export const getApprovedReviews = cache(
  async (hotelId: string): Promise<ApprovedReview[]> => {
    const db = getAdminDb();
    if (!db) return [];
    try {
      const snap = await db
        .collection("reviews")
        .where("hotelId", "==", hotelId)
        .where("status", "==", "approved")
        .get();
      return snap.docs
        .map((d) => {
          const r = d.data();
          return {
            name: String(r.name ?? ""),
            rating: Number(r.rating ?? 0),
            comment: String(r.comment ?? ""),
            createdAt: Number(r.createdAt ?? 0),
          };
        })
        .sort((a, b) => b.createdAt - a.createdAt);
    } catch {
      return [];
    }
  },
);

/**
 * Fetch a single hotel by id on the server (for per-page SEO metadata,
 * structured data, and a server-rendered first paint on the detail page).
 * Wrapped in React `cache` so `generateMetadata` and the page component share
 * one Firestore read per request. Returns null when Admin creds are missing or
 * the hotel doesn't exist — callers fall back to the live client list.
 */
export const getHotelById = cache(async (id: string): Promise<Hotel | null> => {
  const db = getAdminDb();
  if (!db) return null;
  try {
    const snap = await db.collection("hotels").doc(id).get();
    if (!snap.exists) return null;
    return { id: snap.id, ...(snap.data() ?? {}) } as Hotel;
  } catch {
    return null;
  }
});

/**
 * All public (non-hidden) hotels, for server-rendered listing pages like the
 * per-city landing pages (good for SEO). Cached per request. Returns [] when
 * Admin creds are missing so those pages just render empty rather than error.
 */
export const getPublicHotels = cache(async (): Promise<Hotel[]> => {
  const db = getAdminDb();
  if (!db) return [];
  try {
    const snap = await db.collection("hotels").get();
    return snap.docs
      .map((d) => ({ id: d.id, ...(d.data() ?? {}) }) as Hotel)
      .filter((h) => !h.hidden);
  } catch {
    return [];
  }
});
