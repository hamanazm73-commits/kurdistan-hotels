"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
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
import { roomTypeLabel, type Hotel } from "@/lib/types";
import { addMyBooking } from "@/lib/my-bookings";
import { cn } from "@/lib/utils";

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

  // preselect the tapped room each time the dialog opens
  useEffect(() => {
    if (open && initialRoomType) setRoomType(initialRoomType);
  }, [open, initialRoomType]);

  const room = hotel.rooms.find((r) => r.type === roomType);
  const total = useMemo(
    () => (room ? room.price * Math.max(1, Number(nights) || 1) : 0),
    [room, nights],
  );

  async function submit() {
    if (!name.trim() || !phone.trim() || !checkIn || !roomType) {
      toast.error(t("book_required"));
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
          roomPrice: room?.price ?? 0,
          checkIn,
          nights: Number(nights) || 1,
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
        roomPrice: room?.price ?? 0,
        checkIn,
        nights: Number(nights) || 1,
        name: name.trim(),
        phone: phone.trim(),
      });
      toast.success(t("book_success"));
      setOpen(false);
      setName("");
      setPhone("");
      setCheckIn("");
      setNights("1");
      setRoomType("");
    } catch {
      toast.error(t("book_required"));
    } finally {
      setSubmitting(false);
    }
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
                        {format(r.price, hotel.iqdPerUsd)}
                      </span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

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
