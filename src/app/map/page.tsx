"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import { Map as MapIcon } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { useHotels } from "@/lib/use-hotels";
import { useI18n } from "@/lib/i18n";
import { useCurrency } from "@/lib/currency";
import { hotelLatLng } from "@/lib/geo";
import { effectivePrice, pickLang, mediaSrc } from "@/lib/types";
import type { MapPoint } from "@/components/hotels-map";

const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=70";

// Leaflet touches `window`, so load the map only on the client.
const HotelsMap = dynamic(
  () => import("@/components/hotels-map").then((m) => m.HotelsMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-[72vh] w-full animate-pulse rounded-2xl border bg-muted" />
    ),
  },
);

export default function MapPage() {
  const { t, tCity, lang } = useI18n();
  const { hotels } = useHotels();
  const { format } = useCurrency();

  const points = useMemo<MapPoint[]>(() => {
    return hotels
      .filter((h) => !h.hidden)
      .map((h) => {
        const coords = hotelLatLng(h);
        if (!coords) return null;
        return {
          id: h.id,
          lat: coords[0],
          lng: coords[1],
          name: pickLang(h.name, h.nameI18n, lang),
          cityLabel: tCity(h.city),
          priceLabel: format(effectivePrice(h), h.iqdPerUsd),
          image: mediaSrc(h.image) || FALLBACK_IMG,
          rating: h.rating,
        } satisfies MapPoint;
      })
      .filter((p): p is MapPoint => p !== null);
  }, [hotels, lang, tCity, format]);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-6 flex items-center gap-2.5">
          <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
            <MapIcon className="size-5" />
          </span>
          <div>
            <h1 className="text-2xl font-extrabold">{t("map_title")}</h1>
            <p className="text-sm text-muted-foreground">{t("map_sub")}</p>
          </div>
        </div>
        <HotelsMap points={points} />
      </main>
      <SiteFooter />
    </>
  );
}
