"use client";

import { motion, type Variants } from "motion/react";
import { MapPin, Sparkles, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.1 * i, duration: 0.6, ease: "easeOut" },
  }),
};

export function Hero() {
  const { t } = useI18n();

  return (
    <section className="relative overflow-hidden">
      {/* animated ambient background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-background to-background" />
        <div className="aurora-blob absolute -top-32 -start-24 size-[28rem] rounded-full bg-primary/30" />
        <div className="aurora-blob absolute -top-10 end-0 size-[24rem] rounded-full bg-gold/30 [animation-delay:-4s]" />
        <div className="aurora-blob absolute top-40 start-1/3 size-[20rem] rounded-full bg-primary/20 [animation-delay:-8s]" />
        <div
          className="absolute inset-0 opacity-[0.4] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]"
          style={{
            backgroundImage:
              "linear-gradient(to right, color-mix(in oklch, var(--foreground) 8%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in oklch, var(--foreground) 8%, transparent) 1px, transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />
      </div>

      <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 md:py-40">
        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={0}
            className="inline-flex items-center gap-2 rounded-full border bg-card/70 px-4 py-1.5 text-sm font-medium shadow-sm backdrop-blur"
          >
            <Sparkles className="size-4 text-gold" />
            {t("hero_badge")}
          </motion.div>

          <motion.h1
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={1}
            className="mt-6 text-4xl font-extrabold leading-tight tracking-tight sm:text-6xl"
          >
            {t("hero_title")}
          </motion.h1>

          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={2}
            className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground"
          >
            {t("hero_sub")}
          </motion.p>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={3}
            className="mt-9 flex flex-wrap items-center justify-center gap-3"
          >
            <Button
              size="lg"
              className="gap-2 text-base shadow-lg"
              nativeButton={false}
              render={<a href="#hotels" />}
            >
              <MapPin className="size-5" />
              {t("hero_cta")}
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="gap-2 text-base"
              nativeButton={false}
              render={<a href="#hotels" />}
            >
              <Star className="size-5 text-gold" />
              {t("hero_cta2")}
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
