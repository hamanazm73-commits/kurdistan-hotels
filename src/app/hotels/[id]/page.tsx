"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "motion/react";
import {
  ArrowLeft,
  MapPin,
  Star,
  Phone,
  BedDouble,
  Loader2,
  Check,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { BookingDialog } from "@/components/booking-dialog";
import { useHotels } from "@/lib/use-hotels";
import { useI18n } from "@/lib/i18n";
import { effectivePrice, pickLang } from "@/lib/types";
import { cn } from "@/lib/utils";

export default function HotelDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t, tCity, tFeature, lang } = useI18n();
  const { hotels, loading } = useHotels();
  const hotel = hotels.find((h) => h.id === id);
  const [active, setActive] = useState(0);

  if (loading && !hotel) {
    return (
      <>
        <SiteHeader />
        <div className="grid min-h-[60vh] place-items-center">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      </>
    );
  }

  if (!hotel) {
    return (
      <>
        <SiteHeader />
        <div className="grid min-h-[60vh] place-items-center gap-4 px-6 text-center">
          <p className="text-lg text-muted-foreground">{t("no_results")}</p>
          <Link href="/#hotels" className="text-primary underline">
            {t("detail_back")}
          </Link>
        </div>
        <SiteFooter />
      </>
    );
  }

  const price = effectivePrice(hotel);
  const hasDiscount = hotel.discount?.active;
  const gallery = [hotel.image, ...(hotel.images ?? [])].filter(Boolean);
  const name = pickLang(hotel.name, hotel.nameI18n, lang);
  const description = pickLang(hotel.description, hotel.descriptionI18n, lang);

  return (
    <>
      <SiteHeader />
      <motion.main
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mx-auto max-w-5xl px-6 py-8"
      >
        <Link
          href="/#hotels"
          className="mb-5 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4 rtl:rotate-180" />
          {t("detail_back")}
        </Link>

        {/* gallery */}
        <div className="overflow-hidden rounded-2xl border">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={gallery[active]}
            alt={name}
            className="aspect-[21/9] w-full object-cover"
          />
        </div>
        {gallery.length > 1 && (
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {gallery.map((src, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={cn(
                  "size-20 shrink-0 overflow-hidden rounded-lg border-2 transition",
                  i === active ? "border-primary" : "border-transparent",
                )}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" className="size-full object-cover" />
              </button>
            ))}
          </div>
        )}

        <div className="mt-7 grid gap-8 md:grid-cols-[1fr_320px]">
          {/* left: info */}
          <div>
            <div className="flex flex-wrap items-center gap-2">
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
            </div>

            <h1 className="mt-3 text-3xl font-extrabold">{name}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <MapPin className="size-4" />
                {tCity(hotel.city)}
              </span>
              <span className="flex items-center gap-1">
                <Star className="size-4 fill-gold text-gold" />
                {hotel.rating.toFixed(1)}
              </span>
            </div>

            {description && (
              <section className="mt-7">
                <h2 className="mb-2 text-lg font-bold">{t("detail_about")}</h2>
                <p className="leading-relaxed text-muted-foreground">
                  {description}
                </p>
              </section>
            )}

            {hotel.features.length > 0 && (
              <section className="mt-7">
                <h2 className="mb-3 text-lg font-bold">
                  {t("detail_amenities")}
                </h2>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {hotel.features.map((f) => (
                    <span
                      key={f}
                      className="flex items-center gap-2 rounded-lg border bg-card px-3 py-2 text-sm"
                    >
                      <Check className="size-4 text-green-600" />
                      {tFeature(f)}
                    </span>
                  ))}
                </div>
              </section>
            )}

            <section className="mt-7">
              <h2 className="mb-3 text-lg font-bold">{t("detail_rooms")}</h2>
              <div className="grid gap-2">
                {hotel.rooms.map((r) => (
                  <div
                    key={r.type}
                    className="flex items-center justify-between rounded-lg border bg-card px-4 py-3"
                  >
                    <span className="flex items-center gap-2 font-medium">
                      <BedDouble className="size-4 text-muted-foreground" />
                      {r.type}
                    </span>
                    <span className="font-bold text-primary">
                      ${r.price}
                      <span className="text-xs font-normal text-muted-foreground">
                        {" "}
                        {t("per_night")}
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {(hotel.address || hotel.phone) && (
              <section className="mt-7">
                <h2 className="mb-3 text-lg font-bold">{t("detail_contact")}</h2>
                <div className="space-y-2 text-sm text-muted-foreground">
                  {hotel.address && (
                    <p className="flex items-center gap-2">
                      <MapPin className="size-4" />
                      {hotel.address}
                    </p>
                  )}
                  {hotel.phone && (
                    <p className="flex items-center gap-2">
                      <Phone className="size-4" />
                      <span dir="ltr">{hotel.phone}</span>
                    </p>
                  )}
                </div>
              </section>
            )}
          </div>

          {/* right: sticky booking card */}
          <div>
            <Card className="sticky top-20 p-5">
              <div className="flex items-baseline gap-2">
                {hasDiscount && (
                  <span className="text-base text-muted-foreground line-through">
                    ${hotel.discount.oldPrice}
                  </span>
                )}
                <span className="text-3xl font-extrabold text-primary">
                  ${price}
                </span>
                <span className="text-sm text-muted-foreground">
                  {t("per_night")}
                </span>
              </div>
              <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                <BedDouble className="size-4" />
                {t("rooms_left", { n: hotel.available })}
              </p>
              <div className="mt-4">
                <BookingDialog hotel={hotel} />
              </div>
            </Card>
          </div>
        </div>
      </motion.main>
      <SiteFooter />
    </>
  );
}
