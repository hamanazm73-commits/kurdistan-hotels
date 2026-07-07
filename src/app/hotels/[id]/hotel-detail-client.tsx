"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import {
  ArrowLeft,
  MapPin,
  Star,
  Phone,
  BedDouble,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  CreditCard,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BookingDialog } from "@/components/booking-dialog";
import { useHotels } from "@/lib/use-hotels";
import { getHotelMedia, type HotelMedia } from "@/lib/hotels-db";
import { useI18n } from "@/lib/i18n";
import {
  effectivePrice,
  pickLang,
  mapsUrl,
  mediaSrc,
  paymentLabel,
  paymentColor,
  type Hotel,
} from "@/lib/types";
import { useCurrency } from "@/lib/currency";
import { cn } from "@/lib/utils";

/** Extract a YouTube video id from common URL shapes, else null. */
function youtubeId(url: string): string | null {
  const m = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|v\/)|youtu\.be\/)([\w-]{11})/,
  );
  return m ? m[1] : null;
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function buildWhatsAppUrl(phone: string, hotelName: string, msg: string): string {
  let digits = phone.replace(/\D/g, "");
  if (digits.startsWith("0")) digits = "964" + digits.slice(1);
  const text = encodeURIComponent(`${msg} ${hotelName}`);
  return `https://wa.me/${digits}?text=${text}`;
}

const FALLBACK_IMG = "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80";

