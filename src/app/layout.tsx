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
    // brand + common variant spellings people actually type
    "Kurdistan hotels",
    "hotels Kurdistan",
    "Kurdistan hotel",
    "hotel Kurdistan",
    "hotels in Kurdistan",
    "hotelskurdistan",
    // cities — many transliterations, so cover the common ones
    "Erbil hotels",
    "Hawler hotels",
    "Arbil hotels",
    "Sulaymaniyah hotels",
    "Slemani hotels",
    "Sulaimani hotels",
    "Duhok hotels",
    "Dohuk hotels",
    "Dukan hotels",
    "Dokan hotels",
    "Halabja hotels",
    "Kirkuk hotels",
    // native scripts
    "هۆتێلەکانی کوردستان",
    "هۆتێل هەولێر",
    "هۆتێل سلێمانی",
    "هۆتێل دووکان",
    "فنادق كردستان",
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

// Structured data: tells Google the brand's alternate names and the many
// spellings of the Kurdish cities we serve, so misspelled/variant searches
// (Hawler/Arbil, Slemani, Dohuk, Dokan …) still resolve to this site.
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://hotelskurdistan.com/#organization",
      name: "Kurdistan Hotels",
      alternateName: [
        "Kurdistan Hotel",
        "Hotels Kurdistan",
        "Hotel Kurdistan",
        "Hotels in Kurdistan",
        "هۆتێلەکانی کوردستان",
        "هۆتێلی کوردستان",
        "فنادق كردستان",
      ],
      url: "https://hotelskurdistan.com",
      logo: "https://hotelskurdistan.com/logo-square.png",
      image: "https://hotelskurdistan.com/logo-square.png",
      description:
        "Discover and book the finest hotels across Kurdistan — Dukan, Erbil, Sulaymaniyah, Duhok, Halabja and Kirkuk.",
      areaServed: [
        "Kurdistan",
        "Erbil",
        "Hawler",
        "Hewler",
        "Arbil",
        "Sulaymaniyah",
        "Slemani",
        "Sulaimani",
        "Duhok",
        "Dohuk",
        "Dukan",
        "Dokan",
        "Halabja",
        "Kirkuk",
        "Kerkuk",
      ],
    },
    {
      "@type": "WebSite",
      "@id": "https://hotelskurdistan.com/#website",
      name: "Kurdistan Hotels",
      alternateName: [
        "Kurdistan Hotel",
        "Hotels Kurdistan",
        "hotelskurdistan",
      ],
      url: "https://hotelskurdistan.com",
      inLanguage: ["ckb", "en", "ar", "kmr"],
      publisher: { "@id": "https://hotelskurdistan.com/#organization" },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ckb" dir="rtl" suppressHydrationWarning>
      <body
        className={`${sans.variable} ${arabic.variable} min-h-dvh antialiased`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
          }}
        />
        <SiteProtection />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
