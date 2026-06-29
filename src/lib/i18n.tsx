"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { Lang } from "./types";

export const LANGS: Record<
  Lang,
  { label: string; flag: string; dir: "rtl" | "ltr" }
> = {
  ckb: { label: "کوردی", flag: "🟡", dir: "rtl" },
  en: { label: "English", flag: "🇬🇧", dir: "ltr" },
  ar: { label: "العراقي", flag: "🇮🇶", dir: "rtl" },
};

type Dict = Record<string, string>;

const ckb: Dict = {
  brand: "هۆتێلەکانی کوردستان",
  nav_home: "سەرەتا",
  nav_hotels: "هۆتێلەکان",
  nav_admin: "بەڕێوەبردن",
  nav_login: "چوونەژوورەوە",
  nav_logout: "چوونەدەرەوە",
  theme_light: "ڕووناک",
  theme_dark: "تاریک",
  language: "زمان",

  hero_badge: "✨ باشترین هۆتێلەکانی کوردستان",
  hero_title: "ماڵی دووەمت لە کوردستان بدۆزەرەوە",
  hero_sub:
    "لە دووکانی جوانەوە تا قەڵای هەولێر — هۆتێلی نایاب، نرخی ڕوون، حیجزی خێرا.",
  hero_cta: "گەڕان بەدوای هۆتێل",
  hero_cta2: "هۆتێلە تایبەتەکان",
  stat_hotels: "هۆتێل",
  stat_cities: "شار",
  stat_guests: "میوان",

  search_ph: "گەڕان بەدوای هۆتێل یان شار...",
  filter_all: "هەموو",
  filter_featured: "تایبەت",
  sort_label: "ڕیزکردن",
  sort_recommended: "پێشنیارکراو",
  sort_price_low: "نرخ: کەم بۆ زۆر",
  sort_price_high: "نرخ: زۆر بۆ کەم",
  sort_rating: "بەرزترین هەڵسەنگاندن",
  max_price: "زۆرترین نرخ",
  results_found: "{n} هۆتێل دۆزرایەوە",
  no_results: "هیچ هۆتێلێک نەدۆزرایەوە 😔",

  badge_featured: "تایبەت",
  badge_recommended: "پێشنیارکراو",
  badge_discount: "داشکاندن",
  per_night: "/ شەو",
  rooms_left: "{n} ژوور ماوە",
  book_now: "حیجزکردن",
  view_details: "وردەکاری",
  from: "لە",

  book_title: "حیجزکردنی ژوور",
  book_hotel: "هۆتێل",
  book_name: "ناوی تەواو",
  book_phone: "ژمارەی تەلەفۆن",
  book_checkin: "بەرواری چوونەژوورەوە",
  book_nights: "ژمارەی شەوەکان",
  book_roomtype: "جۆری ژوور",
  book_select_room: "جۆری ژوور هەڵبژێرە",
  book_total: "کۆی گشتی",
  book_confirm: "پشتڕاستکردنەوەی حیجز",
  book_success: "حیجزەکەت تۆمارکرا ✅",
  book_required: "تکایە هەموو خانەکان پڕبکەرەوە",
  book_ratelimited: "هەوڵی زۆر! تکایە کەمێک چاوەڕێبە.",
  book_full: "ببورە، هیچ ژوورێک نەماوە 😔",

  footer_about: "باشترین پلاتفۆڕم بۆ دۆزینەوەی هۆتێل لە کوردستان.",
  footer_links: "بەستەرەکان",
  footer_contact: "پەیوەندی",
  footer_rights: "© 2026 هۆتێلەکانی کوردستان. هەموو مافەکان پارێزراون.",

  login_title: "چوونەژوورەوە",
  login_sub: "بچۆ ژوورەوە بۆ بەڕێوەبردنی هۆتێلەکان",
  login_email: "ئیمەیل",
  login_password: "وشەی نهێنی",
  login_btn: "چوونەژوورەوە",
  login_error: "ئیمەیل یان وشەی نهێنی هەڵەیە",
  login_back: "گەڕانەوە بۆ ماڵپەڕ",

  admin_title: "داشبۆردی بەڕێوەبردن",
  admin_hotels: "هۆتێلەکان",
  admin_bookings: "حیجزکردنەکان",
  admin_admins: "بەڕێوەبەران",
  admin_add_hotel: "زیادکردنی هۆتێل",
  admin_edit_hotel: "دەستکاریکردنی هۆتێل",
  admin_seed: "زیادکردنی نموونە",
  admin_name: "ناو",
  admin_city: "شار",
  admin_price: "نرخ ($)",
  admin_rating: "هەڵسەنگاندن",
  admin_image: "بەستەری وێنە",
  admin_available: "ژووری بەردەست",
  admin_features: "تایبەتمەندییەکان (بە کۆما)",
  admin_featured: "هۆتێلی تایبەت",
  admin_recommended: "پێشنیارکراو",
  admin_discount_on: "داشکاندن چالاکە",
  admin_old_price: "نرخی پێشوو",
  admin_new_price: "نرخی ئێستا",
  admin_save: "پاشەکەوتکردن",
  admin_cancel: "هەڵوەشاندنەوە",
  admin_delete: "سڕینەوە",
  admin_edit: "دەستکاری",
  admin_confirm_delete: "دڵنیایت لە سڕینەوە؟",
  admin_add_admin: "زیادکردنی بەڕێوەبەر",
  admin_admin_email: "ئیمەیلی بەڕێوەبەر",
  admin_enabled: "چالاک",
  admin_owner_only: "تەنها خاوەن دەتوانێت بەڕێوەبەران زیاد بکات",
  admin_you_owner: "تۆ خاوەنی ماڵپەڕیت 👑",
  admin_no_access: "ڕێگەت پێنەدراوە بۆ ئەم پەڕەیە",
  admin_saved: "پاشەکەوتکرا ✅",
  admin_deleted: "سڕایەوە",
  role_owner: "خاوەن",
  role_admin: "بەڕێوەبەر",

  admin_description: "وەسف",
  admin_address: "ناونیشان",
  admin_phone: "ژمارەی پەیوەندی",
  admin_rooms: "ژوورەکان",
  admin_room_type: "جۆری ژوور",
  admin_room_price: "نرخ ($)",
  admin_add_room: "زیادکردنی ژوور",
  admin_cover_image: "وێنەی سەرەکی",
  admin_gallery: "وێنەی زیاتر (گالێری)",
  admin_upload: "بارکردنی وێنە",
  admin_uploading: "بارکردن...",
  admin_image_url: "یان بەستەری وێنە بنووسە",
  admin_translations: "ناو و وەسف بە زمانی تر (ئارەزوومەندانە)",
  admin_name_in: "ناو بە",
  admin_desc_in: "وەسف بە",
  detail_about: "دەربارەی هۆتێل",
  detail_rooms: "ژوور و نرخەکان",
  detail_amenities: "خزمەتگوزارییەکان",
  detail_location: "شوێن",
  detail_contact: "پەیوەندی",
  detail_back: "گەڕانەوە",
  detail_gallery: "وێنەکان",

  loading: "چاوەڕێبە...",
};

