"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  Check,
  ShieldCheck,
  Wallet,
  Headset,
  Zap,
  ArrowLeft,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { TRUST_HEADING, TRUST_ITEMS } from "@/lib/site-content";
import type { Lang } from "@/lib/types";

const TRUST_ICONS = {
  "shield-check": ShieldCheck,
  wallet: Wallet,
  headset: Headset,
  zap: Zap,
} as const;

/** The four languages, each with its own-script name and a warm greeting. */
const OPTIONS: {
  lang: Lang;
  native: string;
  greeting: string;
  sub: string;
  dir: "rtl" | "ltr";
}[] = [
  { lang: "ckb", native: "کوردی", greeting: "سڵاو", sub: "سۆرانی", dir: "rtl" },
  { lang: "ar", native: "العربية", greeting: "مرحبا", sub: "Arabic", dir: "rtl" },
  { lang: "en", native: "English", greeting: "Hello", sub: "English", dir: "ltr" },
  { lang: "kmr", native: "Kurmancî", greeting: "Silav", sub: "Kurmancî", dir: "ltr" },
];

const ORBS = [
  { cls: "size-72 -top-10 -start-10", dur: 11, delay: 0 },
  { cls: "size-56 bottom-0 end-0", dur: 13, delay: 2 },
  { cls: "size-40 top-1/3 end-1/4", dur: 9, delay: 1 },
];

export function LanguageWelcome() {
  const { setLang, lang } = useI18n();
  const [open, setOpen] = useState(false);
  const [picked, setPicked] = useState<Lang | null>(null);
  // "lang" asks which language; "intro" is the welcome that follows it
  const [step, setStep] = useState<"lang" | "intro">("lang");

  // First visit = no saved language yet. Decide on the client to avoid any
  // server/client mismatch (nothing renders on the server).
  useEffect(() => {
    try {
      if (!localStorage.getItem("lang")) setOpen(true);
    } catch {
      /* localStorage unavailable — just skip the splash */
    }
  }, []);

  // Lock body scroll while the splash is up.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  function choose(l: Lang) {
    setPicked(l);
    setLang(l); // persists to localStorage → never shows again
    // let the little "selected" beat play, then move to the welcome
    setTimeout(() => setStep("intro"), 480);
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="lang-welcome"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="fixed inset-0 z-[200] overflow-hidden bg-[#0a1a2b]"
          role="dialog"
          aria-modal="true"
          aria-label="Choose your language"
        >
          {/* soft gold glow orbs */}
          {ORBS.map((o, i) => (
            <motion.div
              key={i}
              aria-hidden
              animate={{ scale: [1, 1.15, 1], opacity: [0.35, 0.6, 0.35] }}
              transition={{
                duration: o.dur,
                repeat: Infinity,
                ease: "easeInOut",
                delay: o.delay,
              }}
              className={`pointer-events-none absolute rounded-full bg-gold/20 blur-3xl ${o.cls}`}
            />
          ))}
          {/* subtle top vignette */}
          <div className="pointer-events-none absolute inset-0 [background:radial-gradient(ellipse_100%_60%_at_50%_0%,rgba(223,178,80,0.10),transparent_60%)]" />

          {/* centre when it fits, scroll when the screen is short */}
          <div className="relative h-full overflow-y-auto">
            <div className="flex min-h-full items-center justify-center px-5 py-8">
              {step === "intro" ? (
                <IntroStep lang={lang} onEnter={() => setOpen(false)} />
              ) : (
              <motion.div
                initial={{ scale: 0.92, y: 26, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.96, opacity: 0 }}
                transition={{ type: "spring", stiffness: 150, damping: 18 }}
                className="w-full max-w-md text-center sm:max-w-lg"
              >
                {/* brand */}
                <motion.img
                  src="/logo-square.png"
                  alt=""
                  width={64}
                  height={64}
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.15, type: "spring", stiffness: 200, damping: 14 }}
                  className="mx-auto size-14 rounded-2xl shadow-lg shadow-black/40 sm:size-16"
                />
                <h1 className="mt-3.5 text-[1.6rem] font-extrabold leading-tight text-white sm:mt-4 sm:text-3xl">
                  هۆتێلەکانی کوردستان
                </h1>
                <p className="mx-auto mt-2 max-w-xs text-xs leading-relaxed text-white/55 sm:max-w-none sm:text-sm">
                  زمانەکەت هەڵبژێرە · اختر لغتك · Choose your language · Zimanê
                  xwe hilbijêre
                </p>

                <div className="mt-6 grid grid-cols-2 gap-2.5 sm:mt-8 sm:gap-4">
                  {OPTIONS.map((o, i) => {
                    const isPicked = picked === o.lang;
                    return (
                      <motion.button
                        key={o.lang}
                        type="button"
                        dir={o.dir}
                        onClick={() => choose(o.lang)}
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.28 + i * 0.08, duration: 0.4 }}
                        whileHover={{ y: -4 }}
                        whileTap={{ scale: 0.97 }}
                        className={`group relative flex min-h-[5.5rem] flex-col items-center justify-center overflow-hidden rounded-2xl border p-4 text-center transition-colors sm:min-h-[6.5rem] sm:p-5 ${
                          isPicked
                            ? "border-gold bg-gold/15"
                            : "border-white/12 bg-white/[0.06] hover:border-gold/70 hover:bg-white/[0.1]"
                        }`}
                      >
                        <span className="block text-xl font-extrabold text-white sm:text-2xl">
                          {o.native}
                        </span>
                        <span className="mt-1 flex items-center justify-center gap-1.5 text-xs font-medium text-gold sm:text-sm">
                          {o.greeting}
                          <span className="text-white/35">·</span>
                          <span className="text-white/45">{o.sub}</span>
                        </span>
                        {/* selected tick */}
                        <AnimatePresence>
                          {isPicked && (
                            <motion.span
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              className="absolute end-2.5 top-2.5 grid size-6 place-items-center rounded-full bg-gold text-gold-foreground"
                            >
                              <Check className="size-4" />
                            </motion.span>
                          )}
                        </AnimatePresence>
                        {/* sheen on hover */}
                        <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                      </motion.button>
                    );
                  })}
                </div>

                <p className="mx-auto mt-5 max-w-xs text-[0.7rem] leading-relaxed text-white/35 sm:mt-6 sm:max-w-none sm:text-xs">
                  دواتر دەتوانیت لە سەرەوەی سایتەکە زمان بگۆڕیت
                </p>
              </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** Enter labels, in the language the visitor just chose. */
