"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Building2, LayoutDashboard, LogIn, LogOut, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ThemeToggle } from "./theme-toggle";
import { LanguageSwitcher } from "./language-switcher";
import { CurrencySwitcher } from "./currency-switcher";
import { LogoutButton } from "./logout-button";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const { t } = useI18n();
  const { user, role } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        scrolled
          ? "border-b bg-background/80 backdrop-blur-xl shadow-sm"
          : "bg-transparent",
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-bold">
          <span className="grid size-9 place-items-center rounded-xl bg-gold text-gold-foreground shadow-md">
            <Building2 className="size-5" />
          </span>
          <span className="text-lg tracking-tight">{t("brand")}</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <Button variant="ghost" nativeButton={false} render={<Link href="/" />}>
            {t("nav_home")}
          </Button>
          <Button
            variant="ghost"
            nativeButton={false}
            render={<Link href="/#hotels" />}
          >
            {t("nav_hotels")}
          </Button>
        </nav>

        <div className="flex items-center gap-1">
          <CurrencySwitcher />
          <LanguageSwitcher />
          <ThemeToggle />

          <div className="hidden items-center gap-1 md:flex">
            {role ? (
              <>
                <Button
                  variant="secondary"
                  size="sm"
                  className="gap-1.5"
                  nativeButton={false}
                  render={<Link href="/hq" />}
                >
                  <LayoutDashboard className="size-4" />
                  {t("nav_admin")}
                </Button>
                <LogoutButton
                  trigger={
                    <Button variant="ghost" size="sm" className="gap-1.5">
                      <LogOut className="size-4" />
                      {t("nav_logout")}
                    </Button>
                  }
                />
              </>
            ) : (
              <Button
                size="sm"
                className="gap-1.5"
                nativeButton={false}
                render={<Link href="/login" />}
              >
                <LogIn className="size-4" />
                {t("nav_login")}
              </Button>
            )}
          </div>

          {/* mobile menu */}
          <Sheet>
            <SheetTrigger
              render={
                <Button variant="ghost" size="icon" className="md:hidden" />
              }
            >
              <Menu className="size-5" />
            </SheetTrigger>
            <SheetContent className="w-72 p-4">
              <SheetTitle className="px-1 text-base">{t("brand")}</SheetTitle>
              <div className="mt-4 flex flex-col gap-2">
                <Button
                  variant="ghost"
                  className="justify-start"
                  nativeButton={false}
                  render={<Link href="/" />}
                >
                  {t("nav_home")}
                </Button>
                <Button
                  variant="ghost"
                  className="justify-start"
                  nativeButton={false}
                  render={<Link href="/#hotels" />}
                >
                  {t("nav_hotels")}
                </Button>
                {role ? (
                  <>
                    <Button
                      variant="secondary"
                      className="justify-start"
                      nativeButton={false}
                      render={<Link href="/hq" />}
                    >
                      {t("nav_admin")}
                    </Button>
                    <LogoutButton
                      trigger={
                        <Button variant="ghost" className="justify-start">
                          {t("nav_logout")}
                        </Button>
                      }
                    />
                  </>
                ) : (
                  <Button
                    className="justify-start"
                    nativeButton={false}
                    render={<Link href="/login" />}
                  >
                    {t("nav_login")}
                  </Button>
                )}
                {user?.email && (
                  <p className="px-2 pt-2 text-xs text-muted-foreground">
                    {user.email}
                  </p>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
