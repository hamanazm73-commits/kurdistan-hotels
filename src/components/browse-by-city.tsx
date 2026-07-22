"use client";

import Link from "next/link";
import { MapPin } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { CITIES } from "@/lib/sample-data";
import { SectionIntro } from "./section-intro";

/** Homepage "browse by city" grid — links to each per-city landing page.
    Prominent internal links from the most-crawled page (good SEO) and an easy
    way for visitors to jump to their city. */
export function BrowseByCity() {
  const { t, tCity } = useI18n();

  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <SectionIntro
        center
        eyebrow={t("cities_eyebrow")}
        title={t("cities_title")}
        subtitle={t("cities_sub")}
      />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {CITIES.map((c) => (
          <Link
            key={c}
            href={`/hotels-in/${c.toLowerCase()}`}
            className="group flex flex-col items-center gap-2 rounded-2xl border bg-card p-5 text-center transition hover:-translate-y-1 hover:border-gold hover:shadow-lg"
          >
            <span className="grid size-11 place-items-center rounded-xl bg-gold/15 text-gold transition group-hover:bg-gold group-hover:text-gold-foreground">
              <MapPin className="size-5" />
            </span>
            <span className="font-bold">{tCity(c)}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
