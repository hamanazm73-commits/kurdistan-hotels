import type { MetadataRoute } from "next";

/**
 * Lets a visitor add the site to their phone's home screen and open it like an
 * app — no browser chrome, own icon. Most of our traffic is mobile, so this is
 * the cheapest way to earn a second visit.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "هۆتێلەکانی کوردستان · Kurdistan Hotels",
    short_name: "Kurdistan Hotels",
    description:
      "هۆتێلەکانی کوردستان بدۆزەرەوە و حیجز بکە · Find and book hotels across Kurdistan",
    start_url: "/",
    display: "standalone",
    background_color: "#0b0b0c",
    theme_color: "#c8a862",
    dir: "rtl",
    lang: "ckb",
    icons: [
      { src: "/logo-square.png", sizes: "512x512", type: "image/png" },
      {
        src: "/logo-square.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
