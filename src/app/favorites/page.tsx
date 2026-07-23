"use client";

import Link from "next/link";
import { Heart, Inbox } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HotelCard } from "@/components/hotel-card";
import { useI18n } from "@/lib/i18n";
import { useHotels } from "@/lib/use-hotels";
import { useFavorites } from "@/lib/favorites";

export default function FavoritesPage() {
  const { t } = useI18n();
  const { hotels } = useHotels();
  const { ids } = useFavorites();

  // keep the visitor's own order (most recently added first)
  const saved = ids
    .map((id) => hotels.find((h) => h.id === id))
    .filter((h): h is NonNullable<typeof h> => Boolean(h) && !h!.hidden);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8 flex items-center gap-2.5">
          <span className="grid size-10 place-items-center rounded-xl bg-red-500/10 text-red-500">
            <Heart className="size-5 fill-red-500" />
          </span>
          <div>
            <h1 className="text-2xl font-extrabold">{t("favorites_title")}</h1>
            <p className="text-sm text-muted-foreground">
              {t("favorites_note")}
            </p>
          </div>
        </div>

        {saved.length === 0 ? (
          <Card className="grid place-items-center gap-3 py-16 text-center text-muted-foreground">
            <Inbox className="size-9" />
            <p>{t("favorites_empty")}</p>
            <Button nativeButton={false} render={<Link href="/#hotels" />}>
              {t("nav_hotels")}
            </Button>
          </Card>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {saved.map((h, i) => (
              <HotelCard key={h.id} hotel={h} index={i} />
            ))}
          </div>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
