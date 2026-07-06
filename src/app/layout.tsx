import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Noto_Naskh_Arabic } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { SiteProtection } from "@/components/site-protection";

const sans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});

const arabic = Noto_Naskh_Arabic({
  variable: "--font-arabic",
  subsets: ["arabic"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://hotelskurdistan.com"),
  title: {
    default: "Kurdistan Hotels — هۆتێلەکانی کوردستان",
    template: "%s — Kurdistan Hotels",
  },
  description:
    "Discover and book the finest hotels across Kurdistan — Dukan, Erbil, Sulaymaniyah, Duhok, Halabja and Kirkuk.",
  keywords: [
    "Kurdistan hotels",
    "hotels Kurdistan",
    "hotelskurdistan",
    "Erbil hotels",
    "Sulaymaniyah hotels",
    "Dukan hotels",
    "هۆتێلەکانی کوردستان",
    "هۆتێل هەولێر",
    "هۆتێل سلێمانی",
  ],
  alternates: { canonical: "/" },
  verification: {
    google: "UT4bf6T1LZ4-9pd0JnUeNIrh4MUB8uBacpWpcg3weGA",
  },
  openGraph: {
    title: "Kurdistan Hotels — هۆتێلەکانی کوردستان",
    description:
      "Discover and book the finest hotels across Kurdistan — Dukan, Erbil, Sulaymaniyah, Duhok, Halabja and Kirkuk.",
    type: "website",
    url: "https://hotelskurdistan.com",
    images: [
      {
        url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=630&fit=crop&q=85",
        width: 1200,
        height: 630,
        alt: "Kurdistan Hotels — Beautiful mountain landscape",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kurdistan Hotels — هۆتێلەکانی کوردستان",
    description: "Discover and book the finest hotels across Kurdistan.",
    images: [
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=630&fit=crop&q=85",
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ckb" dir="rtl" suppressHydrationWarning>
      <body
        className={`${sans.variable} ${arabic.variable} min-h-dvh antialiased`}
      >
        <SiteProtection />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
