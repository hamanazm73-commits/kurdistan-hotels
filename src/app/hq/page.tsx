"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Crown, Lock, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { useHotels } from "@/lib/use-hotels";
import { HotelsPanel } from "@/components/admin/hotels-panel";
import { BookingsPanel } from "@/components/admin/bookings-panel";
import { AdminsPanel } from "@/components/admin/admins-panel";

export default function AdminPage() {
  const { t } = useI18n();
  const { user, role, hotelId, isOwner, loading, logout } = useAuth();
  const { hotels } = useHotels();

  function handleLogout() {
    if (window.confirm(t("logout_confirm"))) logout();
  }

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
              <Button variant="ghost" onClick={handleLogout}>
                {t("nav_logout")}
              </Button>
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
      <div className="min-h-dvh bg-muted/30">
        <header className="border-b bg-background">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-4">
            <div>
              <h1 className="text-xl font-bold">
                {myHotel?.name ?? t("admin_my_hotel")}
              </h1>
              {user?.email && (
                <p className="text-sm text-muted-foreground">{user.email}</p>
              )}
            </div>
            <div className="flex items-center gap-1">
              <LanguageSwitcher />
              <ThemeToggle />
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                {t("nav_logout")}
              </Button>
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
    <div className="min-h-dvh bg-muted/30">
      <header className="border-b bg-background">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold">{t("admin_title")}</h1>
              <Badge variant={isOwner ? "default" : "secondary"} className="gap-1">
                {isOwner && <Crown className="size-3" />}
                {t(isOwner ? "role_owner" : "role_admin")}
              </Badge>
            </div>
            {user?.email && (
              <p className="text-sm text-muted-foreground">{user.email}</p>
            )}
          </div>
          <div className="flex items-center gap-1">
            <LanguageSwitcher />
            <ThemeToggle />
            <Button
              variant="outline"
              size="sm"
              nativeButton={false}
              render={<Link href="/" />}
            >
              {t("login_back")}
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              {t("nav_logout")}
            </Button>
          </div>
        </div>
      </header>

      <motion.main
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mx-auto max-w-6xl px-6 py-8"
      >
        <Tabs defaultValue="hotels">
          <TabsList>
            <TabsTrigger value="hotels">{t("admin_hotels")}</TabsTrigger>
            <TabsTrigger value="bookings">{t("admin_bookings")}</TabsTrigger>
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
