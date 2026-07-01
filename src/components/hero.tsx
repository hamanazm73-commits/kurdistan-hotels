"use client";

import { motion, type Variants } from "motion/react";
import { MapPin, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 32 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.12 * i, duration: 0.7, ease: [0.25, 0.4, 0.25, 1] },
  }),
};

const STATS = [
  { labelKey: "stat_hotels", value: "12+" },
  { labelKey: "stat_cities", value: "6" },
  { labelKey: "stat_guests", value: "5,000+" },
] as const;

export function Hero() {
  const { t } = useI18n();

  return (
    <section className="relative flex min-h-[90vh] flex-col justify-center overflow-hidden">
      {/* Background photo */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&q=90"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 size-full object-cover"
        fetchPriority="high"
      />

      {/* Layered overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/30 to-black/80" />
      <div className="absolute inset-0 [background:radial-gradient(ellipse_120%_80%_at_50%_0%,transparent_45%,rgba(0,0,0,0.4)_100%)]" />

      {/* Content */}
      <div className="relative mx-auto w-full max-w-7xl px-6 pb-28 pt-36 text-white">
        <div className="mx-auto max-w-3xl text-center">

          {/* Pill badge */}
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
          {/* Gold accent line */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={2}
            className="mx-auto mt-4 h-1 w-20 rounded-full bg-gold opacity-80"
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

          {/* CTA buttons */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={4}
            className="mt-10 flex flex-wrap items-center justify-center gap-3"
          >
            <Button
              size="lg"
              className="h-12 gap-2 bg-gold px-8 text-base font-semibold text-gold-foreground shadow-xl shadow-black/40 hover:bg-gold/90"
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

        {/* Stats row */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={5}
          className="mx-auto mt-20 max-w-md overflow-hidden rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md"
        >
          <div className="grid grid-cols-3">
            {STATS.map(({ labelKey, value }, i) => (
              <div
                key={labelKey}
                className={cn(
                  "flex flex-col items-center gap-1 py-6",
                  i < STATS.length - 1 && "border-e border-white/20",
                )}
              >
                <span className="text-3xl font-extrabold text-gold sm:text-4xl">
                  {value}
                </span>
                <span className="text-xs text-white/70">{t(labelKey)}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Fade into page background */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}
