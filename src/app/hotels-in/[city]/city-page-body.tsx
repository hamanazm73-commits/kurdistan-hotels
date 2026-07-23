"use client";

import Link from "next/link";
import { MapPin } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { CityHotelList } from "./city-hotel-list";
import type { Hotel } from "@/lib/types";

/** A city's rich description in each language (Kurmanji falls back to English). */
export type CityIntro = { ckb: string; en: string; ar: string };

/**
 * The visible body of a city page. A client component so every word — heading,
 * intro, breadcrumb, links — follows the language the visitor picked. It is
 * still server-rendered (in the default language) so search engines and the
 * first paint have real content.
 */
export function CityPageBody({
  slug,
  cityValue,
  intro,
  others,
  initialHotels,
}: {
  slug: string;
  cityValue: string;
  intro: CityIntro;
  others: { slug: string; cityValue: string }[];
  initialHotels: Hotel[];
}) {
  const { t, tCity, lang } = useI18n();
  const name = tCity(cityValue);
  const introText =
    lang === "ar" ? intro.ar : lang === "ckb" ? intro.ckb : intro.en;
  const count = initialHotels.length;
  void slug;

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      {/* breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        className="mb-6 flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground"
      >
        <Link href="/" className="transition-colors hover:text-primary">
          {t("nav_home")}
        </Link>
        <span aria-hidden>›</span>
        <Link href="/#hotels" className="transition-colors hover:text-primary">
          {t("nav_hotels")}
        </Link>
        <span aria-hidden>›</span>
        <span className="font-medium text-foreground">{name}</span>
      </nav>

      {/* header with a soft gold glow */}
      <header className="relative mb-10 overflow-hidden rounded-2xl border bg-gradient-to-b from-gold/[0.06] to-transparent p-7 sm:p-9">
        <div
          aria-hidden
          className="pointer-events-none absolute -end-8 -top-8 h-40 w-40 rounded-full bg-gold/20 blur-3xl"
        />
        <p className="text-sm font-semibold uppercase tracking-wide text-gold">
          {t("hotels_eyebrow")}
        </p>
        <h1 className="mt-1.5 text-3xl font-extrabold sm:text-4xl">
          {t("city_title", { city: name })}
        </h1>
        <p className="mt-3 max-w-2xl leading-relaxed text-muted-foreground">
          {t("city_sub", { city: name })}
        </p>
        {count > 0 && (
          <span className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3.5 py-1.5 text-sm font-semibold text-primary">
            <MapPin className="size-3.5" />
            {t("results_found", { n: count })}
          </span>
        )}
      </header>

      <CityHotelList city={cityValue} initialHotels={initialHotels} />

      {/* about — real, distinct text so each city page stands on its own */}
      {introText && (
        <section className="mt-14 rounded-2xl border bg-muted/30 p-6 sm:p-8">
          <h2 className="mb-3 text-xl font-bold">
            {t("city_about", { city: name })}
          </h2>
          <p className="max-w-3xl leading-relaxed text-muted-foreground">
            {introText}
          </p>
        </section>
      )}

      {/* jump to the other cities */}
      <nav className="mt-14 border-t pt-8">
        <h2 className="mb-4 text-lg font-bold">{t("city_other")}</h2>
        <div className="flex flex-wrap gap-2">
          {others.map((o) => (
            <Link
              key={o.slug}
              href={`/hotels-in/${o.slug}`}
              className="inline-flex items-center gap-1.5 rounded-full border bg-card px-3.5 py-1.5 text-sm transition-colors hover:border-gold hover:text-gold"
            >
              <MapPin className="size-3.5" />
              {tCity(o.cityValue)}
            </Link>
          ))}
        </div>
      </nav>
    </main>
  );
}
