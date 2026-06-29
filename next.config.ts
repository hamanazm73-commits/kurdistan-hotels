import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // firebase-admin is server-only and ships its own binaries — don't bundle it
  serverExternalPackages: ["firebase-admin"],
  images: {
    remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }],
  },
};

export default nextConfig;
