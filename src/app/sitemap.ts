import type { MetadataRoute } from "next";
import { getAdminDb } from "@/lib/firebase-admin";
import { getPublishedPosts } from "@/lib/posts-server";

const BASE = "https://hotelskurdistan.com";

// the per-city landing pages (must match the routes in /hotels-in/[city])
const CITY_SLUGS = [
  "erbil",
  "sulaymaniyah",
  "duhok",
  "halabja",
  "kirkuk",
  "dukan",
];

// rebuild the sitemap hourly so new hotels get picked up by search engines
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const routes: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: now, changeFrequency: "daily", priority: 1 },
    // per-city landing pages — the ones that target "erbil hotels" etc.
    ...CITY_SLUGS.map((c) => ({
      url: `${BASE}/hotels-in/${c}`,
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: 0.9,
    })),
    { url: `${BASE}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE}/map`, lastModified: now, changeFrequency: "weekly", priority: 0.5 },
    { url: `${BASE}/bookings`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
  ];

  // published blog posts
  try {
    for (const p of await getPublishedPosts()) {
      routes.push({
        url: `${BASE}/blog/${p.slug}`,
        lastModified: new Date(p.updatedAt ?? p.createdAt ?? Date.now()),
        changeFrequency: "monthly",
        priority: 0.6,
      });
    }
  } catch {
    /* no admin creds — skip posts */
  }

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
