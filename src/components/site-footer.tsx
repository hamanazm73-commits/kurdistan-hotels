"use client";

import Link from "next/link";
import { Building2, Mail, Phone, MapPin } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { CITIES } from "@/lib/sample-data";

const PHONE = "0770 057 2004";
const WHATSAPP = "9647700572004";
const EMAIL = "info@kurdistan-hotels.com";

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884" />
    </svg>
  );
}

export function SiteFooter() {
  const { t, tCity } = useI18n();

  return (
    <footer className="mt-24 border-t bg-primary text-primary-foreground">
      {/* gold accent line */}
      <div className="h-1 w-full bg-gradient-to-r from-transparent via-gold to-transparent" />

      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 sm:grid-cols-2 lg:grid-cols-4">
        {/* brand */}
        <div className="sm:col-span-2 lg:col-span-1">
          <div className="flex items-center gap-2 text-lg font-bold">
            <span className="grid size-9 place-items-center rounded-xl bg-gold text-gold-foreground shadow-md">
              <Building2 className="size-5" />
            </span>
            {t("brand")}
          </div>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-primary-foreground/70">
            {t("footer_about")}
          </p>
        </div>

        {/* quick links */}
        <div>
          <h4 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gold">
            {t("footer_links")}
          </h4>
          <ul className="space-y-2.5 text-sm text-primary-foreground/80">
            {[
              { href: "/", label: t("nav_home") },
              { href: "/#hotels", label: t("nav_hotels") },
              { href: "/login", label: t("nav_login") },
            ].map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="inline-block transition-colors hover:translate-x-0.5 hover:text-gold rtl:hover:-translate-x-0.5"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* cities */}
        <div>
          <h4 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gold">
            {t("stat_cities")}
          </h4>
          <ul className="flex flex-wrap gap-2">
            {CITIES.map((c) => (
              <li key={c}>
                <Link
                  href="/#hotels"
                  className="inline-flex items-center gap-1 rounded-full bg-primary-foreground/10 px-3 py-1 text-xs text-primary-foreground/80 transition-colors hover:bg-gold hover:text-gold-foreground"
                >
                  <MapPin className="size-3" />
                  {tCity(c)}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* contact */}
        <div>
          <h4 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gold">
            {t("footer_contact")}
          </h4>
          <ul className="space-y-3 text-sm text-primary-foreground/80">
            <li>
              <a
                href={`tel:${PHONE.replace(/\s/g, "")}`}
                dir="ltr"
                className="inline-flex items-center gap-2.5 transition-colors hover:text-gold"
              >
                <span className="grid size-8 place-items-center rounded-lg bg-primary-foreground/10">
                  <Phone className="size-4" />
                </span>
                {PHONE}
              </a>
            </li>
            <li>
              <a
                href={`https://wa.me/${WHATSAPP}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 transition-colors hover:text-gold"
              >
                <span className="grid size-8 place-items-center rounded-lg bg-[#25D366] text-white">
                  <WhatsAppIcon className="size-4" />
                </span>
                WhatsApp
              </a>
            </li>
            <li>
              <a
                href={`mailto:${EMAIL}`}
                dir="ltr"
                className="inline-flex items-center gap-2.5 transition-colors hover:text-gold"
              >
                <span className="grid size-8 place-items-center rounded-lg bg-primary-foreground/10">
                  <Mail className="size-4" />
                </span>
                {EMAIL}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-primary-foreground/10 py-5 text-center text-xs text-primary-foreground/60">
        {t("footer_rights")}
      </div>
    </footer>
  );
}
