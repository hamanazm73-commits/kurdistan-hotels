"use client";

import { useMemo, useState } from "react";
import { Search, ArrowDownUp } from "lucide-react";
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
import { CITIES } from "@/lib/sample-data";
import { effectivePrice, propertyKind, type PropertyKind } from "@/lib/types";
import { cn } from "@/lib/utils";
import { SectionIntro } from "./section-intro";

type Sort = "recommended" | "price_low" | "price_high" | "rating";

const SORT_LABEL: Record<Sort, string> = {
  recommended: "sort_recommended",
  price_low: "sort_price_low",
  price_high: "sort_price_high",
  rating: "sort_rating",
};

/** Copy + accent colour for each kind of listing section. */
const KIND_META: Record<
  PropertyKind,
  {
    id: string;
    eyebrow: string;
    title: string;
    sub: string;
    searchPh: string;
    empty: string;
    glow: string;
  }
> = {
  hotel: {
    id: "hotels",
    eyebrow: "hotels_eyebrow",
    title: "hotels_title",
    sub: "hotels_sub",
    searchPh: "search_ph",
    empty: "no_results",
    glow: "bg-gold/20",
  },
  farm: {
    id: "farms",
    eyebrow: "farms_eyebrow",
    title: "farms_title",
    sub: "farms_sub",
    searchPh: "search_farm_ph",
    empty: "farms_none",
    glow: "bg-emerald-500/25",
  },
};

/** One listing section (hotels or farms). Both share the same card, filters and
    booking flow — only the copy and the accent glow differ. */
function PropertySection({ kind }: { kind: PropertyKind }) {
  const { t, tCity } = useI18n();
  const { hotels, loading } = useHotels();
  const meta = KIND_META[kind];

  const [search, setSearch] = useState("");
  const [city, setCity] = useState<string>("all");
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [sort, setSort] = useState<Sort>("recommended");

  // every visible listing of this kind — also tells us whether to render at all
  const all = useMemo(
    () => hotels.filter((h) => !h.hidden && propertyKind(h) === kind),
    [hotels, kind],
  );

  const filtered = useMemo(() => {
    let list = all.filter((h) => {
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
      return matchesSearch && matchesCity && matchesFeatured;
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
  }, [all, search, city, featuredOnly, sort]);

  // An empty farms section would just be noise on the home page — hide it until
  // the first farm is added (also while loading, so it never flashes empty).
  // Hotels always render; the site is about hotels.
  if (kind === "farm" && all.length === 0) return null;

  return (
    <section
      id={meta.id}
      className="relative mx-auto max-w-7xl scroll-mt-20 px-6 py-16"
    >
      {/* soft glow behind the heading for a premium feel */}
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute left-1/2 top-4 -z-10 h-48 w-72 -translate-x-1/2 rounded-full blur-3xl",
          meta.glow,
        )}
      />
      <SectionIntro
        eyebrow={t(meta.eyebrow)}
        title={t(meta.title)}
        subtitle={t(meta.sub)}
      />
      <div className="mb-8 flex flex-col gap-5">
        {/* search */}
        <div className="relative">
          <Search className="absolute start-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t(meta.searchPh)}
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

          <div className="ms-auto flex items-center gap-3">
            <Select value={sort} onValueChange={(v) => v && setSort(v as Sort)}>
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
          {t(meta.empty)}
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

export function HotelsSection() {
  return <PropertySection kind="hotel" />;
}

export function FarmsSection() {
  return <PropertySection kind="farm" />;
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