const en: Dict = {
  brand: "Kurdistan Hotels",
  nav_home: "Home",
  nav_hotels: "Hotels",
  nav_admin: "Admin",
  nav_login: "Log in",
  nav_logout: "Log out",
  theme_light: "Light",
  theme_dark: "Dark",
  language: "Language",

  hero_badge: "✨ The finest stays in Kurdistan",
  hero_title: "Find your second home in Kurdistan",
  hero_sub:
    "From the shores of Dukan Lake to the Erbil Citadel — handpicked hotels, clear prices, instant booking.",
  hero_cta: "Explore hotels",
  hero_cta2: "Featured stays",
  stat_hotels: "Hotels",
  stat_cities: "Cities",
  stat_guests: "Guests",

  search_ph: "Search hotels or city...",
  filter_all: "All",
  filter_featured: "Featured",
  sort_label: "Sort",
  sort_recommended: "Recommended",
  sort_price_low: "Price: low to high",
  sort_price_high: "Price: high to low",
  sort_rating: "Top rated",
  max_price: "Max price",
  results_found: "{n} hotels found",
  no_results: "No hotels found 😔",

  badge_featured: "Featured",
  badge_recommended: "Recommended",
  badge_discount: "Deal",
  per_night: "/ night",
  rooms_left: "{n} rooms left",
  book_now: "Book now",
  view_details: "Details",
  from: "from",

  book_title: "Book a room",
  book_hotel: "Hotel",
  book_name: "Full name",
  book_phone: "Phone number",
  book_checkin: "Check-in date",
  book_nights: "Nights",
  book_roomtype: "Room type",
  book_select_room: "Choose a room type",
  book_total: "Total",
  book_confirm: "Confirm booking",
  book_success: "Your booking was saved ✅",
  book_required: "Please fill in all fields",
  book_ratelimited: "Too many attempts! Please wait a moment.",
  book_full: "Sorry, no rooms left 😔",

  footer_about: "The best platform to find hotels across Kurdistan.",
  footer_links: "Links",
  footer_contact: "Contact",
  footer_rights: "© 2026 Kurdistan Hotels. All rights reserved.",

  login_title: "Log in",
  login_sub: "Sign in to manage the hotels",
  login_email: "Email",
  login_password: "Password",
  login_btn: "Log in",
  login_error: "Wrong email or password",
  login_back: "Back to site",

  admin_title: "Admin dashboard",
  admin_hotels: "Hotels",
  admin_bookings: "Bookings",
  admin_admins: "Admins",
  admin_add_hotel: "Add hotel",
  admin_edit_hotel: "Edit hotel",
  admin_seed: "Add samples",
  admin_name: "Name",
  admin_city: "City",
  admin_price: "Price ($)",
  admin_rating: "Rating",
  admin_image: "Image URL",
  admin_available: "Available rooms",
  admin_features: "Features (comma separated)",
  admin_featured: "Featured hotel",
  admin_recommended: "Recommended",
  admin_discount_on: "Discount active",
  admin_old_price: "Old price",
  admin_new_price: "New price",
  admin_save: "Save",
  admin_cancel: "Cancel",
  admin_delete: "Delete",
  admin_edit: "Edit",
  admin_confirm_delete: "Delete this hotel?",
  admin_add_admin: "Add admin",
  admin_admin_email: "Admin email",
  admin_enabled: "Enabled",
  admin_owner_only: "Only the owner can manage admins",
  admin_you_owner: "You are the owner 👑",
  admin_no_access: "You don't have access to this page",
  admin_saved: "Saved ✅",
  admin_deleted: "Deleted",
  role_owner: "Owner",
  role_admin: "Admin",

  admin_description: "Description",
  admin_address: "Address",
  admin_phone: "Contact phone",
  admin_rooms: "Rooms",
  admin_room_type: "Room type",
  admin_room_price: "Price ($)",
  admin_add_room: "Add room",
  admin_cover_image: "Cover image",
  admin_gallery: "More images (gallery)",
  admin_upload: "Upload image",
  admin_uploading: "Uploading...",
  admin_image_url: "or paste an image URL",
  admin_translations: "Name & description in other languages (optional)",
  admin_name_in: "Name in",
  admin_desc_in: "Description in",
  detail_about: "About this hotel",
  detail_rooms: "Rooms & prices",
  detail_amenities: "Amenities",
  detail_location: "Location",
  detail_contact: "Contact",
  detail_back: "Back",
  detail_gallery: "Photos",

  loading: "Loading...",
};