export function HotelDetailClient({
  id,
  initialHotel,
}: {
  id: string;
  initialHotel: Hotel | null;
}) {
  const { t, tCity, tFeature, lang } = useI18n();
  const { format } = useCurrency();
  const { hotels, loading } = useHotels();
  // Prefer the live doc once it arrives; until then use the server-provided
  // hotel so the first paint already has content (good for SEO and speed).
  const hotel = hotels.find((h) => h.id === id) ?? initialHotel ?? undefined;
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState<number | null>(null);
  // Gallery + video live in a separate doc; load them on demand (fall back to
  // any legacy inline media still on the hotel doc for un-migrated hotels).
  const [media, setMedia] = useState<HotelMedia | null>(null);
  useEffect(() => {
    if (!id) return;
    let alive = true;
    getHotelMedia(id).then((m) => {
      if (alive) setMedia(m);
    });
    return () => {
      alive = false;
    };
  }, [id]);
  // Booking dialog opened by tapping a room row (preselects that room).
  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingRoom, setBookingRoom] = useState("");

  if (loading && !hotel) {
    return (
      <>
        <SiteHeader />
        <div className="mx-auto max-w-5xl px-6 py-8">
          <Skeleton className="mb-5 h-5 w-24 rounded-full" />
          <Skeleton className="aspect-[21/9] w-full rounded-2xl" />
          <div className="mt-7 grid gap-8 md:grid-cols-[1fr_320px]">
            <div className="space-y-5">
              <Skeleton className="h-9 w-2/3" />
              <Skeleton className="h-5 w-1/3" />
              <Skeleton className="h-24 w-full rounded-xl" />
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 rounded-lg" />
                ))}
              </div>
            </div>
            <Skeleton className="h-52 rounded-2xl" />
          </div>
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
  const galleryImages = media?.images ?? hotel.images ?? [];
  const video = media?.video ?? hotel.video ?? "";
  const gallery = [hotel.image, ...galleryImages].filter(Boolean).map(mediaSrc);
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
        <button
          type="button"
          onClick={() => gallery.length > 0 && setLightbox(active)}
          className="group relative block w-full cursor-zoom-in overflow-hidden rounded-2xl border bg-muted"
          aria-label={t("gallery_zoom")}
        >
          {/* blurred fill so any image shape shows whole & undistorted */}
          <div
            aria-hidden
            className="absolute inset-0 scale-110 bg-cover bg-center opacity-45 blur-2xl"
            style={{ backgroundImage: `url("${gallery[active] || FALLBACK_IMG}")` }}
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={gallery[active]}
            alt={name}
            className="relative mx-auto aspect-[21/9] w-full object-contain transition group-hover:brightness-95"
            onError={(e) => { const i = e.currentTarget; i.onerror = null; i.src = FALLBACK_IMG; }}
          />
          <span className="pointer-events-none absolute end-3 top-3 z-10 grid size-9 place-items-center rounded-full bg-black/50 text-white opacity-0 backdrop-blur-sm transition group-hover:opacity-100">
            <Maximize2 className="size-4" />
          </span>
        </button>
        {gallery.length > 1 && (
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {gallery.map((src, i) => (
              <button
                key={i}
                onClick={() => { setActive(i); setLightbox(i); }}
                className={cn(
                  "size-20 shrink-0 cursor-zoom-in overflow-hidden rounded-lg border-2 bg-muted transition",
                  i === active ? "border-primary" : "border-transparent",
                )}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" className="size-full object-contain"
                  onError={(e) => { const i = e.currentTarget; i.onerror = null; i.src = FALLBACK_IMG; }}
                />
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
              <a
                href={mapsUrl(hotel)}
                target="_blank"
                rel="noopener noreferrer"
                title={t("view_on_map")}
                className="flex items-center gap-1 transition-colors hover:text-primary hover:underline"
              >
                <MapPin className="size-4" />
                {tCity(hotel.city)}
              </a>
              <span className="flex items-center gap-1 font-semibold">
                <Star className="star-shine size-5 fill-gold text-gold" />
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

            {video && (
              <section className="mt-7">
                <h2 className="mb-3 text-lg font-bold">{t("detail_video")}</h2>
                {youtubeId(video) ? (
                  <div className="aspect-video overflow-hidden rounded-xl border">
                    <iframe
                      src={`https://www.youtube.com/embed/${youtubeId(video)}`}
                      title={t("detail_video")}
                      className="size-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <video
                    src={mediaSrc(video)}
                    controls
                    playsInline
                    className="aspect-video w-full rounded-xl border bg-black"
                  />
                )}
              </section>
            )}

            <section className="mt-7">
              <h2 className="mb-1 text-lg font-bold">{t("detail_rooms")}</h2>
              <p className="mb-3 text-sm text-muted-foreground">
                {t("detail_pick_room")}
              </p>
              <div className="grid gap-2">
                {hotel.rooms.map((r) => (
                  <button
                    type="button"
                    key={r.type}
                    disabled={r.available === 0}
                    onClick={() => {
                      setBookingRoom(r.type);
                      setBookingOpen(true);
                    }}
                    className="group flex w-full items-center justify-between gap-3 rounded-lg border bg-card px-4 py-3 text-start transition hover:border-primary hover:bg-accent/40 hover:shadow-sm active:scale-[0.99] disabled:pointer-events-none disabled:opacity-60"
                  >
                    <span className="flex min-w-0 flex-wrap items-center gap-2 font-medium">
                      <BedDouble className="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
                      {r.type}
                      {typeof r.available === "number" && (
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5 text-xs font-semibold",
                            r.available <= 0
                              ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300"
                              : r.available <= 3
                                ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                                : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
                          )}
                        >
                          {r.available <= 0
                            ? t("room_full")
                            : t("rooms_available", { n: r.available })}
                        </span>
                      )}
                    </span>
                    <span className="flex shrink-0 items-center gap-1.5 font-bold text-primary">
                      <span>
                        {format(r.price)}
                        <span className="text-xs font-normal text-muted-foreground">
                          {" "}
                          {t("per_night")}
                        </span>
                      </span>
                      <ChevronLeft className="size-4 shrink-0 opacity-40 transition group-hover:opacity-100 ltr:rotate-180" />
                    </span>
                  </button>
                ))}
              </div>
            </section>

            <BookingDialog
              hotel={hotel}
              open={bookingOpen}
              onOpenChange={setBookingOpen}
              initialRoomType={bookingRoom}
              trigger={false}
            />

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
                  <a
                    href={mapsUrl(hotel)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 font-medium text-primary hover:underline"
                  >
                    <MapPin className="size-4" />
                    {t("view_on_map")}
                  </a>
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
                    {format(hotel.discount.oldPrice)}
                  </span>
                )}
                <span className="text-3xl font-extrabold text-primary">
                  {format(price)}
                </span>
                <span className="text-sm text-muted-foreground">
                  {t("per_night")}
                </span>
              </div>
              <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                <BedDouble className="size-4" />
                {t("rooms_left", { n: hotel.available })}
              </p>
              <div className="mt-4 flex flex-col gap-2">
                <BookingDialog hotel={hotel} />
                {hotel.phone && (
                  <a
                    href={buildWhatsAppUrl(hotel.phone, name, t("whatsapp_msg"))}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#25D366] px-4 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-[#1ebe5d] active:scale-95"
                  >
                    <WhatsAppIcon className="size-4" />
                    {t("whatsapp_cta")}
                  </a>
                )}

                {hotel.payments && hotel.payments.length > 0 && (
                  <div className="mt-1 border-t pt-3">
                    <p className="mb-2 text-xs font-medium text-muted-foreground">
                      {t("pay_online")}
                    </p>
                    <div className="flex flex-col gap-2">
                      {hotel.payments.map((p, i) => (
                        <a
                          key={i}
                          href={p.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white shadow transition hover:opacity-90 active:scale-95"
                          style={{ backgroundColor: paymentColor(p.type) }}
                        >
                          <CreditCard className="size-4" />
                          {t("pay_online_via")} {paymentLabel(p.type)}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </motion.main>
      {lightbox !== null && gallery.length > 0 && (
        <Lightbox
          images={gallery}
          start={lightbox}
          alt={name}
          onClose={() => setLightbox(null)}
        />
      )}
      <SiteFooter />
    </>
  );
}

/** Fullscreen image viewer with prev/next, keyboard, swipe, and tap-to-close. */
function Lightbox({
  images,
  start,
  alt,
  onClose,
}: {
  images: string[];
  start: number;
  alt: string;
  onClose: () => void;
}) {
  const [i, setI] = useState(start);
  const prev = useCallback(
    () => setI((v) => (v - 1 + images.length) % images.length),
    [images.length],
  );
  const next = useCallback(
    () => setI((v) => (v + 1) % images.length),
    [images.length],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [prev, next, onClose]);

  // simple horizontal swipe on touch devices
  const [touchX, setTouchX] = useState<number | null>(null);
  function onTouchEnd(endX: number) {
    if (touchX === null) return;
    const dx = endX - touchX;
    if (Math.abs(dx) > 50) (dx > 0 ? prev : next)();
    setTouchX(null);
  }

  const multiple = images.length > 1;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
      onClick={onClose}
      onTouchStart={(e) => setTouchX(e.touches[0].clientX)}
      onTouchEnd={(e) => onTouchEnd(e.changedTouches[0].clientX)}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute end-4 top-4 z-10 grid size-10 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
        aria-label="Close"
      >
        <X className="size-5" />
      </button>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={images[i]}
        alt={alt}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[88dvh] max-w-full rounded-lg object-contain shadow-2xl"
        onError={(e) => { const el = e.currentTarget; el.onerror = null; el.src = FALLBACK_IMG; }}
      />

      {multiple && (
        <>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); prev(); }}
            className="absolute start-4 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
            aria-label="Previous"
          >
            <ChevronLeft className="size-6 rtl:rotate-180" />
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); next(); }}
            className="absolute end-4 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
            aria-label="Next"
          >
            <ChevronRight className="size-6 rtl:rotate-180" />
          </button>
          <div
            dir="ltr"
            className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-3 py-1 text-sm font-medium text-white"
          >
            {i + 1} / {images.length}
          </div>
        </>
      )}
    </div>
  );
}
