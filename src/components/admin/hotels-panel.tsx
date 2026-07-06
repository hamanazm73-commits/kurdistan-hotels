"use client";

import { useState, useEffect, useRef } from "react";
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
  Eye,
  EyeOff,
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
import { ImageUpload, GalleryUpload, VideoUpload } from "./image-upload";
import { useI18n, LANGS } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { useHotels } from "@/lib/use-hotels";
import {
  addHotel,
  updateHotel,
  deleteHotel,
  seedHotels,
  getHotelMedia,
} from "@/lib/hotels-db";
import { effectivePrice, formatPrice, mediaSrc, PAYMENT_TYPES, type Hotel, type HotelInput, type RoomType } from "@/lib/types";
import { CITIES } from "@/lib/sample-data";

type FormRoom = { type: string; price: number; available?: number };

/** Turn a raw Firestore error into a clear message. A too-big document (usually
    an uploaded video + images exceeding the ~1 MB limit) gets its own guidance. */
function saveErrorMessage(e: unknown, t: (k: string) => string): string {
  const msg = e instanceof Error ? e.message : String(e);
  if (/exceeds|maximum|1048|longer than|too large|invalid-argument/i.test(msg))
    return t("admin_too_large_save");
  return msg;
}

function defaultRooms(): FormRoom[] {
  return [
    { type: "Single", price: 75_000, available: 5 },
    { type: "Double", price: 105_000, available: 5 },
    { type: "Suite", price: 170_000, available: 3 },
  ];
}

/** Build a {ckb,kmr,en,ar} map, skipping empty values (Firestore-safe). */
function i18nObj(ckb: string, kmr: string, en: string, ar: string) {
  const o: { ckb?: string; kmr?: string; en?: string; ar?: string } = {};
  if (ckb.trim()) o.ckb = ckb.trim();
  if (kmr.trim()) o.kmr = kmr.trim();
  if (en.trim()) o.en = en.trim();
  if (ar.trim()) o.ar = ar.trim();
  return o;
}

const NAME_FIELDS = [
  { lang: "ckb", key: "nameCkb" },
  { lang: "kmr", key: "nameKmr" },
  { lang: "en", key: "nameEn" },
  { lang: "ar", key: "nameAr" },
] as const;

const DESC_FIELDS = [
  { lang: "ckb", key: "descCkb" },
  { lang: "kmr", key: "descKmr" },
  { lang: "en", key: "descEn" },
  { lang: "ar", key: "descAr" },
] as const;

const empty = {
  name: "",
  city: CITIES[0] as string,
  price: 90_000,
  rating: 4.5,
  image:
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80",
  images: [] as string[],
  available: 10,
  features: "Wi-Fi, Restaurant, Parking",
  description: "",
  address: "",
  phone: "",
  video: "",
  mapUrl: "",
  payments: [] as { type: string; url: string }[],
  rooms: defaultRooms(),
  featured: false,
  recommended: false,
  discountActive: false,
  oldPrice: 0,
  newPrice: 0,
  nameCkb: "",
  nameKmr: "",
  nameEn: "",
  nameAr: "",
  descCkb: "",
  descKmr: "",
  descEn: "",
  descAr: "",
};

