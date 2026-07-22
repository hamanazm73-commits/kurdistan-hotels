import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Hero } from "@/components/hero";
import { HotelsSection } from "@/components/hotels-section";
import { BrowseByCity } from "@/components/browse-by-city";
import { TrustSection } from "@/components/trust-section";
import { FaqSection } from "@/components/faq-section";
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

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <SiteHeader />
      <main>
        <Hero />
        <HotelsSection />
        <BrowseByCity />
        <TrustSection />
        <FaqSection />
      </main>
      <SiteFooter />
    </>
  );
}
