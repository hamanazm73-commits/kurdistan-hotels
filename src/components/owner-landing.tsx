"use client";

import { motion } from "motion/react";
import {
  Wallet,
  LayoutDashboard,
  Search,
  MessageCircle,
  CalendarCheck,
  Phone,
  Mail,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import {
  OWNER_EYEBROW,
  OWNER_HEADING,
  OWNER_SUB,
  OWNER_PERKS,
  OWNER_PERKS_HEADING,
  OWNER_STEPS,
  OWNER_STEPS_HEADING,
  OWNER_CONTACT_HEADING,
  OWNER_CONTACT_SUB,
  OWNER_WHATSAPP_CTA,
} from "@/lib/site-content";
import { CONTACT, siteWhatsAppUrl } from "@/lib/contact";

const PERK_ICONS = {
  wallet: Wallet,
  layout: LayoutDashboard,
  search: Search,
  message: MessageCircle,
} as const;

const STEP_ICONS = {
  message: MessageCircle,
  layout: LayoutDashboard,
  calendar: CalendarCheck,
} as const;

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884" />
    </svg>
  );
}

/**
 * Public "list your hotel" landing page: explains the offer to hotel owners,
 * walks them through how it works, and ends with a contact section. The
 * homepage band and the floating CTA both link here.
 */
export function OwnerLanding() {
  const { t, lang } = useI18n();
  const waMsg = t("soon_list_msg");

  return (
    <main className="pb-4">
      {/* ---------------- hero ---------------- */}
      <section className="relative overflow-hidden bg-primary text-primary-foreground">
        {/* gold glows */}
        <div className="pointer-events-none absolute -end-24 -top-24 size-80 rounded-full bg-gold/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 -start-16 size-72 rounded-full bg-gold/10 blur-3xl" />

        <div className="relative mx-auto max-w-4xl px-6 py-16 text-center sm:py-24">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-sm font-semibold uppercase tracking-wide text-gold"
          >
            {OWNER_EYEBROW[lang]}
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="mt-3 text-3xl font-extrabold leading-tight sm:text-5xl"
          >
            {OWNER_HEADING[lang]}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.12 }}
            className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-primary-foreground/75 sm:text-lg"
          >
            {OWNER_SUB[lang]}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <a
              href={siteWhatsAppUrl(waMsg)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-7 py-3.5 text-base font-bold text-white shadow-lg shadow-black/25 transition hover:bg-[#1ebe5d] active:scale-95 sm:w-auto"
            >
              <WhatsAppIcon className="size-5" />
              {OWNER_WHATSAPP_CTA[lang]}
            </a>
            <a
              href={`tel:${CONTACT.phone.replace(/\s/g, "")}`}
              dir="ltr"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary-foreground/10 px-7 py-3.5 text-base font-bold ring-1 ring-primary-foreground/20 transition hover:bg-primary-foreground/15 active:scale-95 sm:w-auto"
            >
              <Phone className="size-5" />
              {CONTACT.phone}
            </a>
          </motion.div>
        </div>
      </section>

      {/* ---------------- perks / why ---------------- */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="text-center text-2xl font-extrabold sm:text-3xl">
          {OWNER_PERKS_HEADING[lang]}
        </h2>
        <ul className="mt-10 grid gap-4 sm:grid-cols-2">
          {OWNER_PERKS.map((perk, i) => {
            const Icon = PERK_ICONS[perk.icon];
            return (
              <motion.li
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.4, delay: Math.min(i * 0.08, 0.3) }}
                className="flex items-start gap-4 rounded-2xl border bg-card p-5 shadow-sm"
              >
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-gold/15 text-gold">
                  <Icon className="size-5" />
                </span>
                <span className="text-base font-medium leading-relaxed">
                  {perk.text[lang]}
                </span>
              </motion.li>
            );
          })}
        </ul>
      </section>

      {/* ---------------- how it works ---------------- */}
      <section className="bg-muted/40 py-16">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-center text-2xl font-extrabold sm:text-3xl">
            {OWNER_STEPS_HEADING[lang]}
          </h2>
          <ol className="mt-10 grid gap-6 md:grid-cols-3">
            {OWNER_STEPS.map((step, i) => {
              const Icon = STEP_ICONS[step.icon];
              return (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.45, delay: Math.min(i * 0.1, 0.3) }}
                  className="relative rounded-2xl border bg-card p-6 shadow-sm"
                >
                  <span className="grid size-12 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-md shadow-primary/25">
                    <Icon className="size-6" />
                  </span>
                  <h3 className="mt-4 text-lg font-bold">{step.title[lang]}</h3>
                  <p className="mt-2 leading-relaxed text-muted-foreground">
                    {step.desc[lang]}
                  </p>
                </motion.li>
              );
            })}
          </ol>
        </div>
      </section>

      {/* ---------------- contact ---------------- */}
      <section id="contact" className="mx-auto max-w-4xl px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl border bg-primary p-8 text-center text-primary-foreground sm:p-12"
        >
          <div className="pointer-events-none absolute -end-16 -top-16 size-56 rounded-full bg-gold/20 blur-3xl" />
          <div className="relative">
            <h2 className="text-2xl font-extrabold sm:text-3xl">
              {OWNER_CONTACT_HEADING[lang]}
            </h2>
            <p className="mx-auto mt-3 max-w-md leading-relaxed text-primary-foreground/75">
              {OWNER_CONTACT_SUB[lang]}
            </p>

            <div className="mt-8 flex flex-col items-center gap-3">
              <a
                href={siteWhatsAppUrl(waMsg)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full max-w-sm items-center justify-center gap-2 rounded-full bg-[#25D366] px-7 py-4 text-lg font-bold text-white shadow-lg shadow-black/25 transition hover:bg-[#1ebe5d] active:scale-95"
              >
                <WhatsAppIcon className="size-6" />
                {OWNER_WHATSAPP_CTA[lang]}
              </a>

              <div className="mt-2 flex flex-col items-center gap-3 sm:flex-row">
                <a
                  href={`tel:${CONTACT.phone.replace(/\s/g, "")}`}
                  dir="ltr"
                  className="inline-flex items-center gap-2 text-primary-foreground/85 transition hover:text-gold"
                >
                  <Phone className="size-4" />
                  {CONTACT.phone}
                </a>
                <span className="hidden text-primary-foreground/30 sm:inline">
                  •
                </span>
                <a
                  href={`mailto:${CONTACT.email}`}
                  dir="ltr"
                  className="inline-flex items-center gap-2 text-primary-foreground/85 transition hover:text-gold"
                >
                  <Mail className="size-4" />
                  {CONTACT.email}
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      </section>
    </main>
  );
}
