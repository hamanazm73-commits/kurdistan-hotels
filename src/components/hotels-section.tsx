"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, ArrowDownUp, Wallet, BedDouble } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { HotelCard } from "./hotel-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useHotels } from "@/lib/use-hotels";
import { useI18n, CITY_KEYS } from "@/lib/i18n";
import { useSiteConfig } from "@/lib/site-config";
import { CITIES } from "@/lib/sample-data";
import {
  effectivePrice,
  sameRoomType,
  roomTypeId,
  roomTypeLabel,
} from "@/lib/types";
import { useCurrency } from "@/lib/currency";
import { cn } from "@/lib/utils";
import { SectionIntro } from "./section-intro";

type Sort = "recommended" | "price_low" | "price_high" | "rating" | "views";

/** Nightly-price ceilings offered in the filter, in IQD. */
const PRICE_STEPS = [50_000, 100_000, 150_000, 250_000, 400_000];

const SORT_LABEL: Record<Sort, string> = {
  recommended: "sort_recommended",
  price_low: "sort_price_low",
  price_high: "sort_price_high",
  rating: "sort_rating",
  views: "sort_views",
};

export function HotelsSection() {
  const { t, tCity, lang } = useI18n();
  const { format } = useCurrency();
  const { hotels, loading } = useHotels();
  const { hidePrices } = useSiteConfig();

  const [search, setSearch] = useState("");
  const [city, setCity] = useState<string>("all");
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [sort, setSort] = useState<Sort>("recommended");
  const [maxPrice, setMaxPrice] = useState<string>("any");
  const [roomType, setRoomType] = useState<string>("any");

  // only offer rooms some hotel actually has, so the filter never returns nothing
  const offeredRoomTypes = useMemo(() => {
    const ids = new Set<string>();
    for (const h of hotels) {
      if (h.hidden) continue;
      for (const r of h.rooms ?? []) {
        const id = roomTypeId(r.type);
        if (id) ids.add(id);
      }
    }
    return [...ids];
  }, [hotels]);

  const filtered = useMemo(() => {
    let list = hotels.filter((h) => {
      if (h.hidden) return false;
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        [
          h.name,
          ...(h.nameI18n ? Object.values(h.nameI18n) : []),
          h.city,
          ...(CITY_KEYS[h.city] ? Object.values(CITY_KEYS[h.city]) : []),
        ].some((v) => v?.toLowerCase().includes(q));
      const matchesCity = city === "all" || h.city === city;
      const matchesFeatured = !featuredOnly || h.featured;
      const matchesPrice = maxPrice === "any" || effectivePrice(h) <= +maxPrice;
      const matchesRoom =
        roomType === "any" ||
        (h.rooms ?? []).some((r) => sameRoomType(r.type, roomType));
      return (
        matchesSearch &&
        matchesCity &&
        matchesFeatured &&
        matchesPrice &&
        matchesRoom
      );
    });

    list = [...list].sort((a, b) => {
      switch (sort) {
        case "price_low":
          return effectivePrice(a) - effectivePrice(b);
        case "price_high":
          return effectivePrice(b) - effectivePrice(a);
        case "rating":
          return b.rating - a.rating;
        case "views":
          return (b.views ?? 0) - (a.views ?? 0);
        default: {
          const score = (x: typeof a) =>
            (x.featured ? 2 : 0) + (x.recommended ? 1 : 0);
          return score(b) - score(a) || b.rating - a.rating;
        }
      }
    });
    return list;
  }, [hotels, search, city, featuredOnly, sort, maxPrice, roomType]);

  // A search that finds nothing is the visitor telling us what the site is
  // missing. Report it once they've stopped typing, and only for a plain search
  // — a filter can empty the list without the term being the problem.
  useEffect(() => {
    const q = search.trim();
    if (q.length < 2 || filtered.length > 0) return;
    if (city !== "all" || featuredOnly || maxPrice !== "any" || roomType !== "any")
      return;
    const timer = setTimeout(() => {
      fetch("/api/search-miss", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ q }),
      }).catch(() => {});
    }, 1200);
    return () => clearTimeout(timer);
  }, [search, filtered.length, city, featuredOnly, maxPrice, roomType]);

  // Median nightly price per city, from every visible hotel rather than the
  // filtered view — otherwise narrowing the list would shift the yardstick and
  // hotels would gain or lose the "good price" badge as you type.
  const cityMedians = useMemo(() => {
    const byCity = new Map<string, number[]>();
    for (const h of hotels) {
      if (h.hidden) continue;
      const p = effectivePrice(h);
      if (p > 0) byCity.set(h.city, [...(byCity.get(h.city) ?? []), p]);
    }
    const out = new Map<string, number>();
    for (const [c, prices] of byCity) {
      // a median needs something to sit in the middle of
      if (prices.length < 3) continue;
      const sorted = prices.sort((a, b) => a - b);
      const mid = Math.floor(sorted.length / 2);
      out.set(
        c,
        sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2,
      );
    }
    return out;
  }, [hotels]);

  return (
    <section
      id="hotels"
      className="relative mx-auto max-w-7xl scroll-mt-20 px-6 py-16"
    >
      {/* soft gold glow behind the heading for a premium feel */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-4 -z-10 h-48 w-72 -translate-x-1/2 rounded-full bg-gold/20 blur-3xl"
      />
      <SectionIntro
        eyebrow={t("hotels_eyebrow")}
        title={t("hotels_title")}
        subtitle={t("hotels_sub")}
      />
      <div className="mb-8 flex flex-col gap-5">
        {/* search */}
        <div className="relative">
          <Search className="absolute start-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("search_ph")}
            className="h-14 rounded-2xl ps-12 text-base shadow-sm"
          />
        </div>

        {/* filters row */}
        <div className="flex flex-wrap items-center gap-2">
          <FilterChip
            active={city === "all" && !featuredOnly}
            onClick={() => {
              setCity("all");
              setFeaturedOnly(false);
            }}
          >
            {t("filter_all")}
          </FilterChip>
          <FilterChip
            active={featuredOnly}
            onClick={() => setFeaturedOnly((v) => !v)}
          >
            ⭐ {t("filter_featured")}
          </FilterChip>
          {CITIES.map((c) => (
            <FilterChip
              key={c}
              active={city === c}
              onClick={() => {
                setCity(c);
                setFeaturedOnly(false);
              }}
            >
              {tCity(c)}
            </FilterChip>
          ))}

          <div className="ms-auto flex flex-wrap items-center gap-2">
            {!hidePrices && (
              <Select
                value={maxPrice}
                onValueChange={(v) => v && setMaxPrice(v)}
              >
                <SelectTrigger className="max-w-[52vw] sm:max-w-none">
                  <Wallet className="size-4 shrink-0 text-muted-foreground" />
                  <SelectValue>
                    {(v: string | null) =>
                      !v || v === "any"
                        ? t("filter_price_any")
                        : t("filter_price_under", { p: format(+v) })
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">{t("filter_price_any")}</SelectItem>
                  {PRICE_STEPS.map((p) => (
                    <SelectItem key={p} value={String(p)}>
                      {t("filter_price_under", { p: format(p) })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <Select
              value={roomType}
              onValueChange={(v) => v && setRoomType(v)}
            >
              <SelectTrigger className="max-w-[52vw] sm:max-w-none">
                <BedDouble className="size-4 shrink-0 text-muted-foreground" />
                <SelectValue>
                  {(v: string | null) =>
                    !v || v === "any"
                      ? t("filter_room_any")
                      : roomTypeLabel(v, lang)
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">{t("filter_room_any")}</SelectItem>
                {offeredRoomTypes.map((id) => (
                  <SelectItem key={id} value={id}>
                    {roomTypeLabel(id, lang)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={sort}
              onValueChange={(v) => v && setSort(v as Sort)}
            >
              <SelectTrigger className="max-w-[52vw] sm:max-w-none">
                <ArrowDownUp className="size-4 shrink-0 text-muted-foreground" />
                <SelectValue>
                  {(value: Sort | null) =>
                    t(SORT_LABEL[value ?? "recommended"])
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recommended">
                  {t("sort_recommended")}
                </SelectItem>
                {!hidePrices && (
                  <>
                    <SelectItem value="price_low">
                      {t("sort_price_low")}
                    </SelectItem>
                    <SelectItem value="price_high">
                      {t("sort_price_high")}
                    </SelectItem>
                  </>
                )}
                <SelectItem value="rating">{t("sort_rating")}</SelectItem>
                <SelectItem value="views">{t("sort_views")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <p className="text-sm font-medium text-muted-foreground">
          {t("results_found", { n: filtered.length })}
        </p>
      </div>

      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-80 rounded-2xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <p className="py-20 text-center text-lg text-muted-foreground">
          {t("no_results")}
        </p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((h, i) => (
            <HotelCard
              key={h.id}
              hotel={h}
              index={i}
              cityMedianPrice={cityMedians.get(h.city)}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Button
      type="button"
      size="sm"
      variant={active ? "default" : "outline"}
      onClick={onClick}
      className={cn(
        "rounded-full transition-transform active:scale-95",
        active && "shadow",
      )}
    >
      {children}
    </Button>
  );
}
