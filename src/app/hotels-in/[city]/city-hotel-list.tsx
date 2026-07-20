"use client";

import Link from "next/link";
import { Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HotelCard } from "@/components/hotel-card";
import { useHotels } from "@/lib/use-hotels";
import { useI18n } from "@/lib/i18n";
import { type Hotel } from "@/lib/types";

/** Rank featured/recommended first, then by rating — same order as the home page. */
function rank(a: Hotel, b: Hotel) {
  const score = (x: Hotel) => (x.featured ? 2 : 0) + (x.recommended ? 1 : 0);
  return score(b) - score(a) || b.rating - a.rating;
}

/**
 * The hotels of one city. Server-rendered from `initialHotels` (so the list is
 * in the HTML for search engines and the first paint), then kept fresh from the
 * live Firestore subscription once it has loaded real data.
 */
export function CityHotelList({
  city,
  initialHotels,
}: {
  city: string;
  initialHotels: Hotel[];
}) {
  const { t } = useI18n();
  const { hotels, usingSamples } = useHotels();

  // until the live list has real data, trust the server-fetched list
  const list = (
    usingSamples
      ? initialHotels
      : hotels.filter(
          (h) => !h.hidden && h.city?.toLowerCase() === city.toLowerCase(),
        )
  )
    .slice()
    .sort(rank);

  if (list.length === 0) {
    return (
      <div className="mx-auto grid max-w-md place-items-center gap-3 py-20 text-center text-muted-foreground">
        <Inbox className="size-9" />
        <p>{t("city_none")}</p>
        <Button nativeButton={false} render={<Link href="/#hotels" />}>
          {t("nav_hotels")}
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {list.map((h, i) => (
        <HotelCard key={h.id} hotel={h} index={i} />
      ))}
    </div>
  );
}
