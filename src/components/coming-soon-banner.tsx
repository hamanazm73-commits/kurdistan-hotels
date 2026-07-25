"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { Hammer } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useSiteConfig } from "@/lib/site-config";

/**
 * A slim, gold announcement strip pinned to the top of the site while the
 * owner is still adding hotels. It stays visible on scroll (sticky) and its
 * height is published as `--soon-banner-h` so the site header can sit just
 * below it.
 */
export function ComingSoonBanner() {
  const { t } = useI18n();
  const { comingSoon, ready } = useSiteConfig();
  const pathname = usePathname() || "";
  const onAdmin = pathname.startsWith("/hq") || pathname.startsWith("/login");
  const show = ready && comingSoon && !onAdmin;

  const ref = useRef<HTMLDivElement>(null);

  // Publish the strip's height so the sticky header can offset by it. Reset to
  // 0 whenever the strip isn't shown so the header returns flush to the top.
  useEffect(() => {
    const root = document.documentElement;
    if (!show) {
      root.style.setProperty("--soon-banner-h", "0px");
      return;
    }
    const el = ref.current;
    if (!el) return;
    const apply = () =>
      root.style.setProperty("--soon-banner-h", `${el.offsetHeight}px`);
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(el);
    return () => {
      ro.disconnect();
      root.style.setProperty("--soon-banner-h", "0px");
    };
  }, [show]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          ref={ref}
          initial={{ y: -12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="sticky top-0 z-40 overflow-hidden bg-gradient-to-r from-gold via-amber-300 to-gold text-[#122b45]"
          role="status"
        >
          {/* moving sheen */}
          <motion.span
            aria-hidden
            initial={{ x: "-120%" }}
            animate={{ x: "120%" }}
            transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut" }}
            className="pointer-events-none absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/45 to-transparent"
          />
          <div className="relative mx-auto flex max-w-6xl items-center justify-center gap-2 px-4 py-2 text-center">
            <motion.span
              animate={{ rotate: [0, -18, 0, 18, 0] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
              className="shrink-0"
            >
              <Hammer className="size-4" />
            </motion.span>
            <p className="text-xs font-semibold leading-snug sm:text-sm">
              <span className="font-extrabold">{t("soon_banner_title")}</span>{" "}
              <span className="font-medium">{t("soon_banner_text")}</span>
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
