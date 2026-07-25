"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { Building2 } from "lucide-react";
import { useI18n } from "@/lib/i18n";

const MotionLink = motion.create(Link);

/**
 * A permanent floating call-to-action for hotel owners. Sits in the bottom
 * corner on every public page and opens the "list your hotel" landing page,
 * where owners read what's on offer and then contact us. Hidden on the
 * dashboard/login and on the landing page itself.
 */
export function ListHotelCta() {
  const { t } = useI18n();
  const pathname = usePathname() || "";
  if (
    pathname.startsWith("/hq") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/list-your-hotel")
  )
    return null;

  return (
    <MotionLink
      href="/list-your-hotel"
      aria-label={t("soon_list_cta")}
      initial={{ opacity: 0, scale: 0.8, y: 14 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: 0.9, type: "spring", stiffness: 200, damping: 18 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="fixed bottom-5 end-5 z-40 flex max-w-[calc(100vw-2.5rem)] items-center gap-2 rounded-full bg-gold p-1.5 pe-4 text-gold-foreground shadow-lg shadow-black/25 ring-1 ring-black/5"
    >
      {/* badge with a gentle attention pulse */}
      <span className="relative grid size-9 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-30" />
        <Building2 className="relative size-5" />
      </span>
      <span className="truncate text-xs font-bold leading-tight sm:text-sm">
        {t("soon_list_cta")}
      </span>
    </MotionLink>
  );
}
