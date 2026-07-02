"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Inbox, Phone, CalendarDays, BedDouble, MapPin, Building2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import { useHotels } from "@/lib/use-hotels";
import { listBookings } from "@/lib/hotels-db";
import { formatPrice, type Booking } from "@/lib/types";

type Range = "week" | "month" | "all";
const DAY_MS = 86_400_000;

/** Stable grouping key for a booking's hotel: its id, else its name. */
function hotelKeyOf(b: Booking): string {
  return b.hotelId || b.hotel;
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function buildWhatsApp(phone: string, customerName: string): string {
  let digits = phone.replace(/\D/g, "");
  if (digits.startsWith("0")) digits = "964" + digits.slice(1);
  const msg = encodeURIComponent(`سڵاو ${customerName}، دەربارەی حیجزەکەت پەیوەندیت پێوەکرا.`);
  return `https://wa.me/${digits}?text=${msg}`;
}

export function BookingsPanel({ hotelId }: { hotelId?: string }) {
  const { t, tCity, lang } = useI18n();
  const { hotels } = useHotels();
  const [rows, setRows] = useState<(Booking & { id: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<Range>("all");
  const [fromDate, setFromDate] = useState("");
  const [cityFilter, setCityFilter] = useState("all");
  const [hotelKey, setHotelKey] = useState("all");
  const [roomFilter, setRoomFilter] = useState("all");
  // "now" captured when data loads, so render stays pure (no Date.now() in render)
  const [now, setNow] = useState(0);

  useEffect(() => {
    listBookings(hotelId)
      .then((r) => {
        setRows(r);
        setNow(Date.now());
      })
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, [hotelId]);

  // A stable key + city for each booking's hotel (by id, else by name).
  const cityByHotel = useMemo(() => {
    const byId = new Map(hotels.map((h) => [h.id, h] as const));
    const byName = new Map(hotels.map((h) => [h.name, h] as const));
    return (b: Booking) => {
      const h = (b.hotelId && byId.get(b.hotelId)) || byName.get(b.hotel);
      return h?.city ?? null;
    };
  }, [hotels]);

  // Distinct hotels present in the bookings, for the hotel filter dropdown.
  const bookingHotels = useMemo(() => {
    const seen = new Map<string, { key: string; name: string; city: string | null }>();
    for (const b of rows) {
      const key = hotelKeyOf(b);
      if (!seen.has(key)) seen.set(key, { key, name: b.hotel, city: cityByHotel(b) });
    }
    return [...seen.values()];
  }, [rows, cityByHotel]);

  // Distinct cities present in the bookings, for the city filter dropdown.
  const bookingCities = useMemo(() => {
    const set = new Set<string>();
    for (const b of rows) {
      const c = cityByHotel(b);
      if (c) set.add(c);
    }
    return [...set];
  }, [rows, cityByHotel]);

  // Distinct room types present in the bookings, for the room filter dropdown.
  const bookingRoomTypes = useMemo(() => {
    const set = new Set<string>();
    for (const b of rows) if (b.roomType) set.add(b.roomType);
    return [...set];
  }, [rows]);

  // Hotels shown in the hotel dropdown, narrowed to the chosen city.
  const hotelOptions =
    cityFilter === "all"
      ? bookingHotels
      : bookingHotels.filter((h) => h.city === cityFilter);

  // Filter by city + hotel + when the booking was made. A picked date shows
  // everything from that day onward (to reach old bookings).
  const filtered = useMemo(() => {
    const fromTs = fromDate ? new Date(`${fromDate}T00:00:00`).getTime() : null;
    const windowMs = range === "week" ? 7 * DAY_MS : range === "month" ? 30 * DAY_MS : Infinity;
    return rows.filter((b) => {
      if (cityFilter !== "all" && cityByHotel(b) !== cityFilter) return false;
      if (hotelKey !== "all" && hotelKeyOf(b) !== hotelKey) return false;
      if (roomFilter !== "all" && b.roomType !== roomFilter) return false;
      const c = b.createdAt;
      if (c == null) return true; // never hide undated bookings
      if (fromTs !== null) return c >= fromTs;
      return windowMs === Infinity || now - c <= windowMs;
    });
  }, [rows, range, fromDate, now, cityFilter, hotelKey, roomFilter, cityByHotel]);

  if (loading)
    return (
      <div className="grid place-items-center py-16">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );

  const showCity = !hotelId && bookingCities.length > 1;
  const showHotel = !hotelId && bookingHotels.length > 1;
  const showRoom = bookingRoomTypes.length > 1;

  const filterBar = (
    <div className="space-y-3 rounded-xl border bg-card p-3">
      {/* row 1 — city, hotel & room type, each on its own control */}
      {(showCity || showHotel || showRoom) && (
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {showCity && (
            <div className="grid gap-1">
              <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <MapPin className="size-3.5" />
                {t("book_city")}
              </label>
              <Select
                value={cityFilter}
                onValueChange={(v) => {
                  setCityFilter(v ?? "all");
                  setHotelKey("all");
                }}
              >
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("bookings_all_cities")}</SelectItem>
                  {bookingCities.map((c) => (
                    <SelectItem key={c} value={c}>
                      {tCity(c)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          {showHotel && (
            <div className="grid gap-1">
              <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Building2 className="size-3.5" />
                {t("book_hotel")}
              </label>
              <Select value={hotelKey} onValueChange={(v) => setHotelKey(v ?? "all")}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("bookings_all_hotels")}</SelectItem>
                  {hotelOptions.map((bh) => (
                    <SelectItem key={bh.key} value={bh.key}>
                      {bh.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          {showRoom && (
            <div className="grid gap-1">
              <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <BedDouble className="size-3.5" />
                {t("book_roomtype")}
              </label>
              <Select value={roomFilter} onValueChange={(v) => setRoomFilter(v ?? "all")}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("bookings_all_rooms")}</SelectItem>
                  {bookingRoomTypes.map((rt) => (
                    <SelectItem key={rt} value={rt}>
                      {rt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      )}

      {/* row 2 — date range + count */}
      <div className="flex flex-wrap items-center gap-2">
        {(["week", "month", "all"] as const).map((r) => (
          <Button
            key={r}
            type="button"
            size="sm"
            variant={!fromDate && range === r ? "default" : "outline"}
            className="rounded-full"
            onClick={() => {
              setRange(r);
              setFromDate("");
            }}
          >
            {t(r === "week" ? "filter_week" : r === "month" ? "filter_month" : "filter_all")}
          </Button>
        ))}
        <div className="ms-auto flex items-center gap-2">
          <span className="text-sm text-muted-foreground">{t("bookings_date")}</span>
          <Input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className={cn("h-9 w-40", fromDate && "border-primary")}
          />
          {fromDate && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-9 shrink-0"
              onClick={() => setFromDate("")}
              title={t("filter_all")}
            >
              <X className="size-4" />
            </Button>
          )}
        </div>
        <span className="w-full text-sm font-medium text-muted-foreground sm:w-auto">
          {t("bookings_count", { n: filtered.length })}
        </span>
      </div>
    </div>
  );

  if (rows.length === 0)
    return (
      <div className="space-y-3">
        {filterBar}
        <Card className="grid place-items-center gap-2 py-16 text-muted-foreground">
          <Inbox className="size-8" />
          <p>{t("admin_bookings")} — 0</p>
        </Card>
      </div>
    );

  return (
    <div className="space-y-3">
      {filterBar}

      {filtered.length === 0 ? (
        <Card className="grid place-items-center gap-2 py-16 text-muted-foreground">
          <Inbox className="size-8" />
          <p>{t("bookings_none_range")}</p>
        </Card>
      ) : (
        <>
      {/* ── Mobile: one card per booking ── */}
      <div className="grid gap-3 md:hidden">
        {filtered.map((b) => (
          <Card key={b.id} className="p-4">
            {/* header: name + total */}
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate font-bold">{b.name}</p>
                <p className="truncate text-sm font-medium">{b.hotel}</p>
                {cityByHotel(b) && (
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="size-3 shrink-0" />
                    {tCity(cityByHotel(b)!)}
                  </p>
                )}
              </div>
              <span className="shrink-0 text-base font-extrabold text-gold">
                {formatPrice(b.roomPrice * b.nights, lang)}
              </span>
            </div>

            {/* details grid */}
            <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
              <span className="text-muted-foreground">{t("book_roomtype")}</span>
              <span className="flex items-center gap-1 font-medium">
                <BedDouble className="size-3.5 shrink-0 text-muted-foreground" />
                {b.roomType}
              </span>
              <span className="text-muted-foreground">{t("book_checkin")}</span>
              <span dir="ltr" className="flex items-center gap-1 font-medium">
                <CalendarDays className="size-3.5 shrink-0 text-muted-foreground" />
                {b.checkIn}
              </span>
              <span className="text-muted-foreground">{t("book_nights")}</span>
              <span className="font-medium">{b.nights} {t("per_night").replace("/", "").trim()}</span>
            </div>

            {/* phone + whatsapp */}
            <div className="mt-3 flex items-center gap-2 border-t pt-3">
              <a
                href={`tel:${b.phone}`}
                dir="ltr"
                className="flex flex-1 items-center gap-2 rounded-lg border bg-muted/40 px-3 py-2 text-sm font-medium text-primary active:bg-muted"
              >
                <Phone className="size-4 shrink-0" />
                {b.phone}
              </a>
              <a
                href={buildWhatsApp(b.phone, b.name)}
                target="_blank"
                rel="noopener noreferrer"
                title="WhatsApp"
                className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#25D366] text-white transition-colors hover:bg-[#1ebe5d] active:scale-95"
              >
                <WhatsAppIcon className="size-5" />
              </a>
            </div>
          </Card>
        ))}
      </div>

      {/* ── Desktop: table ── */}
      <Card className="hidden overflow-hidden p-0 md:block">
        <Table className="[&_tbody_tr:nth-child(even)]:bg-muted/30">
          <TableHeader>
            <TableRow>
              <TableHead>{t("book_hotel")}</TableHead>
              <TableHead>{t("book_name")}</TableHead>
              <TableHead>{t("book_phone")}</TableHead>
              <TableHead>{t("book_roomtype")}</TableHead>
              <TableHead>{t("book_checkin")}</TableHead>
              <TableHead>{t("book_nights")}</TableHead>
              <TableHead>{t("book_total")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((b) => (
              <TableRow key={b.id}>
                <TableCell className="font-medium">
                  {b.hotel}
                  {cityByHotel(b) && (
                    <span className="mt-0.5 flex items-center gap-1 text-xs font-normal text-muted-foreground">
                      <MapPin className="size-3 shrink-0" />
                      {tCity(cityByHotel(b)!)}
                    </span>
                  )}
                </TableCell>
                <TableCell>{b.name}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <a
                      href={`tel:${b.phone}`}
                      dir="ltr"
                      className="flex items-center gap-1 font-medium text-primary hover:underline"
                    >
                      <Phone className="size-3.5 shrink-0" />
                      {b.phone}
                    </a>
                    <a
                      href={buildWhatsApp(b.phone, b.name)}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="WhatsApp"
                      className="inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-[#25D366] text-white transition-colors hover:bg-[#1ebe5d]"
                    >
                      <WhatsAppIcon className="size-3" />
                    </a>
                  </div>
                </TableCell>
                <TableCell>{b.roomType}</TableCell>
                <TableCell>
                  <span dir="ltr">{b.checkIn}</span>
                </TableCell>
                <TableCell>{b.nights}</TableCell>
                <TableCell className="font-bold text-gold">
                  {formatPrice(b.roomPrice * b.nights, lang)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
        </>
      )}
    </div>
  );
}
