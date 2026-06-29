import type { Hotel } from "./types";

/**
 * Fallback hotels shown when Firestore is empty or unreachable, so the
 * site always looks alive. Admins add the real ones from /admin.
 */
export const SAMPLE_HOTELS: Hotel[] = [
  {
    id: "sample-grand-dukan",
    name: "Grand Dukan Lake Resort",
    nameI18n: { ckb: "ریزۆرتی دەریاچەی دووکان", ar: "منتجع بحيرة دوكان" },
    city: "Dukan",
    price: 140,
    rating: 4.8,
    image:
      "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80",
    features: ["Wi-Fi", "Lake view", "Spa", "Restaurant"],
    rooms: [
      { type: "Single", price: 120 },
      { type: "Double", price: 160 },
      { type: "Suite", price: 240 },
    ],
    available: 12,
    featured: true,
    recommended: true,
    discount: { active: true, oldPrice: 180, newPrice: 140 },
    createdAt: Date.now(),
  },
  {
    id: "sample-erbil-citadel",
    name: "Erbil Citadel Hotel",
    nameI18n: { ckb: "هۆتێلی قەڵای هەولێر", ar: "فندق قلعة أربيل" },
    city: "Erbil",
    price: 110,
    rating: 4.6,
    image:
      "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80",
    features: ["Wi-Fi", "Pool", "Gym", "Parking"],
    rooms: [
      { type: "Single", price: 95 },
      { type: "Double", price: 130 },
      { type: "Suite", price: 210 },
    ],
    available: 8,
    featured: true,
    recommended: false,
    discount: { active: false, oldPrice: 0, newPrice: 0 },
    createdAt: Date.now(),
  },
  {
    id: "sample-sulaymaniyah-palace",
    name: "Sulaymaniyah Palace",
    nameI18n: { ckb: "کۆشکی سلێمانی", ar: "قصر السليمانية" },
    city: "Sulaymaniyah",
    price: 90,
    rating: 4.4,
    image:
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80",
    features: ["Wi-Fi", "Restaurant", "Bar"],
    rooms: [
      { type: "Single", price: 75 },
      { type: "Double", price: 105 },
      { type: "Suite", price: 170 },
    ],
    available: 15,
    featured: false,
    recommended: true,
    discount: { active: true, oldPrice: 120, newPrice: 90 },
    createdAt: Date.now(),
  },
  {
    id: "sample-halabja-garden",
    name: "Halabja Garden Inn",
    nameI18n: { ckb: "نزڵگەی باخچەی هەڵەبجە", ar: "نزل حديقة حلبجة" },
    city: "Halabja",
    price: 65,
    rating: 4.2,
    image:
      "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&q=80",
    features: ["Wi-Fi", "Garden", "Breakfast"],
    rooms: [
      { type: "Single", price: 55 },
      { type: "Double", price: 80 },
      { type: "Suite", price: 130 },
    ],
    available: 20,
    featured: false,
    recommended: false,
    discount: { active: false, oldPrice: 0, newPrice: 0 },
    createdAt: Date.now(),
  },
  {
    id: "sample-duhok-heights",
    name: "Duhok Heights Hotel",
    nameI18n: { ckb: "هۆتێلی بەرزاییەکانی دهۆک", ar: "فندق مرتفعات دهوك" },
    city: "Duhok",
    price: 85,
    rating: 4.5,
    image:
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80",
    features: ["Wi-Fi", "Mountain view", "Parking", "Restaurant"],
    rooms: [
      { type: "Single", price: 70 },
      { type: "Double", price: 100 },
      { type: "Suite", price: 165 },
    ],
    available: 10,
    featured: true,
    recommended: true,
    discount: { active: false, oldPrice: 0, newPrice: 0 },
    createdAt: Date.now(),
  },
  {
    id: "sample-kirkuk-baba-gurgur",
    name: "Kirkuk Baba Gurgur Hotel",
    nameI18n: { ckb: "هۆتێلی بابە گوڕگوڕی کەرکوک", ar: "فندق بابا كركر كركوك" },
    city: "Kirkuk",
    price: 70,
    rating: 4.0,
    image:
      "https://images.unsplash.com/photo-1568084680786-a84f91d1153c?w=800&q=80",
    features: ["Wi-Fi", "Parking", "Restaurant"],
    rooms: [
      { type: "Single", price: 60 },
      { type: "Double", price: 85 },
      { type: "Suite", price: 130 },
    ],
    available: 14,
    featured: false,
    recommended: false,
    discount: { active: true, oldPrice: 95, newPrice: 70 },
    createdAt: Date.now(),
  },
];

export const CITIES = [
  "Dukan",
  "Erbil",
  "Sulaymaniyah",
  "Duhok",
  "Halabja",
  "Kirkuk",
] as const;
