import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Hero } from "@/components/hero";
import { HotelsSection } from "@/components/hotels-section";

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main>
        <Hero />
        <HotelsSection />
      </main>
      <SiteFooter />
    </>
  );
}