const ar: Dict = {
  brand: "فنادق كردستان",
  nav_home: "الرئيسية",
  nav_hotels: "الفنادق",
  nav_admin: "الإدارة",
  nav_login: "دخول",
  nav_logout: "خروج",
  theme_light: "نهاري",
  theme_dark: "ليلي",
  language: "اللغة",

  hero_badge: "✨ أحلى فنادق بكردستان",
  hero_title: "لگه بيتك الثاني بكردستان",
  hero_sub:
    "من بحيرة دوكان لقلعة أربيل — فنادق منتقاة، أسعار واضحة، حجز فوري.",
  hero_cta: "شوف الفنادق",
  hero_cta2: "الفنادق المميزة",
  stat_hotels: "فندق",
  stat_cities: "مدينة",
  stat_guests: "ضيف",

  search_ph: "دوّر على فندق أو مدينة...",
  filter_all: "الكل",
  filter_featured: "مميز",
  sort_label: "ترتيب",
  sort_recommended: "المنصوح بيه",
  sort_price_low: "السعر: من الأرخص",
  sort_price_high: "السعر: من الأغلى",
  sort_rating: "الأعلى تقييم",
  max_price: "أعلى سعر",
  results_found: "{n} فندق متوفر",
  no_results: "ماكو ولا فندق 😔",

  badge_featured: "مميز",
  badge_recommended: "منصوح بيه",
  badge_discount: "تخفيض",
  per_night: "/ ليلة",
  rooms_left: "باقي {n} غرف",
  book_now: "احجز",
  view_details: "التفاصيل",
  from: "من",

  book_title: "حجز غرفة",
  book_hotel: "الفندق",
  book_name: "الاسم الكامل",
  book_phone: "رقم التلفون",
  book_checkin: "تاريخ الدخول",
  book_nights: "عدد الليالي",
  book_roomtype: "نوع الغرفة",
  book_select_room: "اختر نوع الغرفة",
  book_total: "المجموع",
  book_confirm: "أكّد الحجز",
  book_success: "انحجز حجزك ✅",
  book_required: "رجاءً عبّي كل الخانات",
  book_ratelimited: "محاولات وايد! استنى شوية.",
  book_full: "آسفين، ماكو غرف باقية 😔",

  footer_about: "أحسن منصة للقاء الفنادق بكردستان.",
  footer_links: "روابط",
  footer_contact: "تواصل",
  footer_rights: "© 2026 فنادق كردستان. كل الحقوق محفوظة.",

  login_title: "تسجيل الدخول",
  login_sub: "سجّل دخول حتى تدير الفنادق",
  login_email: "الإيميل",
  login_password: "كلمة السر",
  login_btn: "دخول",
  login_error: "الإيميل أو كلمة السر غلط",
  login_back: "ارجع للموقع",

  admin_title: "لوحة الإدارة",
  admin_hotels: "الفنادق",
  admin_bookings: "الحجوزات",
  admin_admins: "المدراء",
  admin_add_hotel: "إضافة فندق",
  admin_edit_hotel: "تعديل فندق",
  admin_seed: "إضافة نماذج",
  admin_name: "الاسم",
  admin_city: "المدينة",
  admin_price: "السعر ($)",
  admin_rating: "التقييم",
  admin_image: "رابط الصورة",
  admin_available: "الغرف المتوفرة",
  admin_features: "الميزات (مفصولة بفاصلة)",
  admin_featured: "فندق مميز",
  admin_recommended: "منصوح بيه",
  admin_discount_on: "التخفيض فعّال",
  admin_old_price: "السعر القديم",
  admin_new_price: "السعر الحالي",
  admin_save: "حفظ",
  admin_cancel: "إلغاء",
  admin_delete: "حذف",
  admin_edit: "تعديل",
  admin_confirm_delete: "تحذف هذا الفندق؟",
  admin_add_admin: "إضافة مدير",
  admin_admin_email: "إيميل المدير",
  admin_enabled: "مفعّل",
  admin_owner_only: "بس المالك يقدر يدير المدراء",
  admin_you_owner: "إنت مالك الموقع 👑",
  admin_no_access: "ماعندك صلاحية لهالصفحة",
  admin_saved: "انحفظ ✅",
  admin_deleted: "انحذف",
  role_owner: "المالك",
  role_admin: "مدير",

  admin_description: "الوصف",
  admin_address: "العنوان",
  admin_phone: "رقم التواصل",
  admin_rooms: "الغرف",
  admin_room_type: "نوع الغرفة",
  admin_room_price: "السعر ($)",
  admin_add_room: "إضافة غرفة",
  admin_cover_image: "الصورة الرئيسية",
  admin_gallery: "صور إضافية (معرض)",
  admin_upload: "رفع صورة",
  admin_uploading: "جاري الرفع...",
  admin_image_url: "أو الصق رابط الصورة",
  admin_translations: "الاسم والوصف بلغات أخرى (اختياري)",
  admin_name_in: "الاسم بـ",
  admin_desc_in: "الوصف بـ",
  detail_about: "عن الفندق",
  detail_rooms: "الغرف والأسعار",
  detail_amenities: "الخدمات",
  detail_location: "الموقع",
  detail_contact: "تواصل",
  detail_back: "رجوع",
  detail_gallery: "الصور",

  loading: "جاري التحميل...",
};

