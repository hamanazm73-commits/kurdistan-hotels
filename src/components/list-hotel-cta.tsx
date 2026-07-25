"use client";

import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { useI18n } from "@/lib/i18n";
import { siteWhatsAppUrl } from "@/lib/contact";

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347" />
    </svg>
  );
}

/**
 * A permanent floating call-to-action for hotel owners. Sits in the bottom
 * corner on every public page and opens the site's WhatsApp with a prefilled
 * "list my hotel" message. Hidden on the dashboard/login.
 */
export function ListHotelCta() {
  const { t } = useI18n();
  const pathname = usePathname() || "";
  if (pathname.startsWith("/hq") || pathname.startsWith("/login")) return null;

  return (
    <motion.a
      href={siteWhatsAppUrl(t("soon_list_msg"))}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t("soon_list_cta")}
      initial={{ opacity: 0, scale: 0.8, y: 14 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: 0.9, type: "spring", stiffness: 200, damping: 18 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="fixed bottom-5 end-5 z-40 flex max-w-[calc(100vw-2.5rem)] items-center gap-2 rounded-full bg-gold p-1.5 pe-4 text-gold-foreground shadow-lg shadow-black/25 ring-1 ring-black/5"
    >
      {/* WhatsApp badge with a gentle attention pulse */}
      <span className="relative grid size-9 shrink-0 place-items-center rounded-full bg-[#25D366] text-white">
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#25D366] opacity-40" />
        <WhatsAppIcon className="relative size-5" />
      </span>
      <span className="truncate text-xs font-bold leading-tight sm:text-sm">
        {t("soon_list_cta")}
      </span>
    </motion.a>
  );
}
