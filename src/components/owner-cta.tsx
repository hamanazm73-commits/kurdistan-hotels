"use client";

import { motion } from "motion/react";
import { Wallet, LayoutDashboard, Search, MessageCircle } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import {
  OWNER_EYEBROW,
  OWNER_HEADING,
  OWNER_SUB,
  OWNER_PERKS,
} from "@/lib/site-content";
import { siteWhatsAppUrl } from "@/lib/contact";

const ICONS = {
  wallet: Wallet,
  layout: LayoutDashboard,
  search: Search,
  message: MessageCircle,
} as const;

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347" />
    </svg>
  );
}

/** Homepage recruitment band for hotel owners → WhatsApp. */
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
            <a
              href={siteWhatsAppUrl(t("soon_list_msg"))}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#25D366] px-6 py-3 text-base font-bold text-white shadow-lg shadow-black/25 transition hover:bg-[#1ebe5d] active:scale-95"
            >
              <WhatsAppIcon className="size-5" />
              {t("soon_list_cta")}
            </a>
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
