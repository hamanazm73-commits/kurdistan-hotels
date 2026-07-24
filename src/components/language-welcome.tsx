"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import type { Lang } from "@/lib/types";

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
  const { setLang } = useI18n();
  const [open, setOpen] = useState(false);
  const [picked, setPicked] = useState<Lang | null>(null);

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
    // let the little "selected" beat play before closing
    setTimeout(() => setOpen(false), 480);
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
          className="fixed inset-0 z-[200] grid place-items-center overflow-hidden bg-[#0a1a2b] p-6"
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

          <motion.div
            initial={{ scale: 0.92, y: 26, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            transition={{ type: "spring", stiffness: 150, damping: 18 }}
            className="relative w-full max-w-lg text-center"
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
              className="mx-auto size-16 rounded-2xl shadow-lg shadow-black/40"
            />
            <h1 className="mt-4 text-2xl font-extrabold text-white sm:text-3xl">
              هۆتێلەکانی کوردستان
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-white/55">
              زمانەکەت هەڵبژێرە · اختر لغتك · Choose your language · Zimanê xwe
              hilbijêre
            </p>

            <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4">
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
                    className={`group relative overflow-hidden rounded-2xl border p-5 text-start transition-colors ${
                      isPicked
                        ? "border-gold bg-gold/15"
                        : "border-white/12 bg-white/[0.06] hover:border-gold/70 hover:bg-white/[0.1]"
                    }`}
                  >
                    <span className="block text-2xl font-extrabold text-white">
                      {o.native}
                    </span>
                    <span className="mt-1 flex items-center gap-1.5 text-sm font-medium text-gold">
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
                          className="absolute end-3 top-3 grid size-6 place-items-center rounded-full bg-gold text-gold-foreground"
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

            <p className="mt-6 text-xs text-white/35">
              {/* reassurance in the neutral-most script */}
              دواتر دەتوانیت لە سەرەوەی سایتەکە زمان بگۆڕیت
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
