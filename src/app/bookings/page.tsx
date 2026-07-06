"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CalendarDays, BedDouble, Trash2, Inbox } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { useCurrency } from "@/lib/currency";
import { useHotels } from "@/lib/use-hotels";
import {
  getMyBookings,
  removeMyBooking,
  type MyBooking,
} from "@/lib/my-bookings";
import { mediaSrc, paymentLabel, paymentColor } from "@/lib/types";

export default function MyBookingsPage() {
  const { t } = useI18n();
  const { format } = useCurrency();
  const { hotels } = useHotels();
  const [bookings, setBookings] = useState<MyBooking[]>([]);

  useEffect(() => {
    const load = () => setBookings(getMyBookings());
    load();
    window.addEventListener("my-bookings-changed", load);
    return () => window.removeEventListener("my-bookings-changed", load);
  }, []);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="text-2xl font-extrabold">{t("my_bookings")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("my_bookings_note")}
        </p>

        {bookings.length === 0 ? (
          <Card className="mt-8 grid place-items-center gap-3 py-16 text-center text-muted-foreground">
            <Inbox className="size-9" />
            <p>{t("my_bookings_empty")}</p>
            <Button nativeButton={false} render={<Link href="/#hotels" />}>
              {t("nav_hotels")}
            </Button>
          </Card>
        ) : (
          <div className="mt-6 space-y-4">
            {bookings.map((b) => {
              const hotel = hotels.find((h) => h.id === b.hotelId);
              return (
                <Card key={b.id} className="overflow-hidden p-0">
                  <div className="flex gap-4 p-4">
                    <Link
                      href={`/hotels/${b.hotelId}`}
                      className="size-20 shrink-0 overflow-hidden rounded-lg bg-muted"
                    >
                      {hotel && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={mediaSrc(hotel.image)}
                          alt=""
                          className="size-full object-cover"
                        />
                      )}
                    </Link>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <Link
                            href={`/hotels/${b.hotelId}`}
                            className="font-bold hover:text-primary"
                          >
                            {b.hotel}
                          </Link>
                          <span className="ms-2 inline-block rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                            {t("booking_status_pending")}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeMyBooking(b.id)}
                          className="shrink-0 text-muted-foreground transition-colors hover:text-destructive"
                          title={t("book_remove")}
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                      <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <BedDouble className="size-3.5 shrink-0" />
                          {b.roomType}
                        </span>
                        <span dir="ltr" className="flex items-center gap-1">
                          <CalendarDays className="size-3.5 shrink-0" />
                          {b.checkIn}
                        </span>
                        <span>
                          {t("book_nights")}: {b.nights}
                        </span>
                        <span className="font-bold text-gold">
                          {format(b.roomPrice * b.nights)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {hotel?.payments && hotel.payments.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2 border-t bg-muted/30 p-3">
                      <span className="text-xs font-medium text-muted-foreground">
                        {t("pay_online")}:
                      </span>
                      {hotel.payments.map((p, i) => (
                        <a
                          key={i}
                          href={p.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-white transition hover:opacity-90"
                          style={{ backgroundColor: paymentColor(p.type) }}
                        >
                          {paymentLabel(p.type)}
                        </a>
                      ))}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
