import type { Metadata } from "next";
import { alternatesFor, asLang } from "@/lib/hreflang";
import { getPublicHotels } from "@/lib/hotels-server";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Hero } from "@/components/hero";
import { HotelsSection } from "@/components/hotels-section";
import { RecentlyViewedRow } from "@/components/recently-viewed-row";
import { BrowseByCity } from "@/components/browse-by-city";
import { TrustSection } from "@/components/trust-section";
import { OwnerCta } from "@/components/owner-cta";
import { FaqSection } from "@/components/faq-section";
import { SeoAbout } from "@/components/seo-about";
import { FAQ_ITEMS } from "@/lib/site-content";

// FAQ structured data (in the default site language, matching what the page
// renders on first load) so search engines can read the questions & answers.
const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ_ITEMS.map((f) => ({
    "@type": "Question",
    name: f.q.ckb,
    acceptedAnswer: { "@type": "Answer", text: f.a.ckb },
  })),
};

/**
 * The canonical has to live here rather than in the root layout: only a page
 * receives searchParams, and proxy.ts passes the language that way, so this is
 * the only place that can point each translation at its own URL.
 */
export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}): Promise<Metadata> {
  return { alternates: alternatesFor("/", asLang((await searchParams).lang)) };
}

/**
 * The hotels themselves, as structured data. The city pages already do this;
 * the homepage is where most crawlers land first and it was only describing
 * the FAQ, so Google had no idea it was looking at a hotel listing.
 */
async function hotelsJsonLd() {
  const hotels = await getPublicHotels();
  if (hotels.length === 0) return null;
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Hotels in Kurdistan",
    numberOfItems: hotels.length,
    itemListElement: hotels.slice(0, 30).map((h, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `https://hotelskurdistan.com/hotels/${h.id}`,
      name: h.name,
    })),
  };
}

export default async function HomePage() {
  const hotelsLd = await hotelsJsonLd();
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      {hotelsLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(hotelsLd).replace(/</g, "\\u003c"),
          }}
        />
      )}
      <SiteHeader />
      <main>
        <Hero />
        <RecentlyViewedRow />
        <HotelsSection />
        <BrowseByCity />
        <TrustSection />
        <OwnerCta />
        <FaqSection />
        <SeoAbout />
      </main>
      <SiteFooter />
    </>
  );
}