const ENTER: Record<Lang, string> = {
  ckb: "دەستپێبکە",
  ar: "ابدأ",
  en: "Get started",
  kmr: "Dest pê bike",
};

/**
 * The welcome that follows the language choice: the site's name, then the
 * reasons to book here, each sliding in after the last.
 */
function IntroStep({ lang, onEnter }: { lang: Lang; onEnter: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-full max-w-md text-center sm:max-w-2xl"
    >
      {/* the name, arriving first */}
      <motion.img
        src="/logo-square.png"
        alt=""
        width={64}
        height={64}
        initial={{ scale: 0, rotate: -25 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 190, damping: 13 }}
        className="mx-auto size-16 rounded-2xl shadow-lg shadow-black/40 sm:size-20"
      />
      <motion.h1
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.5 }}
        className="mt-4 text-2xl font-extrabold text-white sm:text-4xl"
      >
        هۆتێلەکانی کوردستان
      </motion.h1>

      {/* the gold rule draws itself under the name */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 0.35, duration: 0.55, ease: "easeOut" }}
        className="mx-auto mt-3 h-0.5 w-24 origin-center rounded-full bg-gradient-to-r from-transparent via-gold to-transparent"
      />

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45, duration: 0.5 }}
        className="mt-4 text-base font-semibold text-gold sm:text-lg"
      >
        {TRUST_HEADING[lang]}
      </motion.p>

      <div className="mt-6 grid gap-2.5 sm:mt-8 sm:grid-cols-2 sm:gap-3">
        {TRUST_ITEMS.map((item, i) => {
          const Icon = TRUST_ICONS[item.icon];
          return (
            <motion.div
              key={item.icon}
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + i * 0.13, duration: 0.5 }}
              className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.06] p-4 text-start"
            >
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  delay: 0.7 + i * 0.13,
                  type: "spring",
                  stiffness: 260,
                  damping: 14,
                }}
                className="grid size-10 shrink-0 place-items-center rounded-xl bg-gold/15 text-gold"
              >
                <Icon className="size-5" />
              </motion.span>
              <span className="min-w-0">
                <span className="block text-sm font-bold text-white">
                  {item.title[lang]}
                </span>
                <span className="mt-0.5 block text-xs leading-relaxed text-white/55">
                  {item.desc[lang]}
                </span>
              </span>
            </motion.div>
          );
        })}
      </div>

      <motion.button
        type="button"
        onClick={onEnter}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.45 }}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        className="mt-7 inline-flex items-center gap-2 rounded-full bg-gold px-8 py-3 text-base font-bold text-gold-foreground shadow-lg shadow-black/30"
      >
        {ENTER[lang]}
        <ArrowLeft className="size-5 ltr:rotate-180" />
      </motion.button>
    </motion.div>
  );
}
