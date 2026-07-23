import type { NextConfig } from "next";

const securityHeaders = [
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: blob: https://images.unsplash.com https://firebasestorage.googleapis.com https://res.cloudinary.com https://*.public.blob.vercel-storage.com https://*.r2.dev https://*.r2.cloudflarestorage.com https://lh3.googleusercontent.com https://i.ytimg.com https://tile.openstreetmap.org https://*.tile.openstreetmap.org https://*.basemaps.cartocdn.com",
      "font-src 'self' https://fonts.gstatic.com",
      "connect-src 'self' https://*.firebaseio.com wss://*.firebaseio.com https://*.googleapis.com https://identitytoolkit.googleapis.com https://api.cloudinary.com https://*.vercel-storage.com https://*.r2.cloudflarestorage.com https://*.r2.dev",
      "media-src 'self' blob: data: https:",
      "frame-src https://www.youtube.com https://www.youtube-nocookie.com",
      // who may embed *us* (clickjacking defense; modern X-Frame-Options)
      "frame-ancestors 'self'",
      // where forms may submit
      "form-action 'self'",
      "object-src 'none'",
      "base-uri 'self'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  // firebase-admin is server-only and ships its own binaries — don't bundle it
  serverExternalPackages: ["firebase-admin", "nodemailer"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "firebasestorage.googleapis.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
      { protocol: "https", hostname: "*.r2.dev" },
    ],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  async rewrites() {
    // Serve the RFC 9116 security contact at the standard well-known path.
    return [
      {
        source: "/.well-known/security.txt",
        destination: "/api/security-txt",
      },
    ];
  },
  async redirects() {
    return [
      { source: "/admin", destination: "/", permanent: false },
      { source: "/admin/:path*", destination: "/", permanent: false },
    ];
  },
};

export default nextConfig;
