"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, useInView, type Variants } from "motion/react";
import { MapPin, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { useHotels } from "@/lib/use-hotels";
import { propertyKind } from "@/lib/types";
import { cn } from "@/lib/utils";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 32 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.12 * i, duration: 0.7, ease: [0.25, 0.4, 0.25, 1] },
  }),
};

const ORBS = [
  { cls: "size-80 top-1/4 -right-10", color: "oklch(0.78 0.15 68 / 0.14)", dur: 9, delay: 0 },
  { cls: "size-56 top-1/2 -left-10", color: "oklch(0.78 0.15 68 / 0.09)", dur: 12, delay: 3 },
  { cls: "size-40 bottom-1/3 right-1/3", color: "oklch(0.85 0.12 68 / 0.11)", dur: 10, delay: 1.5 },
] as const;

function AnimatedStat({
  value,
  label,
  hasBorderEnd,
}: {
  value: string;
  label: string;
  hasBorderEnd?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const [ready, setReady] = useState(false);
  const [display, setDisplay] = useState("0");

  // fallback so the number never stays stuck at 0 if the observer never fires
  useEffect(() => {
    const id = setTimeout(() => setReady(true), 1200);
    return () => clearTimeout(id);
  }, []);

  useEffect(() => {
    if (!inView && !ready) return;
    const match = value.match(/^([\d,]+)(\+?)$/);
    if (!match) { setDisplay(value); return; }

    const num = parseInt(match[1].replace(/,/g, ""), 10);
    const suffix = match[2] ?? "";
    const duration = 1800;
    let t0: number | null = null;

    const tick = (ts: number) => {
      if (t0 === null) t0 = ts;
      const p = Math.min((ts - t0) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      const cur = Math.floor(eased * num);
      setDisplay((cur >= 1000 ? cur.toLocaleString() : String(cur)) + suffix);
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, ready, value]);

  return (
    <div
      ref={ref}
      className={cn(
        "flex flex-col items-center gap-1 py-6",
        hasBorderEnd && "border-e border-white/20",
      )}
    >
      <span className="text-3xl font-extrabold text-gold sm:text-4xl">{display}</span>
      <span className="text-xs text-white/70">{label}</span>
    </div>
  );
}

export function Hero() {
  const { t } = useI18n();
  const { hotels } = useHotels();
  const { scrollY } = useScroll();
  const bgY = useTransform(scrollY, [0, 700], [0, -90]);
  const contentOpacity = useTransform(scrollY, [0, 450], [1, 0.55]);

  // real figures, computed from the hotels shown on the site (excludes hidden)
  const visible = hotels.filter((h) => !h.hidden);
  // total rooms on the site: sum tracked room counts per hotel, and when a
  // hotel hasn't set counts, fall back to how many room types it lists
  const roomsTotal = visible.reduce((sum, h) => {
    const tracked = (h.rooms ?? []).filter(
      (r) => typeof r.available === "number",
    );
    const n = tracked.length
      ? tracked.reduce((s, r) => s + Math.max(0, r.available ?? 0), 0)
      : (h.rooms?.length ?? 0);
    return sum + n;
  }, 0);
  const stats = [
    // farms live in the same collection, so count only actual hotels here
    {
      labelKey: "stat_hotels",
      value: String(visible.filter((h) => propertyKind(h) === "hotel").length),
    },
    {
      labelKey: "stat_cities",
      value: String(new Set(visible.map((h) => h.city)).size),
    },
    { labelKey: "stat_rooms", value: String(roomsTotal) },
  ];

  return (
    <section className="relative flex min-h-[90vh] flex-col justify-center overflow-hidden">
      {/* Parallax background */}
      <motion.div style={{ y: bgY }} className="absolute inset-0 scale-[1.22] origin-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&q=80"
          srcSet="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=768&q=72 768w, https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1280&q=78 1280w, https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80 1920w"
          sizes="100vw"
          alt=""
          aria-hidden="true"
          className="size-full object-cover"
          fetchPriority="high"
        />
      </motion.div>

      {/* Overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/35 to-black/85" />
      <div className="absolute inset-0 [background:radial-gradient(ellipse_120%_80%_at_50%_0%,transparent_45%,rgba(0,0,0,0.4)_100%)]" />

      {/* Floating glow orbs */}
      {ORBS.map((orb, i) => (
        <motion.div
          key={i}
          animate={{ y: [0, -24, 0], scale: [1, 1.12, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: orb.dur, repeat: Infinity, ease: "easeInOut", delay: orb.delay }}
          style={{ background: orb.color }}
          className={cn("pointer-events-none absolute rounded-full blur-3xl", orb.cls)}
        />
      ))}

      {/* Content */}
      <motion.div
        style={{ opacity: contentOpacity }}
        className="relative mx-auto w-full max-w-7xl px-6 pb-28 pt-36 text-white"
      >
        <div className="mx-auto max-w-3xl text-center">
          {/* Badge */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={0}
            className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-medium backdrop-blur-sm"
          >
            <Star className="size-3.5 fill-gold text-gold" />
            {t("hero_badge")}
          </motion.div>

          {/* Title */}
          <motion.h1
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={1}
            className="mt-7 text-4xl font-extrabold leading-[1.15] tracking-tight drop-shadow-lg sm:text-5xl md:text-6xl"
          >
            {t("hero_title")}
          </motion.h1>

          {/* Animated gold accent line */}
          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 0.85 }}
            transition={{ delay: 0.9, duration: 0.7, ease: [0.25, 0.4, 0.25, 1] }}
            className="mx-auto mt-4 h-1 w-24 rounded-full bg-gold origin-center"
          />

          {/* Subtitle */}
          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={3}
            className="mx-auto mt-6 max-w-xl text-lg text-white/80 sm:text-xl"
          >
            {t("hero_sub")}
          </motion.p>

          {/* CTAs */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={4}
            className="mt-10 flex flex-wrap items-center justify-center gap-3"
          >
            <Button
              size="lg"
              className="h-12 gap-2 bg-gold px-8 text-base font-semibold text-gold-foreground shadow-xl shadow-black/40 hover:bg-gold/90 active:scale-95 transition-transform"
              nativeButton={false}
              render={<a href="#hotels" />}
            >
              <MapPin className="size-5" />
              {t("hero_cta")}
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-12 gap-2 border-white/30 bg-white/10 px-8 text-base text-white backdrop-blur-sm hover:bg-white/20 hover:text-white"
              nativeButton={false}
              render={<a href="#hotels" />}
            >
              <Star className="size-5 fill-gold text-gold" />
              {t("hero_cta2")}
            </Button>
          </motion.div>
        </div>

        {/* Stats with count-up */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={5}
          className="mx-auto mt-20 max-w-md overflow-hidden rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md"
        >
          <div className="grid grid-cols-3">
            {stats.map(({ labelKey, value }, i) => (
              <AnimatedStat
                key={labelKey}
                value={value}
                label={t(labelKey)}
                hasBorderEnd={i < stats.length - 1}
              />
            ))}
          </div>
        </motion.div>
      </motion.div>

      {/* Bottom fade */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}
