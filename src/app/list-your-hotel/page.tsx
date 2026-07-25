import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { OwnerLanding } from "@/components/owner-landing";

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
      <SiteFooter />
    </>
  );
}
