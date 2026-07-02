"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { MapPin, Star, BedDouble } from "lucide-react";

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useI18n } from "@/lib/i18n";
import {
  effectivePrice,
  pickLang,
  mapsUrl,
  totalAvailable,
  type Hotel,
} from "@/lib/types";
import { useCurrency } from "@/lib/currency";
import { cn } from "@/lib/utils";
import { BookingDialog } from "./booking-dialog";

const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80";

/** Colour classes for an availability chip: green plenty, amber low, red none. */
function availTone(n: number): string {
  return n <= 0
    ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300"
    : n <= 3
      ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
      : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300";
}

function buildWhatsAppUrl(phone: string, hotelName: string, msg: string): string {
  let digits = phone.replace(/\D/g, "");
  if (digits.startsWith("0")) digits = "964" + digits.slice(1);
  const text = encodeURIComponent(`${msg} ${hotelName}`);
  return `https://wa.me/${digits}?text=${text}`;
}

export function HotelCard({ hotel, index = 0 }: { hotel: Hotel; index?: number }) {
  const { t, tCity, tFeature, lang } = useI18n();
  const { format } = useCurrency();
  const name = pickLang(hotel.name, hotel.nameI18n, lang);
  const price = effectivePrice(hotel);
  const hasDiscount = hotel.discount?.active;
  const pct = hasDiscount
    ? Math.round((1 - hotel.discount.newPrice / hotel.discount.oldPrice) * 100)
    : 0;
  const rooms = totalAvailable(hotel);
  const trackedRooms = (hotel.rooms ?? []).filter(
    (r) => typeof r.available === "number",
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.05, 0.4) }}
    >
      <Card className="group h-full overflow-hidden p-0 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl">
        <div className="relative aspect-[3/2] overflow-hidden bg-muted">
          {/* blurred fill so any image shape shows whole & looks nice */}
          <div
            aria-hidden
            className="absolute inset-0 scale-110 bg-cover bg-center opacity-55 blur-xl"
            style={{ backgroundImage: `url("${hotel.image || FALLBACK_IMG}")` }}
          />
          <Link href={`/hotels/${hotel.id}`} className="relative block size-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={hotel.image || FALLBACK_IMG}
              alt={hotel.name}
              className="size-full object-contain transition-transform duration-500 group-hover:scale-105"
              onError={(e) => {
                const img = e.currentTarget;
                img.onerror = null;
                img.src = FALLBACK_IMG;
              }}
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

          <div className="gold-glow absolute end-3 top-3 flex items-center gap-1 rounded-full bg-gold px-2.5 py-1 text-sm font-bold text-gold-foreground">
            <Star className="star-shine size-3.5 fill-gold-foreground text-gold-foreground" />
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
            <a
              href={mapsUrl(hotel)}
              target="_blank"
              rel="noopener noreferrer"
              title={t("view_on_map")}
              onClick={(e) => e.stopPropagation()}
              className="mt-1 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-primary hover:underline"
            >
              <MapPin className="size-3.5" />
              {tCity(hotel.city)}
            </a>
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

          {/* rooms available — per type when tracked, else the total */}
          {trackedRooms.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {trackedRooms.map((r) => (
                <span
                  key={r.type}
                  className={cn(
                    "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold",
                    availTone(r.available ?? 0),
                  )}
                >
                  <BedDouble className="size-3" />
                  {r.type} ·{" "}
                  {(r.available ?? 0) <= 0 ? t("room_full") : r.available}
                </span>
              ))}
            </div>
          ) : (
            <span
              className={cn(
                "inline-flex items-center gap-1.5 self-start rounded-md px-2.5 py-1 text-xs font-semibold",
                availTone(rooms),
              )}
            >
              <BedDouble className="size-3.5" />
              {rooms <= 0 ? t("room_full") : t("rooms_available", { n: rooms })}
            </span>
          )}

          <div className="mt-auto flex items-end justify-between gap-2 pt-2">
            <div>
              <div className="flex items-baseline gap-2">
                {hasDiscount && (
                  <span className="text-sm text-muted-foreground line-through">
                    {format(hotel.discount.oldPrice)}
                  </span>
                )}
                <span className="text-2xl font-extrabold text-gold">
                  {format(price)}
                </span>
              </div>
              <span className="text-xs text-muted-foreground">
                {t("per_night")}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {hotel.phone && (
                <a
                  href={buildWhatsAppUrl(hotel.phone, name, t("whatsapp_msg"))}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={t("whatsapp_cta")}
                  className="inline-flex size-9 items-center justify-center rounded-full bg-[#25D366] text-white shadow transition hover:bg-[#1ebe5d] active:scale-95"
                  onClick={(e) => e.stopPropagation()}
                >
                  <WhatsAppIcon className="size-4" />
                </a>
              )}
              <BookingDialog hotel={hotel} />
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
