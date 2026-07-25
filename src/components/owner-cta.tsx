"use client";

import Link from "next/link";
import { motion } from "motion/react";
import {
  Wallet,
  LayoutDashboard,
  Search,
  MessageCircle,
  ArrowRight,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import {
  OWNER_EYEBROW,
  OWNER_HEADING,
  OWNER_SUB,
  OWNER_PERKS,
} from "@/lib/site-content";

const ICONS = {
  wallet: Wallet,
  layout: LayoutDashboard,
  search: Search,
  message: MessageCircle,
} as const;

/** Homepage recruitment band for hotel owners → "list your hotel" page. */
export function OwnerCta() {
  const { t, lang } = useI18n();

  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden rounded-3xl border bg-primary p-8 text-primary-foreground sm:p-12"
      >
        {/* gold glow */}
        <div className="pointer-events-none absolute -end-16 -top-16 size-64 rounded-full bg-gold/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -start-10 size-56 rounded-full bg-gold/10 blur-3xl" />

        <div className="relative grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-gold">
              {OWNER_EYEBROW[lang]}
            </p>
            <h2 className="mt-2 text-3xl font-extrabold sm:text-4xl">
              {OWNER_HEADING[lang]}
            </h2>
            <p className="mt-3 max-w-md leading-relaxed text-primary-foreground/70">
              {OWNER_SUB[lang]}
            </p>
            <Link
              href="/list-your-hotel"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-gold px-6 py-3 text-base font-bold text-gold-foreground shadow-lg shadow-black/25 transition hover:bg-gold/90 active:scale-95"
            >
              {t("soon_list_cta")}
              <ArrowRight className="size-5 rtl:rotate-180" />
            </Link>
          </div>

          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            {OWNER_PERKS.map((perk, i) => {
              const Icon = ICONS[perk.icon];
              return (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.4, delay: Math.min(i * 0.08, 0.3) }}
                  className="flex items-start gap-3 rounded-2xl bg-primary-foreground/[0.06] p-4 ring-1 ring-primary-foreground/10"
                >
                  <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-gold/15 text-gold">
                    <Icon className="size-5" />
                  </span>
                  <span className="text-sm font-medium leading-relaxed">
                    {perk.text[lang]}
                  </span>
                </motion.li>
              );
            })}
          </ul>
        </div>
      </motion.div>
    </section>
  );
}
