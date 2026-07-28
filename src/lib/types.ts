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

/**
 * A promotional offer on a room — "3 nights for the price of 2", "suite with
 * breakfast included".
 *
 * Distinct from `discount`, which is a blanket cut on the hotel's headline
 * price, and from `seasons`, which is what a room simply costs at that time of
 * year. An offer is something the owner is choosing to advertise, in their own
 * words, and it may or may not carry a price of its own.
 */
export interface Offer {
  /** the deal itself, in the owner's words */
  title: string;
  /** which room it applies to; empty means the whole hotel */
  roomType?: string;
  /** the offer price, when it has one */
  price?: number;
  /** what that replaces, so the saving can be shown struck through */
  oldPrice?: number;
  /** optional validity window, ISO "YYYY-MM-DD" */
  from?: string;
  to?: string;
}

/** Whether `o` is currently running (an offer with no dates always is). */
export function offerLive(o: Offer, today = new Date().toISOString().slice(0, 10)): boolean {
  if (o.from && today < o.from) return false;
  if (o.to && today > o.to) return false;
  return true;
}

/** The hotel's live offers, newest-set first, ignoring blank rows. */
export function liveOffers(h: Pick<Hotel, "offers">): Offer[] {
  return (h.offers ?? []).filter((o) => o?.title?.trim() && offerLive(o));
}

/** A date range with its own per-room nightly prices (seasonal pricing).
    Dates are ISO "YYYY-MM-DD", so they compare and sort as plain strings. */
export interface Season {
  from: string;
  to: string;
  rooms: { type: string; price: number }[];
}

/** Standard room types with a name in every language. Owners usually type a
    standard name (Single, Suite, …) — in any language — and we translate it on
    display. Anything custom falls back to the exact text entered, so nothing
    is lost. */
export const ROOM_TYPES: { id: string; labels: Record<Lang, string> }[] = [
  { id: "single", labels: { en: "Single", ckb: "تاکەکەسی", ar: "مفردة", kmr: "Yekkesî" } },
  { id: "double", labels: { en: "Double", ckb: "دووکەسی", ar: "مزدوجة", kmr: "Dukesî" } },
  { id: "twin", labels: { en: "Twin", ckb: "دووتەختی", ar: "بسريرين", kmr: "Twin" } },
  { id: "triple", labels: { en: "Triple", ckb: "سێکەسی", ar: "ثلاثية", kmr: "Sêkesî" } },
  { id: "quad", labels: { en: "Quad", ckb: "چوارکەسی", ar: "رباعية", kmr: "Çarkesî" } },
  { id: "family", labels: { en: "Family", ckb: "خێزانی", ar: "عائلية", kmr: "Malbatî" } },
  { id: "suite", labels: { en: "Suite", ckb: "سویت", ar: "جناح", kmr: "Suît" } },
  { id: "deluxe", labels: { en: "Deluxe", ckb: "دیلوکس", ar: "ديلوكس", kmr: "Delûks" } },
  { id: "studio", labels: { en: "Studio", ckb: "ستۆدیۆ", ar: "استوديو", kmr: "Studyo" } },
  { id: "king", labels: { en: "King", ckb: "کینگ", ar: "كينج", kmr: "King" } },
  { id: "queen", labels: { en: "Queen", ckb: "کوین", ar: "كوين", kmr: "Queen" } },
  { id: "vip", labels: { en: "VIP", ckb: "VIP", ar: "VIP", kmr: "VIP" } },
];

/** Match a stored room-type string to a standard type by its id or any of its
    language names (case-insensitive), so a type typed in one language still
    translates to the others. */
const ROOM_TYPE_INDEX: Map<string, Record<Lang, string>> = (() => {
  const m = new Map<string, Record<Lang, string>>();
  for (const rt of ROOM_TYPES) {
    m.set(rt.id, rt.labels);
    for (const name of Object.values(rt.labels))
      m.set(name.trim().toLowerCase(), rt.labels);
  }
  return m;
})();

/** The standard id for a stored room-type string, whichever language the owner
    typed it in, or null for a custom type. Lets filters compare two spellings
    of the same room ("Suite", "سویت") as one thing. */
export function roomTypeId(type: string): string | null {
  if (!type) return null;
  const key = type.trim().toLowerCase();
  const hit = ROOM_TYPES.find(
    (rt) =>
      rt.id === key ||
      Object.values(rt.labels).some((n) => n.trim().toLowerCase() === key),
  );
  return hit ? hit.id : null;
}

