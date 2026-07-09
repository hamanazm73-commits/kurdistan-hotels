"use client";

import { motion } from "motion/react";
import { ShieldCheck, Wallet, Headset, Zap } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { TRUST_EYEBROW, TRUST_HEADING, TRUST_ITEMS } from "@/lib/site-content";
import { SectionIntro } from "./section-intro";

const ICONS = {
  "shield-check": ShieldCheck,
  wallet: Wallet,
  headset: Headset,
  zap: Zap,
} as const;

export function TrustSection() {
  const { lang } = useI18n();

  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <SectionIntro
        center
        eyebrow={TRUST_EYEBROW[lang]}
        title={TRUST_HEADING[lang]}
      />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {TRUST_ITEMS.map((item, i) => {
          const Icon = ICONS[item.icon];
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: Math.min(i * 0.08, 0.4) }}
              className="flex flex-col items-center gap-3 rounded-2xl border bg-card p-6 text-center transition hover:-translate-y-1 hover:shadow-lg"
            >
              <span className="grid size-14 place-items-center rounded-2xl bg-gold/15 text-gold">
                <Icon className="size-7" />
              </span>
              <h3 className="text-lg font-bold">{item.title[lang]}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {item.desc[lang]}
              </p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
