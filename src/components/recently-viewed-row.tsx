"use client";

import Link from "next/link";
import { History } from "lucide-react";
import { useRecentlyViewed } from "@/lib/recently-viewed";
import { useHotels } from "@/lib/use-hotels";
import { useI18n } from "@/lib/i18n";
import { pickLang, mediaSrc, type Hotel } from "@/lib/types";

const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80";

/**
 * A strip of the hotels this visitor already opened, so coming back to the site
 * doesn't mean hunting for them again. Renders nothing until there are at least
 * two — one tile is just the page you came from.
 */
export function RecentlyViewedRow() {
  const { t, lang, tCity } = useI18n();
  const { hotels } = useHotels();
  const ids = useRecentlyViewed();

  const seen = ids
    .map((id) => hotels.find((h) => h.id === id))
    .filter((h): h is Hotel => !!h && !h.hidden);

  if (seen.length < 2) return null;

  return (
    <section className="mx-auto max-w-6xl px-6 pt-10">
      <h2 className="mb-3 flex items-center gap-2 text-lg font-bold">
        <History className="size-5 text-gold" />
        {t("recent_title")}
      </h2>
      {/* a scroll strip: on a phone these swipe, on a desktop they just sit */}
      <div className="-mx-1 flex snap-x gap-3 overflow-x-auto px-1 pb-2">
        {seen.map((h) => (
          <Link
            key={h.id}
            href={`/hotels/${h.id}`}
            className="group w-40 shrink-0 snap-start"
          >
            <div className="aspect-[4/3] overflow-hidden rounded-xl border bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={mediaSrc(h.image) || FALLBACK_IMG}
                alt={h.name}
                loading="lazy"
                decoding="async"
                className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <p className="mt-1.5 line-clamp-1 text-sm font-semibold group-hover:text-primary">
              {pickLang(h.name, h.nameI18n, lang)}
            </p>
            <p className="text-xs text-muted-foreground">{tCity(h.city)}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
