import type { MetadataRoute } from "next";

const BASE = "https://hotelskurdistan.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // keep the admin + API out of search results
      disallow: ["/hq", "/login", "/api/"],
    },
    sitemap: `${BASE}/sitemap.xml`,
    host: BASE,
  };
}
