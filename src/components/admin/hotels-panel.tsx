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
  X,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { ImageUpload, GalleryUpload } from "./image-upload";
import { useI18n, LANGS } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { useHotels } from "@/lib/use-hotels";
import {
  addHotel,
  updateHotel,
  deleteHotel,
  seedHotels,
} from "@/lib/hotels-db";
import { effectivePrice, type Hotel, type HotelInput } from "@/lib/types";
import { CITIES } from "@/lib/sample-data";

function defaultRooms() {
  return [
    { type: "Single", price: 75 },
    { type: "Double", price: 105 },
    { type: "Suite", price: 170 },
  ];
}

/** Build a {ckb,en,ar} map, skipping empty values (Firestore-safe). */
function i18nObj(ckb: string, en: string, ar: string) {
  const o: { ckb?: string; en?: string; ar?: string } = {};
  if (ckb.trim()) o.ckb = ckb.trim();
  if (en.trim()) o.en = en.trim();
  if (ar.trim()) o.ar = ar.trim();
  return o;
}

const NAME_FIELDS = [
  { lang: "ckb", key: "nameCkb" },
  { lang: "en", key: "nameEn" },
  { lang: "ar", key: "nameAr" },
] as const;

const DESC_FIELDS = [
  { lang: "ckb", key: "descCkb" },
  { lang: "en", key: "descEn" },
  { lang: "ar", key: "descAr" },
] as const;

const empty = {
  name: "",
  city: CITIES[0] as string,
  price: 90,
  rating: 4.5,
  image:
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80",
  images: [] as string[],
  available: 10,
  features: "Wi-Fi, Restaurant, Parking",
  description: "",
  address: "",
  phone: "",
  rooms: defaultRooms(),
  featured: false,
  recommended: false,
  discountActive: false,
  oldPrice: 0,
  newPrice: 0,
  nameCkb: "",
  nameEn: "",
  nameAr: "",
  descCkb: "",
  descEn: "",
  descAr: "",
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
            <Card key={h.id} className="flex flex-row items-center gap-4 p-3">
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
          images: hotel.images ?? [],
          available: hotel.available,
          features: hotel.features.join(", "),
          description: hotel.description ?? "",
          address: hotel.address ?? "",
          phone: hotel.phone ?? "",
          rooms: hotel.rooms?.length ? hotel.rooms : defaultRooms(),
          featured: hotel.featured,
          recommended: hotel.recommended,
          discountActive: hotel.discount?.active ?? false,
          oldPrice: hotel.discount?.oldPrice ?? 0,
          newPrice: hotel.discount?.newPrice ?? 0,
          nameCkb: hotel.nameI18n?.ckb ?? "",
          nameEn: hotel.nameI18n?.en ?? "",
          nameAr: hotel.nameI18n?.ar ?? "",
          descCkb: hotel.descriptionI18n?.ckb ?? "",
          descEn: hotel.descriptionI18n?.en ?? "",
          descAr: hotel.descriptionI18n?.ar ?? "",
        }
      : empty,
  );
  const [showI18n, setShowI18n] = useState(false);

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
      nameI18n: i18nObj(form.nameCkb, form.nameEn, form.nameAr),
      city: form.city,
      price: Number(form.price),
      rating: Number(form.rating),
      image: form.image.trim(),
      images: form.images.filter(Boolean),
      available: Number(form.available),
      features: form.features
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      description: form.description.trim(),
      descriptionI18n: i18nObj(form.descCkb, form.descEn, form.descAr),
      address: form.address.trim(),
      phone: form.phone.trim(),
      rooms: form.rooms
        .map((r) => ({ type: r.type.trim(), price: Number(r.price) }))
        .filter((r) => r.type),
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

          {/* optional per-language name & description */}
          <div className="rounded-lg border p-3">
            <button
              type="button"
              onClick={() => setShowI18n((v) => !v)}
              className="flex w-full items-center justify-between text-sm font-medium"
            >
              {t("admin_translations")}
              <ChevronDown
                className={cn("size-4 transition", showI18n && "rotate-180")}
              />
            </button>
            {showI18n && (
              <div className="mt-3 space-y-3">
                {NAME_FIELDS.map(({ lang, key }) => (
                  <Field
                    key={key}
                    label={`${t("admin_name_in")} ${LANGS[lang].label}`}
                  >
                    <Input
                      value={form[key]}
                      onChange={(e) => set(key, e.target.value)}
                    />
                  </Field>
                ))}
                {DESC_FIELDS.map(({ lang, key }) => (
                  <Field
                    key={key}
                    label={`${t("admin_desc_in")} ${LANGS[lang].label}`}
                  >
                    <Textarea
                      rows={2}
                      value={form[key]}
                      onChange={(e) => set(key, e.target.value)}
                    />
                  </Field>
                ))}
              </div>
            )}
          </div>

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

          <Field label={t("admin_cover_image")}>
            <ImageUpload value={form.image} onChange={(url) => set("image", url)} />
          </Field>

          <Field label={t("admin_gallery")}>
            <GalleryUpload
              value={form.images}
              onChange={(urls) => set("images", urls)}
            />
          </Field>

          <Field label={t("admin_description")}>
            <Textarea
              rows={3}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label={t("admin_address")}>
              <Input
                value={form.address}
                onChange={(e) => set("address", e.target.value)}
              />
            </Field>
            <Field label={t("admin_phone")}>
              <Input
                dir="ltr"
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
              />
            </Field>
          </div>

          <Field label={t("admin_features")}>
            <Input
              value={form.features}
              onChange={(e) => set("features", e.target.value)}
            />
          </Field>

          {/* rooms editor */}
          <Field label={t("admin_rooms")}>
            <div className="space-y-2">
              {form.rooms.map((r, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Input
                    placeholder={t("admin_room_type")}
                    value={r.type}
                    onChange={(e) =>
                      set(
                        "rooms",
                        form.rooms.map((x, j) =>
                          j === i ? { ...x, type: e.target.value } : x,
                        ),
                      )
                    }
                  />
                  <Input
                    type="number"
                    className="w-28"
                    placeholder={t("admin_room_price")}
                    value={r.price}
                    onChange={(e) =>
                      set(
                        "rooms",
                        form.rooms.map((x, j) =>
                          j === i ? { ...x, price: Number(e.target.value) } : x,
                        ),
                      )
                    }
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      set(
                        "rooms",
                        form.rooms.filter((_, j) => j !== i),
                      )
                    }
                  >
                    <X className="size-4 text-destructive" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={() =>
                  set("rooms", [...form.rooms, { type: "", price: 0 }])
                }
              >
                <Plus className="size-4" />
                {t("admin_add_room")}
              </Button>
            </div>
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
