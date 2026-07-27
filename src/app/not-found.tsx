"use client";

import Link from "next/link";
import { Compass, ArrowLeft, Home } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { useI18n } from "@/lib/i18n";

/**
 * A dead link is someone who already wanted something from the site — the
 * default 404 just loses them, so point them back at the hotels.
 */
export default function NotFound() {
  const { t } = useI18n();

  return (
    <>
      <SiteHeader />
      <main className="mx-auto grid min-h-[60vh] max-w-xl place-items-center px-6 py-16 text-center">
        <div>
          <div className="mx-auto mb-6 grid size-20 place-items-center rounded-full bg-gold/10 ring-1 ring-gold/30">
            <Compass className="size-10 text-gold" />
          </div>
          <p className="text-6xl font-extrabold text-gold">404</p>
          <h1 className="mt-3 text-2xl font-bold">{t("nf_title")}</h1>
          <p className="mt-2 text-muted-foreground">{t("nf_sub")}</p>

          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link
              href="/#hotels"
              className="inline-flex items-center gap-2 rounded-full bg-gold px-5 py-2.5 font-semibold text-gold-foreground shadow transition hover:bg-gold/90 active:scale-95"
            >
              <ArrowLeft className="size-4 rtl:rotate-180" />
              {t("nf_hotels")}
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full border px-5 py-2.5 font-semibold transition hover:bg-muted active:scale-95"
            >
              <Home className="size-4" />
              {t("nf_home")}
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
