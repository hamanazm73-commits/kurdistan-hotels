import "server-only";
import type { Firestore } from "firebase-admin/firestore";

/**
 * Recompute a hotel's approved-review tally and store it on the hotel doc.
 *
 * The listing shows every hotel at once, so reading each hotel's reviews there
 * would be one query per card. Keeping the count and average on the hotel
 * instead costs a single write whenever a review is moderated, which is rare.
 *
 * Never throws: a moderation action must still succeed if this write fails.
 */
export async function syncHotelReviewStats(
  db: Firestore,
  hotelId: string,
): Promise<void> {
  if (!hotelId) return;
  try {
    const snap = await db
      .collection("reviews")
      .where("hotelId", "==", hotelId)
      .where("status", "==", "approved")
      .get();

    const ratings = snap.docs
      .map((d) => Number(d.data().rating) || 0)
      .filter((r) => r > 0);

    const reviewCount = ratings.length;
    const reviewAvg = reviewCount
      ? Math.round((ratings.reduce((s, r) => s + r, 0) / reviewCount) * 10) / 10
      : 0;

    await db.collection("hotels").doc(hotelId).update({ reviewCount, reviewAvg });
  } catch {
    /* hotel may have been deleted, or Admin creds missing — leave the tally */
  }
}
