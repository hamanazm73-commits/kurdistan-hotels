"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Sparkles, Minus, Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useI18n } from "@/lib/i18n";
import { useCurrency } from "@/lib/currency";
import { useSiteConfig } from "@/lib/site-config";
import {
  roomPriceOn,
  roomTypeLabel,
  seasonFor,
  buildBookingWhatsAppUrl,
  type Hotel,
} from "@/lib/types";
import {
  ORIGIN_CITIES,
  ORIGIN_OTHER,
  ORIGIN_OTHER_LABEL,
} from "@/lib/site-content";
import { track } from "@/lib/analytics";
import { addMyBooking } from "@/lib/my-bookings";
import { cn } from "@/lib/utils";

/** ISO "YYYY-MM-DD" -> "DD/MM/YYYY" for display. */
const fmtDate = (iso: string) => iso.split("-").reverse().join("/");

export function BookingDialog({
  hotel,
  open: openProp,
  onOpenChange,
  initialRoomType,
  trigger = true,
}: {
  hotel: Hotel;
  /** control the dialog from outside (e.g. open it from a room row) */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** room type to preselect when the dialog opens */
  initialRoomType?: string;
  /** render the built-in "Book now" trigger button (default true) */
  trigger?: boolean;
}) {
  const { t, lang } = useI18n();
  const { format } = useCurrency();
  const { comingSoon } = useSiteConfig();
  const controlled = openProp !== undefined;
  const [openState, setOpenState] = useState(false);
  const open = controlled ? openProp : openState;
  const setOpen = (o: boolean) => {
    if (!controlled) setOpenState(o);
    onOpenChange?.(o);
  };
  const [submitting, setSubmitting] = useState(false);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [nights, setNights] = useState("1");
  const [roomType, setRoomType] = useState(initialRoomType ?? "");
  // adults split by gender — a party is rarely all one gender (a couple is
  // 1 + 1), so count each rather than asking for a single answer
  const [males, setMales] = useState(1);
  const [females, setFemales] = useState(0);
  const [childAges, setChildAges] = useState<number[]>([]);
  const guests = males + females;
  const [fromCity, setFromCity] = useState("");
  const [fromCityOther, setFromCityOther] = useState("");

  /** What we store for origin: the free-text city when "another city" is picked. */
  const originCity =
    fromCity === ORIGIN_OTHER ? fromCityOther.trim() : fromCity;

  // preselect the tapped room each time the dialog opens
  useEffect(() => {
    if (open && initialRoomType) setRoomType(initialRoomType);
  }, [open, initialRoomType]);

  const room = hotel.rooms.find((r) => r.type === roomType);
  // price for the chosen check-in date — a season's price if one covers it,
  // otherwise the room's base price
  const roomPrice = room ? roomPriceOn(hotel, roomType, checkIn) : 0;
  const total = useMemo(
    () => roomPrice * Math.max(1, Number(nights) || 1),
    [roomPrice, nights],
  );
  // a season covering the chosen check-in date (so we can explain the price)
  const activeSeason = room ? seasonFor(hotel, checkIn) : undefined;
  // only note it when the season actually changed this room's price
  const showSeasonNote = !!activeSeason && !!room && roomPrice !== room.price;
  const seasonLo = activeSeason
    ? activeSeason.from <= activeSeason.to
      ? activeSeason.from
      : activeSeason.to
    : "";
  const seasonHi = activeSeason
    ? activeSeason.from <= activeSeason.to
      ? activeSeason.to
      : activeSeason.from
    : "";

  async function submit() {
    if (comingSoon) {
      toast(t("book_soon_toast"));
      return;
    }
    if (!name.trim() || !phone.trim() || !checkIn || !roomType) {
      toast.error(t("book_required"));
      return;
    }
    // both gender counters can reach zero — somebody has to be staying
    if (guests < 1) {
      toast.error(t("book_need_guest"));
      return;
    }
    if (room && room.available === 0) {
      toast.error(t("book_room_full"));
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hotel: hotel.name,
          hotelId: hotel.id,
          name: name.trim(),
          phone: phone.trim(),
          roomType,
          roomPrice,
          checkIn,
          nights: Number(nights) || 1,
          guests,
          males,
          females,
          ...(childAges.length
            ? {
                children: childAges.length,
                // -1 means the guest left an age unset; send only real ages
                childAges: childAges.filter((a) => a >= 0),
              }
            : {}),
          ...(originCity ? { fromCity: originCity } : {}),
        }),
      });
      if (res.status === 429) {
        toast.error(t("book_ratelimited"));
        return;
      }
      if (res.status === 409) {
        toast.error(t("book_full"));
        return;
      }
      if (!res.ok) {
        toast.error(t("book_required"));
        return;
      }
      const data = (await res.json().catch(() => ({}))) as { id?: string };
      // keep a copy on the guest's device so they can see it in "My bookings";
      // docId lets that page follow the live status once the owner confirms
      addMyBooking({
        docId: data.id,
        hotelId: hotel.id,
        hotel: hotel.name,
        roomType,
        roomPrice,
        checkIn,
        nights: Number(nights) || 1,
        name: name.trim(),
        phone: phone.trim(),
      });
      // The guest gets no message of their own — only the hotel is notified —
      // so offer to send the booking to the hotel on WhatsApp. That gives them
      // a copy in their own chat history, and a thread to follow up in.
      const wa = hotel.phone
        ? buildBookingWhatsAppUrl(hotel.phone, {
            hotel: hotel.name,
            name: name.trim(),
            roomType: roomTypeLabel(roomType, lang),
            checkIn,
            nights: Number(nights) || 1,
            intro: t("book_wa_intro"),
            via: t("wa_via"),
          })
        : null;
      track("booking_submitted", {
        hotel_id: hotel.id,
        city: hotel.city,
        room_type: roomType,
        nights: Number(nights) || 1,
        value: roomPrice * (Number(nights) || 1),
      });
      toast.success(t("book_success"), {
        duration: wa ? 12_000 : 4_000,
        action: wa
          ? {
              label: t("book_wa_send"),
              onClick: () => window.open(wa, "_blank", "noopener,noreferrer"),
            }
          : undefined,
      });
      setOpen(false);
      setName("");
      setPhone("");
      setCheckIn("");
      setNights("1");
      setRoomType("");
      setMales(1);
      setFemales(0);
      setChildAges([]);
      setFromCity("");
      setFromCityOther("");
    } catch {
      toast.error(t("book_required"));
    } finally {
      setSubmitting(false);
    }
  }

  // While the site is in "coming soon" mode, the built-in trigger becomes a
  // disabled note instead of opening the booking form.
  if (trigger && comingSoon) {
    return (
      <Button className="shrink-0" disabled variant="secondary">
        {t("book_soon")}
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && (
        <DialogTrigger render={<Button className="shrink-0" />}>
          {t("book_now")}
        </DialogTrigger>
      )}
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("book_title")}</DialogTitle>
          <DialogDescription>{hotel.name}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="bk-name">{t("book_name")}</Label>
            <Input
              id="bk-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="bk-phone">{t("book_phone")}</Label>
            <Input
              id="bk-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          {/* who's staying — one panel, taps only, with a running total so the
              guest can see at a glance that the party adds up */}
          <div className="rounded-xl border bg-muted/30 p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <span className="flex items-center gap-1.5 text-sm font-semibold">
                <Users className="size-4 text-gold" />
                {t("book_party")}
              </span>
              <span className="rounded-full bg-gold/15 px-2.5 py-0.5 text-sm font-bold text-gold">
                {t("book_party_total", { n: guests + childAges.length })}
              </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 sm:gap-3">
              <Stepper
                label={t("book_males")}
                value={males}
                min={0}
                max={20}
                onChange={setMales}
              />
              <Stepper
                label={t("book_females")}
                value={females}
                min={0}
                max={20}
                onChange={setFemales}
              />
              <Stepper
                label={t("book_children")}
                value={childAges.length}
                min={0}
                max={10}
                onChange={(n) =>
                  // keep the ages already picked; new children start unset
                  setChildAges((prev) =>
                    n < prev.length
                      ? prev.slice(0, n)
                      : [...prev, ...Array(n - prev.length).fill(-1)],
                  )
                }
              />
            </div>

            {/* a child's age decides their price and bed, so ask per child */}
            {childAges.length > 0 && (
              <div className="mt-4 border-t pt-3">
                <Label className="text-xs text-muted-foreground">
                  {t("book_child_ages")}
                </Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {childAges.map((age, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-1.5 rounded-lg border bg-background px-2 py-1"
                    >
                      <span className="text-xs font-medium text-muted-foreground">
                        {t("book_child_n", { n: i + 1 })}
                      </span>
                      <Select
                        value={String(age)}
                        onValueChange={(v) =>
                          setChildAges((prev) =>
                            prev.map((a, j) => (j === i ? Number(v ?? -1) : a)),
                          )
                        }
                      >
                        <SelectTrigger className="h-8 w-24 border-0 bg-transparent px-1 shadow-none">
                          <SelectValue>
                            {(v: string | null) => {
                              const n = Number(v ?? -1);
                              if (n < 0) return t("book_child_age_ph");
                              return n === 0
                                ? t("book_child_under1")
                                : t("book_years", { n });
                            }}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent className="max-h-64">
                          <SelectItem value="-1">
                            {t("book_child_age_ph")}
                          </SelectItem>
                          {Array.from({ length: 18 }, (_, n) => (
                            <SelectItem key={n} value={String(n)}>
                              {n === 0
                                ? t("book_child_under1")
                                : t("book_years", { n })}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* where they're travelling from */}
          <div className="grid gap-2">
            <Label>{t("book_from_city")}</Label>
            <Select
              value={fromCity}
              onValueChange={(v) => setFromCity(v ?? "")}
            >
              <SelectTrigger>
                <SelectValue>
                  {(v: string | null) => {
                    if (!v) return t("book_from_city_ph");
                    if (v === ORIGIN_OTHER) return ORIGIN_OTHER_LABEL[lang];
                    return (
                      ORIGIN_CITIES.find((c) => c.value === v)?.label[lang] ?? v
                    );
                  }}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="w-[min(92vw,22rem)]">
                {ORIGIN_CITIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label[lang]}
                  </SelectItem>
                ))}
                <SelectItem value={ORIGIN_OTHER}>
                  {ORIGIN_OTHER_LABEL[lang]}
                </SelectItem>
              </SelectContent>
            </Select>
            {fromCity === ORIGIN_OTHER && (
              <Input
                value={fromCityOther}
                onChange={(e) => setFromCityOther(e.target.value)}
                placeholder={t("book_from_city_ph")}
              />
            )}
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-3">
            <div className="grid min-w-0 gap-2">
              <Label htmlFor="bk-date">{t("book_checkin")}</Label>
              <Input
                id="bk-date"
                type="date"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                className="w-full min-w-0 [&::-webkit-date-and-time-value]:text-start"
              />
            </div>
            <div className="grid min-w-0 gap-2">
              <Label htmlFor="bk-nights">{t("book_nights")}</Label>
              <Input
                id="bk-nights"
                type="number"
                min={1}
                value={nights}
                onChange={(e) => setNights(e.target.value)}
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label>{t("book_roomtype")}</Label>
            <Select
              value={roomType}
              onValueChange={(v) => setRoomType(v ?? "")}
            >
              <SelectTrigger>
                <SelectValue>
                  {(v: string | null) =>
                    v ? roomTypeLabel(v, lang) : t("book_select_room")
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="w-[min(92vw,22rem)]">
                {hotel.rooms.map((r) => (
                  <SelectItem
                    key={r.type}
                    value={r.type}
                    disabled={r.available === 0}
                  >
                    <span className="flex w-full items-center justify-between gap-4 pe-4">
                      <span className="flex items-center gap-2 font-medium">
                        {roomTypeLabel(r.type, lang)}
                        {typeof r.available === "number" && (
                          <span
                            className={cn(
                              "text-xs font-semibold",
                              r.available <= 0
                                ? "text-red-600"
                                : r.available <= 3
                                  ? "text-amber-600"
                                  : "text-emerald-600",
                            )}
                          >
                            {r.available <= 0
                              ? t("room_full")
                              : t("rooms_available", { n: r.available })}
                          </span>
                        )}
                      </span>
                      <span className="whitespace-nowrap text-muted-foreground">
                        {format(roomPriceOn(hotel, r.type, checkIn), hotel.iqdPerUsd)}
                      </span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {showSeasonNote && (
            <div className="flex items-start gap-2 rounded-lg border border-gold/40 bg-gold/10 px-3 py-2 text-xs leading-relaxed">
              <Sparkles className="mt-0.5 size-3.5 shrink-0 text-gold" />
              <span>
                {t("book_season_note", {
                  from: fmtDate(seasonLo),
                  to: fmtDate(seasonHi),
                })}
              </span>
            </div>
          )}

          {total > 0 && (
            <div className="flex items-center justify-between rounded-lg bg-muted px-4 py-3 text-sm font-medium">
              <span>{t("book_total")}</span>
              <span className="text-lg font-bold text-primary">{format(total, hotel.iqdPerUsd)}</span>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button onClick={submit} disabled={submitting} className="w-full">
            {t("book_confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** A −/+ counter. Tapping beats typing on a phone, which is where most
    guests book from. */
function Stepper({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (n: number) => void;
}) {
  return (
    <div className="grid min-w-0 gap-2">
      <Label>{label}</Label>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-10 shrink-0 rounded-full"
          aria-label="-"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
        >
          <Minus className="size-4" />
        </Button>
        <span
          aria-live="polite"
          className="min-w-10 flex-1 text-center text-lg font-bold tabular-nums"
        >
          {value}
        </span>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-10 shrink-0 rounded-full"
          aria-label="+"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
        >
          <Plus className="size-4" />
        </Button>
      </div>
    </div>
  );
}