const DICTS: Record<Lang, Dict> = { ckb, en, ar };

/** English city name -> translation key */
const CITY_KEYS: Record<string, Dict> = {
  Dukan: { ckb: "دووکان", en: "Dukan", ar: "دوكان" },
  Erbil: { ckb: "هەولێر", en: "Erbil", ar: "أربيل" },
  Sulaymaniyah: { ckb: "سلێمانی", en: "Sulaymaniyah", ar: "السليمانية" },
  Duhok: { ckb: "دهۆک", en: "Duhok", ar: "دهوك" },
  Halabja: { ckb: "هەڵەبجە", en: "Halabja", ar: "حلبجة" },
  Kirkuk: { ckb: "کەرکوک", en: "Kirkuk", ar: "كركوك" },
};

/** Common amenities -> translations (keyed by the lowercased English term). */
const FEATURE_KEYS: Record<string, Dict> = {
  "wi-fi": { ckb: "وای‌فای", en: "Wi-Fi", ar: "واي فاي" },
  wifi: { ckb: "وای‌فای", en: "Wi-Fi", ar: "واي فاي" },
  restaurant: { ckb: "ڕیستۆرانت", en: "Restaurant", ar: "مطعم" },
  parking: { ckb: "پارکینگ", en: "Parking", ar: "موقف سيارات" },
  pool: { ckb: "مەلەوانگە", en: "Pool", ar: "مسبح" },
  gym: { ckb: "هۆڵی وەرزش", en: "Gym", ar: "صالة رياضية" },
  spa: { ckb: "سپا", en: "Spa", ar: "سبا" },
  bar: { ckb: "بار", en: "Bar", ar: "بار" },
  garden: { ckb: "باخچە", en: "Garden", ar: "حديقة" },
  breakfast: { ckb: "نانی بەیانی", en: "Breakfast", ar: "فطور" },
  "lake view": { ckb: "دیمەنی دەریاچە", en: "Lake view", ar: "إطلالة على البحيرة" },
  "mountain view": { ckb: "دیمەنی شاخ", en: "Mountain view", ar: "إطلالة على الجبل" },
  ac: { ckb: "ئەیرکۆندیشن", en: "AC", ar: "تكييف" },
  elevator: { ckb: "ئاسانسۆر", en: "Elevator", ar: "مصعد" },
};

interface I18nValue {
  lang: Lang;
  dir: "rtl" | "ltr";
  setLang: (l: Lang) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
  tCity: (city: string) => string;
  tFeature: (feature: string) => string;
}

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("ckb");

  useEffect(() => {
    const saved = (localStorage.getItem("lang") as Lang) || "ckb";
    setLangState(saved);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = LANGS[lang].dir;
  }, [lang]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    localStorage.setItem("lang", l);
  }, []);

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) => {
      let s = DICTS[lang][key] ?? DICTS.en[key] ?? key;
      if (vars)
        for (const [k, v] of Object.entries(vars))
          s = s.replace(`{${k}}`, String(v));
      return s;
    },
    [lang],
  );

  const tCity = useCallback(
    (city: string) => CITY_KEYS[city]?.[lang] ?? city,
    [lang],
  );

  const tFeature = useCallback(
    (feature: string) =>
      FEATURE_KEYS[feature.trim().toLowerCase()]?.[lang] ?? feature,
    [lang],
  );

  return (
    <I18nContext.Provider
      value={{ lang, dir: LANGS[lang].dir, setLang, t, tCity, tFeature }}
    >
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
