"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { Hammer } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useSiteConfig } from "@/lib/site-config";
import { siteWhatsAppUrl } from "@/lib/contact";

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347" />
    </svg>
  );
}

/**
 * A slim, gold announcement strip pinned to the top of the site while the
 * owner is still adding hotels. It stays visible on scroll (sticky) and its
 * height is published as `--soon-banner-h` so the site header can sit just
 * below it. Also carries a "list your hotel" WhatsApp CTA for hotel owners.
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
          <div className="relative mx-auto flex max-w-6xl flex-col items-center justify-center gap-1.5 px-4 py-2 text-center sm:flex-row sm:gap-4">
            {/* notice */}
            <div className="flex items-center justify-center gap-2">
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

            {/* list-your-hotel CTA → WhatsApp */}
            <a
              href={siteWhatsAppUrl(t("soon_list_msg"))}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[#122b45] px-3.5 py-1.5 text-xs font-bold text-white shadow-sm transition hover:brightness-125 active:scale-95 sm:text-sm"
            >
              <WhatsAppIcon className="size-4 text-[#25D366]" />
              {t("soon_list_cta")}
            </a>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
