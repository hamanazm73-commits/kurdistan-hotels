"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Plus,
  Pencil,
  Trash2,
  Sparkles,
  Star,
  BadgePercent,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useI18n } from "@/lib/i18n";
import { useHotels } from "@/lib/use-hotels";
import {
  addHotel,
  updateHotel,
  deleteHotel,
  seedHotels,
} from "@/lib/hotels-db";
import { effectivePrice, type Hotel, type HotelInput } from "@/lib/types";
import { CITIES } from "@/lib/sample-data";

function genRooms(price: number) {
  return [
    { type: "Single", price },
    { type: "Double", price: Math.round(price * 1.3) },
    { type: "Suite", price: Math.round(price * 2) },
  ];
}

const empty = {
  name: "",
  city: CITIES[0] as string,
  price: 90,
  rating: 4.5,
  image:
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80",
  available: 10,
  features: "Wi-Fi, Restaurant, Parking",
  featured: false,
  recommended: false,
  discountActive: false,
  oldPrice: 0,
  newPrice: 0,
};

export function HotelsPanel() {
  const { t, tCity } = useI18n();
  const { hotels, usingSamples } = useHotels();
  const [seeding, setSeeding] = useState(false);

  async function onSeed() {
    setSeeding(true);
    try {
      await seedHotels();
      toast.success(t("admin_saved"));
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSeeding(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">{t("admin_hotels")}</h2>
        <div className="flex gap-2">
          {usingSamples && (
            <Button variant="outline" onClick={onSeed} disabled={seeding}>
              {seeding ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Sparkles className="size-4" />
              )}
              {t("admin_seed")}
            </Button>
          )}
          <HotelFormDialog
            trigger={
              <Button>
                <Plus className="size-4" />
                {t("admin_add_hotel")}
              </Button>
            }
          />
        </div>
      </div>

      {usingSamples && (
        <p className="rounded-lg border border-dashed bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
          {t("admin_seed")} → {t("footer_about")}
        </p>
      )}

      <div className="grid gap-3">
        {hotels.map((h) => {
          const isSample = h.id.startsWith("sample-");
          return (
            <Card
              key={h.id}
              className="flex flex-row items-center gap-4 p-3"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={h.image}
                alt={h.name}
                className="size-16 shrink-0 rounded-lg object-cover"
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold">{h.name}</span>
                  {h.featured && (
                    <Badge className="bg-gold text-gold-foreground hover:bg-gold">
                      <Star className="size-3" /> {t("badge_featured")}
                    </Badge>
                  )}
                  {h.recommended && (
                    <Badge variant="secondary">{t("badge_recommended")}</Badge>
                  )}
                  {h.discount?.active && (
                    <Badge variant="destructive">
                      <BadgePercent className="size-3" /> {t("badge_discount")}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {tCity(h.city)} · ${effectivePrice(h)} {t("per_night")}
                </p>
              </div>
              <div className="flex shrink-0 gap-1">
                <HotelFormDialog
                  hotel={h}
                  trigger={
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={isSample}
                      title={t("admin_edit")}
                    >
                      <Pencil className="size-4" />
                    </Button>
                  }
                />
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={isSample}
                  title={t("admin_delete")}
                  onClick={async () => {
                    if (!confirm(t("admin_confirm_delete"))) return;
                    try {
                      await deleteHotel(h.id);
                      toast.success(t("admin_deleted"));
                    } catch (e) {
                      toast.error((e as Error).message);
                    }
                  }}
                >
                  <Trash2 className="size-4 text-destructive" />
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function HotelFormDialog({
  hotel,
  trigger,
}: {
  hotel?: Hotel;
  trigger: React.ReactElement;
}) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(
    hotel
      ? {
          name: hotel.name,
          city: hotel.city,
          price: hotel.price,
          rating: hotel.rating,
          image: hotel.image,
          available: hotel.available,
          features: hotel.features.join(", "),
          featured: hotel.featured,
          recommended: hotel.recommended,
          discountActive: hotel.discount?.active ?? false,
          oldPrice: hotel.discount?.oldPrice ?? 0,
          newPrice: hotel.discount?.newPrice ?? 0,
        }
      : empty,
  );

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function save() {
    if (!form.name.trim()) {
      toast.error(t("book_required"));
      return;
    }
    const data: HotelInput = {
      name: form.name.trim(),
      city: form.city,
      price: Number(form.price),
      rating: Number(form.rating),
      image: form.image.trim(),
      available: Number(form.available),
      features: form.features
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      rooms: genRooms(Number(form.price)),
      featured: form.featured,
      recommended: form.recommended,
      discount: {
        active: form.discountActive,
        oldPrice: Number(form.oldPrice),
        newPrice: Number(form.newPrice),
      },
    };
    setSaving(true);
    try {
      if (hotel) await updateHotel(hotel.id, data);
      else await addHotel(data);
      toast.success(t("admin_saved"));
      setOpen(false);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {hotel ? t("admin_edit_hotel") : t("admin_add_hotel")}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4">
          <Field label={t("admin_name")}>
            <Input
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label={t("admin_city")}>
              <Select
                value={form.city}
                onValueChange={(v) => set("city", v ?? "")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CITIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label={t("admin_rating")}>
              <Input
                type="number"
                step="0.1"
                min={0}
                max={5}
                value={form.rating}
                onChange={(e) => set("rating", Number(e.target.value))}
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label={t("admin_price")}>
              <Input
                type="number"
                value={form.price}
                onChange={(e) => set("price", Number(e.target.value))}
              />
            </Field>
            <Field label={t("admin_available")}>
              <Input
                type="number"
                value={form.available}
                onChange={(e) => set("available", Number(e.target.value))}
              />
            </Field>
          </div>

          <Field label={t("admin_image")}>
            <Input
              value={form.image}
              onChange={(e) => set("image", e.target.value)}
            />
          </Field>

          <Field label={t("admin_features")}>
            <Input
              value={form.features}
              onChange={(e) => set("features", e.target.value)}
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <ToggleRow
              label={t("admin_featured")}
              checked={form.featured}
              onChange={(v) => set("featured", v)}
            />
            <ToggleRow
              label={t("admin_recommended")}
              checked={form.recommended}
              onChange={(v) => set("recommended", v)}
            />
          </div>

          <div className="rounded-lg border p-3">
            <ToggleRow
              label={t("admin_discount_on")}
              checked={form.discountActive}
              onChange={(v) => set("discountActive", v)}
            />
            {form.discountActive && (
              <div className="mt-3 grid grid-cols-2 gap-3">
                <Field label={t("admin_old_price")}>
                  <Input
                    type="number"
                    value={form.oldPrice}
                    onChange={(e) => set("oldPrice", Number(e.target.value))}
                  />
                </Field>
                <Field label={t("admin_new_price")}>
                  <Input
                    type="number"
                    value={form.newPrice}
                    onChange={(e) => set("newPrice", Number(e.target.value))}
                  />
                </Field>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            {t("admin_cancel")}
          </Button>
          <Button onClick={save} disabled={saving}>
            {saving && <Loader2 className="size-4 animate-spin" />}
            {t("admin_save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm">
      {label}
      <Switch checked={checked} onCheckedChange={onChange} />
    </label>
  );
}