/** Whether a stored room-type string is the standard type `id`. */
export function sameRoomType(type: string, id: string): boolean {
  return roomTypeId(type) === id;
}

/** The room-type name to show in `lang`; falls back to the raw text for custom
    types the owner typed themselves. */
export function roomTypeLabel(type: string, lang: Lang): string {
  if (!type) return "";
  const hit = ROOM_TYPE_INDEX.get(type.trim().toLowerCase());
  return hit ? hit[lang] : type;
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
  /** exact position for the map page; when unset the hotel is placed near its
      city centre instead */
  lat?: number;
  lng?: number;
  /** when true, the hotel is hidden from the public site (still shown in admin) */
  hidden?: boolean;
  /** The owner has closed the hotel for now — renovation, off-season, full.
      Unlike `hidden` it stays listed and reachable: booking is off, but the
      phone and WhatsApp buttons still work, because a guest asking when it
      reopens is exactly the conversation the owner wants. */
  closed?: boolean;
  /** online-payment options; guests pay the hotel directly via these links */
  payments?: PaymentMethod[];
  /** this hotel's own IQD-per-USD rate for the $ view; when unset (or 0) the
      site-wide default rate is used. Lets each owner price their own $ view. */
  iqdPerUsd?: number;
  /** date-range price overrides: a room's price on a given check-in date is its
      matching season's price, otherwise its base price. */
  seasons?: Season[];
  /** promotional offers the owner is advertising on their rooms */
  offers?: Offer[];
  /** free-text house rules / cancellation policy, in the owner's words */
  policy?: string;
  /** optional per-language policy (falls back to `policy`) */
  policyI18n?: LangMap;
  /** how many times this hotel's detail page has been viewed */
  views?: number;
  /** epoch ms of the most recent booking — used for the "last booked" note */
  lastBookedAt?: number;
  /** epoch ms of recent bookings, newest first, pruned to the last 7 days —
      lets a card say how many bookings, not just when the last one was */
  recentBookingsAt?: number[];
  /** lifetime taps on WhatsApp / call / map, by kind */
  contactClicks?: Partial<Record<"whatsapp" | "call" | "map", number>>;
  /** epoch ms of those taps, pruned to the last 30 days, so the owner's panel
      can report real recent activity rather than an ever-growing total */
  contactClicksAt?: number[];
  /** how many approved guest reviews this hotel has. Denormalized by
      syncHotelReviewStats so the listing doesn't query reviews per card. */
  reviewCount?: number;
  /** average of those approved reviews (1 decimal); 0 when there are none.
      Distinct from `rating`, which the owner sets. */
  reviewAvg?: number;
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

export type ReviewStatus = "pending" | "approved" | "rejected";

/** A guest's rating + comment on a hotel. New reviews are "pending" until an
    owner/admin approves them, so spam never shows publicly. */
export interface Review {
  hotelId: string;
  name: string;
  /** 1–5 stars */
  rating: number;
  comment: string;
  status?: ReviewStatus;
  createdAt?: number;
}

/** Average rating (rounded to 1 decimal) + count from a list of reviews. */
export function reviewSummary(
  reviews: { rating: number }[],
): { average: number; count: number } {
  const count = reviews.length;
  if (!count) return { average: 0, count: 0 };
  const sum = reviews.reduce((s, r) => s + (Number(r.rating) || 0), 0);
  return { average: Math.round((sum / count) * 10) / 10, count };
}

/**
 * A blog article, written by the site owner in the dashboard. Posts bring in
 * search traffic (travel guides, city tips) and are written in ONE language —
 * the owner picks it — so nothing has to be translated four times.
 */
export interface BlogPost {
  id: string;
  /** URL part, e.g. "best-hotels-in-erbil" */
  slug: string;
  title: string;
  /** short summary shown in the list and used as the meta description */
  excerpt?: string;
  /** body text: blank lines separate paragraphs, "## " a heading, "- " a bullet */
  content: string;
  coverImage?: string;
  lang: Lang;
  /** drafts stay out of the public blog and the sitemap */
  published: boolean;
  createdAt?: number;
  updatedAt?: number;
}

export type BlogPostInput = Omit<BlogPost, "id">;

/** Turn a title into a clean URL slug (keeps Arabic/Kurdish letters). */
export function slugify(title: string): string {
  return title
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/** A visitor's feedback about the site (not tied to a booking). */
export interface Feedback {
  /** optional name the visitor gave */
  name?: string;
  /** optional way to reach them back (phone or email) */
  contact?: string;
  /** optional 1–5 satisfaction rating */
  rating?: number;
  message: string;
  /** the page they sent it from */
  page?: string;
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

/** A room's nightly price for a given check-in date: the price from a season
    that covers that date, otherwise the room's base price. `date` is ISO
    "YYYY-MM-DD" (what an <input type="date"> yields), so the range check is a
    plain string comparison. */
/** The season (date range) that covers a given check-in date, if any.
    Tolerates from/to entered in either order. `date` is ISO "YYYY-MM-DD". */
export function seasonFor(
  h: Pick<Hotel, "seasons">,
  date: string | undefined | null,
): Season | undefined {
  if (!date) return undefined;
  return (h.seasons ?? []).find((s) => {
    if (!s.from || !s.to) return false;
    const lo = s.from <= s.to ? s.from : s.to;
    const hi = s.from <= s.to ? s.to : s.from;
    return lo <= date && date <= hi;
  });
}

export function roomPriceOn(
  h: Pick<Hotel, "rooms" | "seasons">,
  roomType: string,
  date: string | undefined | null,
): number {
  const base = h.rooms?.find((r) => r.type === roomType)?.price ?? 0;
  const season = seasonFor(h, date);
  if (!season) return base;
  const sr = season.rooms?.find((r) => r.type === roomType);
  return sr && sr.price > 0 ? sr.price : base;
}

/** Route an R2 public-dev image URL through our cached /api/img proxy (fast,
    CDN-cached). Non-r2.dev URLs (Unsplash, base64, video) are returned as-is. */
export function mediaSrc(url: string | undefined | null): string {
  if (!url) return "";
  const m = url.match(/^https:\/\/pub-[a-z0-9]+\.r2\.dev\/(.+)$/i);
  return m ? `/api/img/${m[1]}` : url;
}

/**
 * Whether a src must bypass the image optimizer. Inline base64 (the fallback
 * when a media doc has no hosted URL) and blob: previews have nothing for the
 * optimizer to fetch, and it errors rather than passing them through.
 */
export function isRawSrc(src: string | undefined | null): boolean {
  if (!src) return true;
  return src.startsWith("data:") || src.startsWith("blob:");
}

export function formatPrice(price: number, lang: Lang): string {
  const n = price.toLocaleString("en-US");
  return lang === "en" || lang === "kmr" ? `${n} IQD` : `${n} دینار`;
}

/** Local numbers are stored as 0xxx; WhatsApp needs the country code. */
function waNumber(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return digits.startsWith("0") ? "964" + digits.slice(1) : digits;
}

/**
 * The line that tells the hotel where a WhatsApp message came from.
 *
 * Without it an owner has no way to know the site sent them the guest — the
 * message looks like any other walk-in enquiry, and the listing gets no credit
 * for the business it brought. The link is to the hotel's own page, so it
 * doubles as proof and lets the owner open what the guest was looking at.
 */
function waSource(hotelId: string | undefined, via: string): string {
  return hotelId
    ? `${via} https://hotelskurdistan.com/hotels/${hotelId}`
    : `${via} hotelskurdistan.com`;
}

/**
 * A wa.me link for a general enquiry about a hotel, tagged with where the
 * guest came from.
 */
export function buildHotelWhatsAppUrl(
  phone: string,
  hotelName: string,
  msg: string,
  opts: { hotelId?: string; via: string },
): string {
  const text = `${msg} ${hotelName}\n\n${waSource(opts.hotelId, opts.via)}`;
  return `https://wa.me/${waNumber(phone)}?text=${encodeURIComponent(text)}`;
}

/**
 * A wa.me link carrying a booking summary, for the guest to send to the hotel.
 */
export function buildBookingWhatsAppUrl(
  phone: string,
  b: {
    hotel: string;
    hotelId?: string;
    name: string;
    roomType: string;
    checkIn: string;
    nights: number;
    intro: string;
    via: string;
  },
): string {
  const text = [
    b.intro,
    `🏨 ${b.hotel}`,
    `👤 ${b.name}`,
    `🛏 ${b.roomType}`,
    `📅 ${b.checkIn} — ${b.nights}`,
    "",
    waSource(b.hotelId, b.via),
  ].join("\n");
  return `https://wa.me/${waNumber(phone)}?text=${encodeURIComponent(text)}`;
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