export function HotelsPanel({ ownerHotelId }: { ownerHotelId?: string } = {}) {
  const { t, tCity, lang } = useI18n();
  const { hotels, usingSamples } = useHotels();
  const [seeding, setSeeding] = useState(false);
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [priceInput, setPriceInput] = useState(0);
  const [cityFilter, setCityFilter] = useState<string>("all");

  const owner = Boolean(ownerHotelId);

  const visibleHotels = hotels.filter((h) =>
    owner ? h.id === ownerHotelId : cityFilter === "all" || h.city === cityFilter,
  );
  // only offer cities that actually have hotels
  const cityOptions = CITIES.filter((c) => hotels.some((h) => h.city === c));

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

  function startPriceEdit(h: Hotel) {
    setEditingPriceId(h.id);
    setPriceInput(effectivePrice(h));
  }

  async function commitPriceEdit(h: Hotel) {
    const n = priceInput;
    setEditingPriceId(null);
    if (!n || n === effectivePrice(h)) return;
    try {
      // if the hotel is discounted, the shown price is the discount price
      const data = h.discount?.active
        ? { discount: { ...h.discount, newPrice: n } }
        : { price: n };
      await updateHotel(h.id, data);
      toast.success(t("admin_saved"));
    } catch (e) {
      console.error("[price edit]", e);
      toast.error(saveErrorMessage(e, t));
    }
  }

  async function toggleHidden(h: Hotel) {
    try {
      await updateHotel(h.id, { hidden: !h.hidden });
      toast.success(h.hidden ? t("admin_shown") : t("admin_hidden_done"));
    } catch (e) {
      console.error("[toggle hidden]", e);
      toast.error(saveErrorMessage(e, t));
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">
          {owner ? t("admin_my_hotel") : t("admin_hotels")}
        </h2>
        {!owner && (
          <div className="flex flex-wrap items-center gap-2">
            {/* city filter */}
            {cityOptions.length > 1 && (
              <Select value={cityFilter} onValueChange={(v) => setCityFilter(v ?? "all")}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("filter_all")}</SelectItem>
                  {cityOptions.map((c) => (
                    <SelectItem key={c} value={c}>
                      {tCity(c)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
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
        )}
      </div>

      {!owner && usingSamples && (
        <p className="rounded-lg border border-dashed bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
          {t("admin_seed")} → {t("footer_about")}
        </p>
      )}

      {visibleHotels.length === 0 && (
        <p className="rounded-lg border border-dashed bg-muted/40 px-4 py-8 text-center text-sm text-muted-foreground">
          {t("no_results")}
        </p>
      )}

      {owner && visibleHotels.some((h) => h.hidden) && (
        <div className="flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-200">
          <EyeOff className="mt-0.5 size-4 shrink-0" />
          <span>{t("owner_hidden_notice")}</span>
        </div>
      )}

      <div className="grid gap-3">
        {visibleHotels.map((h) => {
          const isSample = h.id.startsWith("sample-");
          const isEditingPrice = editingPriceId === h.id;
          return (
            <Card
              key={h.id}
              className={cn(
                "flex flex-row items-center gap-4 p-3",
                h.hidden && "opacity-60",
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={mediaSrc(h.image)}
                alt={h.name}
                className="size-16 shrink-0 rounded-lg bg-muted object-contain"
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold">{h.name}</span>
                  {h.hidden && (
                    <Badge variant="outline" className="gap-1">
                      <EyeOff className="size-3" /> {t("badge_hidden")}
                    </Badge>
                  )}
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
                <div className="mt-0.5 flex items-center gap-1 text-sm text-muted-foreground">
                  <span>{tCity(h.city)} ·</span>
                  {isEditingPrice ? (
                    <span className="flex items-center gap-1">
                      <MoneyInput
                        value={priceInput}
                        onChange={setPriceInput}
                        onBlur={() => commitPriceEdit(h)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") { e.preventDefault(); commitPriceEdit(h); }
                          if (e.key === "Escape") setEditingPriceId(null);
                        }}
                        autoFocus
                        className="h-6 w-28 px-1.5 text-xs"
                      />
                      <span className="text-xs">
                        {lang === "en" || lang === "kmr" ? "IQD" : "دینار"}
                      </span>
                    </span>
                  ) : (
                    <button
                      disabled={isSample}
                      onClick={() => startPriceEdit(h)}
                      className="rounded px-1 hover:bg-muted hover:text-foreground disabled:pointer-events-none"
                      title={t("admin_edit")}
                    >
                      {formatPrice(effectivePrice(h), lang)}
                    </button>
                  )}
                  <span>{t("per_night")}</span>
                </div>
              </div>
              <div className="flex shrink-0 gap-1">
                {owner && h.hidden ? (
                  // hotel owner can't edit a hotel the admin has hidden
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled
                    title={t("owner_hidden_notice")}
                  >
                    <Pencil className="size-4" />
                  </Button>
                ) : (
                  <HotelFormDialog
                    hotel={h}
                    restricted={owner}
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
                )}
                {/* only admins/owner control visibility */}
                {!owner && (
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={isSample}
                    title={h.hidden ? t("admin_show") : t("admin_hide")}
                    onClick={() => toggleHidden(h)}
                  >
                    {h.hidden ? (
                      <Eye className="size-4" />
                    ) : (
                      <EyeOff className="size-4" />
                    )}
                  </Button>
                )}
                {!owner && (
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
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export function HotelFormDialog({
  hotel,
  trigger,
  restricted,
}: {
  hotel?: Hotel;
  trigger: React.ReactElement;
  /** hotel owners can't touch featured / recommended / discount */
  restricted?: boolean;
}) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Always holds the latest hotel prop without triggering re-renders.
  const hotelRef = useRef(hotel);
  hotelRef.current = hotel;

  function buildForm() {
    const h = hotelRef.current;
    if (!h) return { ...empty };
    return {
      name: h.name,
      city: h.city,
      price: h.price,
      rating: h.rating,
      image: h.image,
      images: h.images ?? [],
      available: h.available,
      features: h.features.join(", "),
      description: h.description ?? "",
      address: h.address ?? "",
      phone: h.phone ?? "",
      video: h.video ?? "",
      mapUrl: h.mapUrl ?? "",
      payments: (h.payments ?? []).map((p) => ({ type: p.type, url: p.url })),
      rooms: h.rooms?.length
        ? h.rooms.map((r) => ({
            type: r.type,
            price: r.price,
            available: r.available,
          }))
        : defaultRooms(),
      featured: h.featured,
      recommended: h.recommended,
      discountActive: h.discount?.active ?? false,
      oldPrice: h.discount?.oldPrice ?? 0,
      newPrice: h.discount?.newPrice ?? 0,
      nameCkb: h.nameI18n?.ckb ?? "",
      nameKmr: h.nameI18n?.kmr ?? "",
      nameEn: h.nameI18n?.en ?? "",
      nameAr: h.nameI18n?.ar ?? "",
      descCkb: h.descriptionI18n?.ckb ?? "",
      descKmr: h.descriptionI18n?.kmr ?? "",
      descEn: h.descriptionI18n?.en ?? "",
      descAr: h.descriptionI18n?.ar ?? "",
    };
  }

  const [form, setForm] = useState(buildForm);
  const [showI18n, setShowI18n] = useState(false);
  const formRef = useRef(form);
  formRef.current = form;
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [autoSaveStatus, setAutoSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  // Gallery/video load async from the media doc; block auto-save until they're
  // in so a quick edit can't overwrite them with empty values.
  const mediaReadyRef = useRef(false);

  function buildData(f: typeof form): HotelInput {
    const rooms: RoomType[] = f.rooms
      .map((r) => {
        const room: RoomType = { type: r.type.trim(), price: Number(r.price) };
        if (r.available !== undefined && !Number.isNaN(Number(r.available)))
          room.available = Math.max(0, Number(r.available));
        return room;
      })
      .filter((r) => r.type);
    const tracked = rooms.filter((r) => typeof r.available === "number");
    const available = tracked.length
      ? tracked.reduce((s, r) => s + (r.available ?? 0), 0)
      : Number(f.available);
    return {
      name: f.name.trim(),
      nameI18n: i18nObj(f.nameCkb, f.nameKmr, f.nameEn, f.nameAr),
      city: f.city,
      price: Number(f.price),
      rating: Number(f.rating),
      image: f.image.trim(),
      images: f.images.filter(Boolean),
      available,
      features: f.features.split(",").map((s) => s.trim()).filter(Boolean),
      description: f.description.trim(),
      descriptionI18n: i18nObj(f.descCkb, f.descKmr, f.descEn, f.descAr),
      address: f.address.trim(),
      phone: f.phone.trim(),
      video: f.video.trim(),
      mapUrl: f.mapUrl.trim(),
      payments: f.payments
        .map((p) => ({ type: p.type, url: p.url.trim() }))
        .filter((p) => p.url),
      rooms,
      featured: f.featured,
      recommended: f.recommended,
      discount: {
        active: f.discountActive,
        oldPrice: Number(f.oldPrice),
        newPrice: Number(f.newPrice),
      },
    };
  }

  async function doAutoSave() {
    const h = hotelRef.current;
    if (!h) return;
    // media not loaded yet — wait, so we don't clobber the gallery/video
    if (!mediaReadyRef.current) {
      scheduleAutoSave();
      return;
    }
    const f = formRef.current;
    // don't auto-save while a required number is empty (mid-edit)
    if (!f.name.trim() || Number(f.price) <= 0) return;
    setAutoSaveStatus("saving");
    try {
      await updateHotel(h.id, buildData(f));
      setAutoSaveStatus("saved");
    } catch (e) {
      console.error("[auto-save]", e);
      toast.error(saveErrorMessage(e, t), { duration: 8000 });
      setAutoSaveStatus("idle");
    }
  }

  function scheduleAutoSave() {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    setAutoSaveStatus("idle");
    debounceTimerRef.current = setTimeout(doAutoSave, 1000);
  }

  // Reset form when dialog opens; flush pending save when it closes.
  useEffect(() => {
    if (open) {
      setForm(buildForm());
      setShowI18n(false);
      setAutoSaveStatus("idle");
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
      // Load gallery/video from the media doc (falls back to inline for
      // un-migrated hotels). New hotels have nothing to load.
      const h = hotelRef.current;
      mediaReadyRef.current = !h;
      if (h) {
        getHotelMedia(h.id).then((m) => {
          if (m) {
            setForm((f) => ({
              ...f,
              images: m.images ?? f.images,
              video: m.video ?? f.video,
            }));
          }
          mediaReadyRef.current = true;
        });
      }
    } else if (hotelRef.current && debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
      void doAutoSave();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }));
    if (hotelRef.current) scheduleAutoSave();
  }

  async function save() {
    if (!form.name.trim() || Number(form.price) <= 0) {
      toast.error(t("book_required"));
      return;
    }
    setSaving(true);
    try {
      await addHotel(buildData(form));
      toast.success(t("admin_saved"));
      setOpen(false);
    } catch (e) {
      console.error("[save hotel]", e);
      toast.error(saveErrorMessage(e, t), { duration: 8000 });
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
                value={form.rating || ""}
                onChange={(e) => set("rating", Number(e.target.value))}
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label={t("admin_price")}>
              <MoneyInput value={form.price} onChange={(n) => set("price", n)} />
            </Field>
            <Field label={t("admin_available")}>
              <Input
                type="number"
                value={form.available || ""}
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

          <Field label={t("admin_location")}>
            <Input
              dir="ltr"
              placeholder={t("admin_location_ph")}
              value={form.mapUrl}
              onChange={(e) => set("mapUrl", e.target.value)}
            />
          </Field>

          <Field label={t("admin_video")}>
            <VideoUpload value={form.video} onChange={(url) => set("video", url)} />
          </Field>

          {/* online payment methods — each is a link the guest pays the hotel through */}
          <Field label={t("admin_payments")}>
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">
                {t("admin_payments_hint")}
              </p>
              {form.payments.map((p, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Select
                    value={p.type}
                    onValueChange={(v) =>
                      set(
                        "payments",
                        form.payments.map((x, j) =>
                          j === i ? { ...x, type: v ?? "link" } : x,
                        ),
                      )
                    }
                  >
                    <SelectTrigger className="w-32 shrink-0">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PAYMENT_TYPES.map((pt) => (
                        <SelectItem key={pt.id} value={pt.id}>
                          {pt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    dir="ltr"
                    className="min-w-0 flex-1"
                    placeholder={t("admin_payment_url")}
                    value={p.url}
                    onChange={(e) =>
                      set(
                        "payments",
                        form.payments.map((x, j) =>
                          j === i ? { ...x, url: e.target.value } : x,
                        ),
                      )
                    }
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="shrink-0"
                    onClick={() =>
                      set("payments", form.payments.filter((_, j) => j !== i))
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
                  set("payments", [
                    ...form.payments,
                    { type: PAYMENT_TYPES[0].id, url: "" },
                  ])
                }
              >
                <Plus className="size-4" />
                {t("admin_add_payment")}
              </Button>
            </div>
          </Field>

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
                    className="min-w-0 flex-1"
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
                  <MoneyInput
                    className="w-24"
                    placeholder={t("admin_room_price")}
                    value={r.price}
                    onChange={(n) =>
                      set(
                        "rooms",
                        form.rooms.map((x, j) =>
                          j === i ? { ...x, price: n } : x,
                        ),
                      )
                    }
                  />
                  <Input
                    type="number"
                    min={0}
                    inputMode="numeric"
                    title={t("admin_room_available")}
                    placeholder={t("admin_room_available")}
                    className="w-16 shrink-0"
                    value={r.available ?? ""}
                    onChange={(e) =>
                      set(
                        "rooms",
                        form.rooms.map((x, j) =>
                          j === i
                            ? {
                                ...x,
                                available:
                                  e.target.value === ""
                                    ? undefined
                                    : Math.max(0, Number(e.target.value)),
                              }
                            : x,
                        ),
                      )
                    }
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="shrink-0"
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

          {!restricted && (
            <>
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
                      <MoneyInput
                        value={form.oldPrice}
                        onChange={(n) => set("oldPrice", n)}
                      />
                    </Field>
                    <Field label={t("admin_new_price")}>
                      <MoneyInput
                        value={form.newPrice}
                        onChange={(n) => set("newPrice", n)}
                      />
                    </Field>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          {hotel ? (
            <>
              <span className="me-auto flex items-center gap-1.5 text-sm text-muted-foreground">
                {autoSaveStatus === "saving" && (
                  <><Loader2 className="size-3.5 animate-spin" />{t("admin_saving")}</>
                )}
                {autoSaveStatus === "saved" && t("admin_saved")}
              </span>
              <Button onClick={() => setOpen(false)}>
                {t("admin_close")}
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" onClick={() => setOpen(false)}>
                {t("admin_cancel")}
              </Button>
              <Button onClick={save} disabled={saving}>
                {saving && <Loader2 className="size-4 animate-spin" />}
                {t("admin_save")}
              </Button>
            </>
          )}
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

/** Number input that shows thousands separators as you type (50000 -> 50,000)
    and shows blank (not 0) when cleared. */
function MoneyInput({
  value,
  onChange,
  ...rest
}: {
  value: number;
  onChange: (n: number) => void;
} & Omit<React.ComponentProps<typeof Input>, "value" | "onChange" | "type">) {
  return (
    <Input
      type="text"
      inputMode="numeric"
      value={value ? value.toLocaleString("en-US") : ""}
      onChange={(e) => onChange(Number(e.target.value.replace(/\D/g, "")) || 0)}
      {...rest}
    />
  );
}
