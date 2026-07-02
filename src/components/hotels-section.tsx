"use client";

import { useMemo, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
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
import { CITIES } from "@/lib/sample-data";
import { effectivePrice } from "@/lib/types";
import { useCurrency } from "@/lib/currency";
import { cn } from "@/lib/utils";

type Sort = "recommended" | "price_low" | "price_high" | "rating";

export function HotelsSection() {
  const { t, tCity } = useI18n();
  const { format } = useCurrency();
  const { hotels, loading } = useHotels();

  const [search, setSearch] = useState("");
  const [city, setCity] = useState<string>("all");
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [maxPrice, setMaxPrice] = useState(500_000);
  const [sort, setSort] = useState<Sort>("recommended");

  const filtered = useMemo(() => {
    let list = hotels.filter((h) => {
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
      const matchesPrice = effectivePrice(h) <= maxPrice;
      return matchesSearch && matchesCity && matchesFeatured && matchesPrice;
    });

    list = [...list].sort((a, b) => {
      switch (sort) {
        case "price_low":
          return effectivePrice(a) - effectivePrice(b);
        case "price_high":
          return effectivePrice(b) - effectivePrice(a);
        case "rating":
          return b.rating - a.rating;
        default: {
          const score = (x: typeof a) =>
            (x.featured ? 2 : 0) + (x.recommended ? 1 : 0);
          return score(b) - score(a) || b.rating - a.rating;
        }
      }
    });
    return list;
  }, [hotels, search, city, featuredOnly, maxPrice, sort]);

  return (
    <section id="hotels" className="mx-auto max-w-7xl scroll-mt-20 px-6 py-16">
      <div className="mb-8 flex flex-col gap-5">
        {/* search */}
        <div className="relative">
          <Search className="absolute start-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("search_ph")}
            className="h-14 ps-12 text-base shadow-sm"
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

          <div className="ms-auto flex items-center gap-3">
            <div className="hidden items-center gap-2 sm:flex">
              <SlidersHorizontal className="size-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {t("max_price")}: {format(maxPrice)}
              </span>
              <Slider
                value={[maxPrice]}
                onValueChange={(v) =>
                  setMaxPrice(Array.isArray(v) ? v[0] : v)
                }
                min={10_000}
                max={500_000}
                step={5_000}
                className="w-36"
              />
            </div>
            <Select
              value={sort}
              onValueChange={(v) => v && setSort(v as Sort)}
            >
              <SelectTrigger className="w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recommended">
                  {t("sort_recommended")}
                </SelectItem>
                <SelectItem value="price_low">{t("sort_price_low")}</SelectItem>
                <SelectItem value="price_high">
                  {t("sort_price_high")}
                </SelectItem>
                <SelectItem value="rating">{t("sort_rating")}</SelectItem>
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
            <HotelCard key={h.id} hotel={h} index={i} />
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
      className={cn("rounded-full", active && "shadow")}
    >
      {children}
    </Button>
  );
}
