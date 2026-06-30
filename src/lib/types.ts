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
}

export interface Discount {
  active: boolean;
  /** price before the discount */
  oldPrice: number;
  /** price now */
  newPrice: number;
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
  createdAt?: number;
}

export type HotelInput = Omit<Hotel, "id">;

export interface Booking {
  hotel: string;
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

export function formatPrice(price: number, lang: Lang): string {
  const n = price.toLocaleString("en-US");
  return lang === "en" || lang === "kmr" ? `${n} IQD` : `${n} دینار`;
}
