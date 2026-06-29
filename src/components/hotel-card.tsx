"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { MapPin, Star, BedDouble } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useI18n } from "@/lib/i18n";
import { effectivePrice, pickLang, type Hotel } from "@/lib/types";
import { BookingDialog } from "./booking-dialog";

export function HotelCard({ hotel, index = 0 }: { hotel: Hotel; index?: number }) {
  const { t, tCity, tFeature, lang } = useI18n();
  const name = pickLang(hotel.name, hotel.nameI18n, lang);
  const price = effectivePrice(hotel);
  const hasDiscount = hotel.discount?.active;
  const pct = hasDiscount
    ? Math.round((1 - hotel.discount.newPrice / hotel.discount.oldPrice) * 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.05, 0.4) }}
    >
      <Card className="group h-full overflow-hidden p-0 transition-shadow hover:shadow-xl">
        <div className="relative aspect-[16/10] overflow-hidden">
          <Link href={`/hotels/${hotel.id}`} className="block size-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={hotel.image}
              alt={hotel.name}
              className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </Link>
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

          <div className="absolute start-3 top-3 flex flex-wrap gap-1.5">
            {hotel.featured && (
              <Badge className="bg-gold text-gold-foreground hover:bg-gold">
                ⭐ {t("badge_featured")}
              </Badge>
            )}
            {hotel.recommended && (
              <Badge className="bg-primary text-primary-foreground">
                👍 {t("badge_recommended")}
              </Badge>
            )}
            {hasDiscount && (
              <Badge variant="destructive">−{pct}%</Badge>
            )}
          </div>

          <div className="absolute end-3 top-3 flex items-center gap-1 rounded-full bg-background/90 px-2.5 py-1 text-sm font-semibold shadow">
            <Star className="size-3.5 fill-gold text-gold" />
            {hotel.rating.toFixed(1)}
          </div>
        </div>

        <div className="flex flex-col gap-3 p-5">
          <div>
            <Link href={`/hotels/${hotel.id}`}>
              <h3 className="line-clamp-1 text-lg font-bold transition-colors hover:text-primary">
                {name}
              </h3>
            </Link>
            <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="size-3.5" />
              {tCity(hotel.city)}
            </p>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {hotel.features.slice(0, 3).map((f) => (
              <span
                key={f}
                className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground"
              >
                {tFeature(f)}
              </span>
            ))}
          </div>

          <div className="mt-auto flex items-end justify-between gap-2 pt-2">
            <div>
              <div className="flex items-baseline gap-2">
                {hasDiscount && (
                  <span className="text-sm text-muted-foreground line-through">
                    ${hotel.discount.oldPrice}
                  </span>
                )}
                <span className="text-2xl font-extrabold text-primary">
                  ${price}
                </span>
              </div>
              <span className="text-xs text-muted-foreground">
                {t("per_night")} ·{" "}
                <span className="inline-flex items-center gap-1">
                  <BedDouble className="size-3" />
                  {t("rooms_left", { n: hotel.available })}
                </span>
              </span>
            </div>
            <BookingDialog hotel={hotel} />
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
