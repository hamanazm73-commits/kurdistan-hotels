"use client";

import { ThemeProvider } from "next-themes";
import { I18nProvider } from "@/lib/i18n";
import { CurrencyProvider } from "@/lib/currency";
import { AuthProvider } from "@/lib/auth";
import { SiteConfigProvider } from "@/lib/site-config";
import { Toaster } from "@/components/ui/sonner";
import { LanguageWelcome } from "@/components/language-welcome";
import { ComingSoonBanner } from "@/components/coming-soon-banner";
import { ListHotelCta } from "@/components/list-hotel-cta";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      disableTransitionOnChange
    >
      <I18nProvider>
        <SiteConfigProvider>
          <CurrencyProvider>
            <AuthProvider>
              <ComingSoonBanner />
              {children}
              <ListHotelCta />
              <LanguageWelcome />
              <Toaster richColors position="top-center" closeButton />
            </AuthProvider>
          </CurrencyProvider>
        </SiteConfigProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}
