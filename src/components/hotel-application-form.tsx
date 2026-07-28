"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Send, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useI18n } from "@/lib/i18n";
import { CITIES } from "@/lib/sample-data";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/**
 * Where a hotel owner asks to be listed.
 *
 * The page offered a phone number and an email, so every listing began with the
 * same back-and-forth collecting name, city and room count. Asking once here
 * means the first reply can already be about the listing itself.
 */
export function HotelApplicationForm() {
  const { t, tCity } = useI18n();
  const [hotelName, setHotelName] = useState("");
  const [city, setCity] = useState<string>(CITIES[0] as string);
  const [contactName, setContactName] = useState("");
  const [phone, setPhone] = useState("");
  const [rooms, setRooms] = useState("");
  const [note, setNote] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  async function submit() {
    if (!hotelName.trim() || !contactName.trim() || !phone.trim()) {
      toast.error(t("apply_required"));
      return;
    }
    setSending(true);
    try {
      const res = await fetch("/api/hotel-application", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hotelName: hotelName.trim(),
          city,
          contactName: contactName.trim(),
          phone: phone.trim(),
          ...(Number(rooms) > 0 ? { rooms: Number(rooms) } : {}),
          ...(note.trim() ? { note: note.trim() } : {}),
        }),
      });
      if (res.status === 429) {
        toast.error(t("apply_ratelimited"));
        return;
      }
      if (!res.ok) {
        toast.error(t("apply_failed"));
        return;
      }
      setSent(true);
    } catch {
      toast.error(t("apply_failed"));
    } finally {
      setSending(false);
    }
  }

  if (sent) {
    return (
      <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/5 p-6 text-center">
        <div className="mx-auto mb-3 grid size-12 place-items-center rounded-full bg-emerald-500/15">
          <Check className="size-6 text-emerald-600" />
        </div>
        <p className="font-bold">{t("apply_sent")}</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("apply_sent_sub")}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border bg-card p-5 shadow-sm sm:p-6">
      <h3 className="text-lg font-bold">{t("apply_title")}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{t("apply_sub")}</p>

      <div className="mt-5 grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="ap-hotel">{t("apply_hotel")}</Label>
          <Input
            id="ap-hotel"
            value={hotelName}
            onChange={(e) => setHotelName(e.target.value)}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label>{t("apply_city")}</Label>
            <Select value={city} onValueChange={(v) => v && setCity(v)}>
              <SelectTrigger>
                <SelectValue>{(v: string | null) => tCity(v ?? city)}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {CITIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {tCity(c)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="ap-rooms">{t("apply_rooms")}</Label>
            <Input
              id="ap-rooms"
              type="number"
              min={0}
              inputMode="numeric"
              value={rooms}
              onChange={(e) => setRooms(e.target.value)}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="ap-name">{t("apply_name")}</Label>
            <Input
              id="ap-name"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="ap-phone">{t("apply_phone")}</Label>
            <Input
              id="ap-phone"
              type="tel"
              dir="ltr"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="ap-note">{t("apply_note")}</Label>
          <Textarea
            id="ap-note"
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>

        <Button onClick={submit} disabled={sending} className="gap-2">
          <Send className="size-4" />
          {sending ? t("apply_sending") : t("apply_send")}
        </Button>
        <p className="text-center text-xs text-muted-foreground">
          {t("apply_free_note")}
        </p>
      </div>
    </div>
  );
}
