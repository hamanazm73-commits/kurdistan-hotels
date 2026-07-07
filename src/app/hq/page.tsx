"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Crown, Lock, Loader2, ArrowLeft, Home, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { LogoutButton } from "@/components/logout-button";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { useHotels } from "@/lib/use-hotels";
import { HotelsPanel } from "@/components/admin/hotels-panel";
import { BookingsPanel } from "@/components/admin/bookings-panel";
import { FeedbackPanel } from "@/components/admin/feedback-panel";
import { AdminsPanel } from "@/components/admin/admins-panel";
import { ExchangeRateCard } from "@/components/admin/exchange-rate";

export default function AdminPage() {
  const { t } = useI18n();
  const { user, role, hotelId, isOwner, loading } = useAuth();
  const { hotels } = useHotels();

  if (loading) {
    return (
      <div className="grid min-h-dvh place-items-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!role) {
    return (
      <div className="grid min-h-dvh place-items-center p-4">
        <Card className="max-w-md p-8 text-center">
          <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-destructive/10 text-destructive">
            <Lock className="size-7" />
          </div>
          <h1 className="mt-4 text-xl font-bold">{t("admin_no_access")}</h1>
          {user?.email && (
            <p className="mt-1 text-sm text-muted-foreground">{user.email}</p>
          )}
          <div className="mt-6 flex flex-col gap-2">
            <Button nativeButton={false} render={<Link href="/login" />}>
              {t("nav_login")}
            </Button>
            {user && (
              <LogoutButton
                trigger={<Button variant="ghost">{t("nav_logout")}</Button>}
              />
            )}
            <Button
              variant="ghost"
              className="gap-1.5"
              nativeButton={false}
              render={<Link href="/" />}
            >
              <ArrowLeft className="size-4" />
              {t("login_back")}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Hotel owner: same layout as the site owner, but scoped to their one hotel.
  if (role === "hotel") {
    const myHotel = hotels.find((h) => h.id === hotelId);
    return (
      <div className="min-h-dvh overflow-x-hidden bg-muted/30">
        <header className="border-b bg-background">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
            <div className="min-w-0">
              <h1 className="truncate text-xl font-bold">
                {myHotel?.name ?? t("admin_my_hotel")}
              </h1>
              {user?.email && (
                <p className="truncate text-sm text-muted-foreground">
                  {user.email}
                </p>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                nativeButton={false}
                render={<Link href="/" />}
              >
                <Home className="size-4" />
                <span className="hidden sm:inline">{t("nav_home")}</span>
              </Button>
              <LanguageSwitcher />
              <ThemeToggle />
              <LogoutButton
                trigger={
                  <Button variant="ghost" size="sm" className="gap-1.5">
                    <LogOut className="size-4" />
                    <span className="hidden sm:inline">{t("nav_logout")}</span>
                  </Button>
                }
              />
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-6 py-8">
          <Tabs defaultValue="hotel">
            <TabsList>
              <TabsTrigger value="hotel">{t("admin_my_hotel")}</TabsTrigger>
              <TabsTrigger value="bookings">{t("admin_bookings")}</TabsTrigger>
            </TabsList>
            <TabsContent value="hotel" className="mt-6">
              <HotelsPanel ownerHotelId={hotelId ?? undefined} />
            </TabsContent>
            <TabsContent value="bookings" className="mt-6">
              <BookingsPanel hotelId={hotelId ?? undefined} />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-dvh overflow-x-hidden bg-muted/30">
      <header className="border-b bg-background">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="truncate text-xl font-bold">{t("admin_title")}</h1>
              <Badge
                variant={isOwner ? "default" : "secondary"}
                className="shrink-0 gap-1"
              >
                {isOwner && <Crown className="size-3" />}
                {t(isOwner ? "role_owner" : "role_admin")}
              </Badge>
            </div>
            {user?.email && (
              <p className="truncate text-sm text-muted-foreground">
                {user.email}
              </p>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <LanguageSwitcher />
            <ThemeToggle />
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              nativeButton={false}
              render={<Link href="/" />}
            >
              <Home className="size-4" />
              <span className="hidden sm:inline">{t("nav_home")}</span>
            </Button>
            <LogoutButton
              trigger={
                <Button variant="ghost" size="sm" className="gap-1.5">
                  <LogOut className="size-4" />
                  <span className="hidden sm:inline">{t("nav_logout")}</span>
                </Button>
              }
            />
          </div>
        </div>
      </header>

      <motion.main
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mx-auto max-w-6xl px-6 py-8"
      >
        <div className="mb-6">
          <ExchangeRateCard />
        </div>
        <Tabs defaultValue="hotels">
          <TabsList>
            <TabsTrigger value="hotels">{t("admin_hotels")}</TabsTrigger>
            <TabsTrigger value="bookings">{t("admin_bookings")}</TabsTrigger>
            <TabsTrigger value="feedback">{t("admin_feedback")}</TabsTrigger>
            {isOwner && (
              <TabsTrigger value="admins">{t("admin_admins")}</TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="hotels" className="mt-6">
            <HotelsPanel />
          </TabsContent>
          <TabsContent value="bookings" className="mt-6">
            <BookingsPanel />
          </TabsContent>
          <TabsContent value="feedback" className="mt-6">
            <FeedbackPanel />
          </TabsContent>
          {isOwner && (
            <TabsContent value="admins" className="mt-6">
              <AdminsPanel />
            </TabsContent>
          )}
        </Tabs>
      </motion.main>
    </div>
  );
}
