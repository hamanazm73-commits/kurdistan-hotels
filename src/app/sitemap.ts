import type { MetadataRoute } from "next";
import { getAdminDb } from "@/lib/firebase-admin";

const BASE = "https://hotelskurdistan.com";

// rebuild the sitemap hourly so new hotels get picked up by search engines
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const routes: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${BASE}/bookings`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
  ];

  // add every public hotel page so search engines can index them
  try {
    const db = getAdminDb();
    if (db) {
      const snap = await db.collection("hotels").get();
      for (const d of snap.docs) {
        if (d.data()?.hidden) continue;
        routes.push({
          url: `${BASE}/hotels/${d.id}`,
          lastModified: now,
          changeFrequency: "weekly",
          priority: 0.8,
        });
      }
    }
  } catch {
    /* no admin creds / read failed — the homepage alone is fine */
  }

  return routes;
}
