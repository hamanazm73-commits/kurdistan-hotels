"use client";

import Link from "next/link";
import { Building2, Mail, Phone, MessageCircle } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export function SiteFooter() {
  const { t } = useI18n();
  return (
    <footer className="mt-24 border-t bg-primary text-primary-foreground">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 sm:grid-cols-2 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-2 text-lg font-bold">
            <Building2 className="size-5 text-gold" />
            {t("brand")}
          </div>
          <p className="mt-3 max-w-xs text-sm text-primary-foreground/70">
            {t("footer_about")}
          </p>
        </div>

        <div>
          <h4 className="mb-3 font-semibold text-gold">{t("footer_links")}</h4>
          <ul className="space-y-2 text-sm text-primary-foreground/80">
            <li>
              <Link href="/" className="hover:text-gold">
                {t("nav_home")}
              </Link>
            </li>
            <li>
              <Link href="/#hotels" className="hover:text-gold">
                {t("nav_hotels")}
              </Link>
            </li>
            <li>
              <Link href="/login" className="hover:text-gold">
                {t("nav_login")}
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="mb-3 font-semibold text-gold">{t("footer_contact")}</h4>
          <ul className="space-y-2 text-sm text-primary-foreground/80">
            <li className="flex items-center gap-2">
              <Phone className="size-4" /> 0770 057 2004
            </li>
            <li className="flex items-center gap-2">
              <Mail className="size-4" /> info@kurdistan-hotels.com
            </li>
            <li className="flex items-center gap-2">
              <MessageCircle className="size-4" /> WhatsApp
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
