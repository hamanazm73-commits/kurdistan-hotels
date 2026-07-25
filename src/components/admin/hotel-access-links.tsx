"use client";

import { useState } from "react";
import { toast } from "sonner";
import { LinkIcon, Copy, RefreshCw, Loader2, Send } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useI18n } from "@/lib/i18n";
import { useHotels } from "@/lib/use-hotels";
import { getHotelAccessLink, createHotelAccessLink } from "@/lib/hotels-db";

/** Owner tool: generate a one-tap login link for a hotel and share it over
    WhatsApp — no email or password to create by hand. */
export function HotelAccessLinks() {
  const { t } = useI18n();
  const { hotels } = useHotels();
  const [hotelId, setHotelId] = useState("");
  const [link, setLink] = useState<string | null>(null);
  const [loading, setLoading] = useState(false); // fetching existing link
  const [busy, setBusy] = useState(false); // creating / regenerating

  const hotel = hotels.find((h) => h.id === hotelId);

  async function onPick(id: string) {
    setHotelId(id);
    setLink(null);
    if (!id) return;
    setLoading(true);
    try {
      setLink(await getHotelAccessLink(id));
    } catch {
      setLink(null);
    } finally {
      setLoading(false);
    }
  }

  async function generate(regenerate: boolean) {
    if (!hotelId) return;
    setBusy(true);
    try {
      const url = await createHotelAccessLink(hotelId, regenerate);
      setLink(url);
      toast.success(t("admin_saved"));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  async function copy() {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
      toast.success(t("admin_access_copied"));
    } catch {
      toast.error(String(t("admin_access_copy")));
    }
  }

  const waHref = link
    ? `https://wa.me/?text=${encodeURIComponent(
        `${t("admin_access_wa_msg", { hotel: hotel?.name ?? "" })}\n${link}`,
      )}`
    : "#";

  return (
    <Card className="grid gap-3 p-5">
      <div>
        <div className="mb-1 flex items-center gap-2 font-semibold">
          <LinkIcon className="size-4 text-gold" />
          {t("admin_access_links")}
        </div>
        <p className="text-sm text-muted-foreground">
          {t("admin_access_links_hint")}
        </p>
      </div>

      <div>
        <label className="mb-1.5 block text-xs text-muted-foreground">
          {t("admin_access_pick_hotel")}
        </label>
        <Select value={hotelId} onValueChange={(v) => onPick(v ?? "")}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder={t("admin_access_pick_hotel")} />
          </SelectTrigger>
          <SelectContent>
            {hotels.map((h) => (
              <SelectItem key={h.id} value={h.id}>
                {h.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {hotelId && loading && (
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      )}

      {hotelId && !loading && !link && (
        <Button onClick={() => generate(false)} disabled={busy} className="sm:w-fit">
          {busy ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <LinkIcon className="size-4" />
          )}
          {t("admin_access_generate")}
        </Button>
      )}

      {hotelId && !loading && link && (
        <div className="grid gap-2">
          <Input value={link} readOnly dir="ltr" onFocus={(e) => e.currentTarget.select()} />
          <div className="flex flex-wrap gap-2">
            <Button onClick={copy} variant="secondary" className="gap-1.5">
              <Copy className="size-4" />
              {t("admin_access_copy")}
            </Button>
            <Button
              nativeButton={false}
              className="gap-1.5 bg-[#25D366] text-white hover:bg-[#1ebe5d]"
              render={
                <a href={waHref} target="_blank" rel="noopener noreferrer" />
              }
            >
              <Send className="size-4" />
              {t("admin_access_send_wa")}
            </Button>
            <Button
              onClick={() => generate(true)}
              variant="ghost"
              disabled={busy}
              className="gap-1.5"
            >
              {busy ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <RefreshCw className="size-4" />
              )}
              {t("admin_access_regenerate")}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            {t("admin_access_regenerate_hint")}
          </p>
        </div>
      )}
    </Card>
  );
}
