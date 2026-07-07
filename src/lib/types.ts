export type Lang = "ckb" | "kmr" | "en" | "ar";

export type Role = "owner" | "admin" | "hotel";

/** Optional per-language overrides for a text field. */
export type LangMap = Partial<Record<Lang, string>>;

/** Pick the translation for `lang`, falling back to the base value. */
export function pickLang(
  base: string | undefined,
  map: LangMap | undefined,
  lang: Lang,
): string {
  const v = map?.[lang];
  return (v && v.trim()) || base || "";
}

export interface RoomType {
  type: string;
  price: number;
  /** how many rooms of this type are still free (optional; undefined = untracked) */
  available?: number;
}

export interface Discount {
  active: boolean;
  /** price before the discount */
  oldPrice: number;
  /** price now */
  newPrice: number;
}

/**
 * One online-payment option for a hotel. `url` is a link the guest is sent to
 * so they pay the hotel directly — the platform never touches the money.
 */
export interface PaymentMethod {
  /** one of PAYMENT_TYPES ids: fib | fastpay | zaincash | nass | card | link */
  type: string;
  /** the payment link / page for this hotel */
  url: string;
}

/** Supported online-payment rails in Kurdistan (brand names, not translated). */
export const PAYMENT_TYPES = [
  { id: "fib", label: "FIB", color: "#00A651" },
  { id: "fastpay", label: "FastPay", color: "#1E4F9C" },
  { id: "zaincash", label: "ZainCash", color: "#8DC63F" },
  { id: "nass", label: "Nass", color: "#E4002B" },
  { id: "card", label: "Visa / MasterCard", color: "#1A1F71" },
  { id: "link", label: "Payment link", color: "#6B7280" },
] as const;

export function paymentLabel(type: string): string {
  return PAYMENT_TYPES.find((p) => p.id === type)?.label ?? type;
}

export function paymentColor(type: string): string {
  return PAYMENT_TYPES.find((p) => p.id === type)?.color ?? "#6B7280";
}

export interface Hotel {
  id: string;
  name: string;
  city: string;
  /** base nightly price (used when there is no discount) */
  price: number;
  rating: number;
  /** cover image */
  image: string;
  /** extra gallery images (besides the cover) */
  images?: string[];
  features: string[];
  rooms: RoomType[];
  available: number;
  featured: boolean;
  recommended: boolean;
  discount: Discount;
  /** optional per-language hotel name (falls back to `name`) */
  nameI18n?: LangMap;
  /** free-text description shown on the detail page */
  description?: string;
  /** optional per-language description (falls back to `description`) */
  descriptionI18n?: LangMap;
  /** street / area address */
  address?: string;
  /** contact phone */
  phone?: string;
  /** email to send booking notifications for this hotel to (owner's email) */
  notifyEmail?: string;
  /** optional promo video (YouTube link or direct mp4 URL) */
  video?: string;
  /** Google Maps link / place URL for the hotel */
  mapUrl?: string;
  /** when true, the hotel is hidden from the public site (still shown in admin) */
  hidden?: boolean;
  /** online-payment options; guests pay the hotel directly via these links */
  payments?: PaymentMethod[];
  /** this hotel's own IQD-per-USD rate for the $ view; when unset (or 0) the
      site-wide default rate is used. Lets each owner price their own $ view. */
  iqdPerUsd?: number;
  createdAt?: number;
}

export type HotelInput = Omit<Hotel, "id">;

/** A booking starts as a request the hotel owner must confirm; the room is only
    held on confirm. cancelled/noshow release a held room. */
export type BookingStatus = "pending" | "confirmed" | "cancelled" | "noshow";

export interface Booking {
  hotel: string;
  /** owner-confirmation workflow status (undefined = legacy = treated as confirmed) */
  status?: BookingStatus;
  /** id of the booked hotel (used to look up its city) */
  hotelId?: string | null;
  name: string;
  phone: string;
  roomType: string;
  roomPrice: number;
  checkIn: string;
  nights: number;
  createdAt?: number;
}

export interface AdminRecord {
  email: string;
  role: Role;
  enabled: boolean;
  /** for role "hotel": the hotel this owner is scoped to */
  hotelId?: string;
  hotelName?: string;
  addedBy?: string;
  createdAt?: number;
}

/** the price a hotel is actually sold at right now */
export function effectivePrice(h: Pick<Hotel, "price" | "discount">): number {
  return h.discount?.active ? h.discount.newPrice : h.price;
}

/** Route an R2 public-dev image URL through our cached /api/img proxy (fast,
    CDN-cached). Non-r2.dev URLs (Unsplash, base64, video) are returned as-is. */
export function mediaSrc(url: string | undefined | null): string {
  if (!url) return "";
  const m = url.match(/^https:\/\/pub-[a-z0-9]+\.r2\.dev\/(.+)$/i);
  return m ? `/api/img/${m[1]}` : url;
}

export function formatPrice(price: number, lang: Lang): string {
  const n = price.toLocaleString("en-US");
  return lang === "en" || lang === "kmr" ? `${n} IQD` : `${n} دینار`;
}

/** Best Google Maps URL for a hotel: its explicit link, else a name+city search. */
export function mapsUrl(
  h: Pick<Hotel, "mapUrl" | "name" | "city" | "address">,
): string {
  if (h.mapUrl && h.mapUrl.trim()) return h.mapUrl.trim();
  const q = encodeURIComponent(
    [h.name, h.address, h.city].filter(Boolean).join(", "),
  );
  return `https://www.google.com/maps/search/?api=1&query=${q}`;
}

/** Total free rooms: sum of per-room availability when tracked, else the hotel field. */
export function totalAvailable(h: Pick<Hotel, "available" | "rooms">): number {
  const tracked = h.rooms?.filter((r) => typeof r.available === "number") ?? [];
  if (tracked.length > 0)
    return tracked.reduce((s, r) => s + Math.max(0, r.available ?? 0), 0);
  return h.available ?? 0;
}
