import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { OwnerLanding } from "@/components/owner-landing";
import { HotelApplicationForm } from "@/components/hotel-application-form";

const SITE = "https://hotelskurdistan.com";

export const metadata: Metadata = {
  title: "هۆتێلەکەت زیاد بکە · List your hotel — Kurdistan Hotels",
  description:
    "هۆتێلەکەت لە هۆتێلەکانی کوردستان زیاد بکە — بەخۆڕایی، پارە ڕاستەوخۆ بۆ خۆت، بەبێ کرێی زیادە. List your hotel on Kurdistan Hotels — free, money direct to you, no commission.",
  keywords: [
    "list your hotel kurdistan",
    "add hotel erbil",
    "add hotel sulaymaniyah",
    "هۆتێلەکەت زیاد بکە",
    "أضف فندقك كردستان",
  ],
  alternates: { canonical: "/list-your-hotel" },
  openGraph: {
    title: "هۆتێلەکەت زیاد بکە · List your hotel — Kurdistan Hotels",
    description:
      "بەخۆڕایی هۆتێلەکەت زیاد بکە و حجزی ڕاستەوخۆ وەربگرە. List your hotel for free and receive bookings directly.",
    url: `${SITE}/list-your-hotel`,
    type: "website",
  },
};

export default function ListYourHotelPage() {
  return (
    <>
      <SiteHeader />
      <OwnerLanding />
      {/* the page pitched, then left the owner to phone or email; this is the
          same ask, filled in once */}
      <section className="mx-auto max-w-2xl px-6 pb-16">
        <HotelApplicationForm />
      </section>
      <SiteFooter />
    </>
  );
}
