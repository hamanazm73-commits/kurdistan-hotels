import type { Hotel } from "./types";

/**
 * Fallback hotels shown when Firestore is empty or unreachable, so the
 * site always looks alive. Admins add the real ones from /admin.
 */
export const SAMPLE_HOTELS: Hotel[] = [
  {
    id: "sample-grand-dukan",
    name: "Grand Dukan Lake Resort",
    nameI18n: { ckb: "ریزۆرتی دەریاچەی دووکان", kmr: "Rezorta Mezin a Golê ya Dûkanê", ar: "منتجع بحيرة دوكان" },
    city: "Dukan",
    price: 140_000,
    rating: 4.8,
    image:
      "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80",
    features: ["Wi-Fi", "Lake view", "Spa", "Restaurant"],
    rooms: [
      { type: "Single", price: 120_000 },
      { type: "Double", price: 160_000 },
      { type: "Suite", price: 240_000 },
    ],
    available: 12,
    featured: true,
    recommended: true,
    discount: { active: true, oldPrice: 180_000, newPrice: 140_000 },
    createdAt: Date.now(),
  },
  {
    id: "sample-erbil-citadel",
    name: "Erbil Citadel Hotel",
    nameI18n: { ckb: "هۆتێلی قەڵای هەولێر", kmr: "Otêla Qelay Hewlêrê", ar: "فندق قلعة أربيل" },
    city: "Erbil",
    price: 110_000,
    rating: 4.6,
    image:
      "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80",
    features: ["Wi-Fi", "Pool", "Gym", "Parking"],
    rooms: [
      { type: "Single", price: 95_000 },
      { type: "Double", price: 130_000 },
      { type: "Suite", price: 210_000 },
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
    nameI18n: { ckb: "کۆشکی سلێمانی", kmr: "Qesra Silêmaniyê", ar: "قصر السليمانية" },
    city: "Sulaymaniyah",
    price: 90_000,
    rating: 4.4,
    image:
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80",
    features: ["Wi-Fi", "Restaurant", "Bar"],
    rooms: [
      { type: "Single", price: 75_000 },
      { type: "Double", price: 105_000 },
      { type: "Suite", price: 170_000 },
    ],
    available: 15,
    featured: false,
    recommended: true,
    discount: { active: true, oldPrice: 120_000, newPrice: 90_000 },
    createdAt: Date.now(),
  },
  {
    id: "sample-halabja-garden",
    name: "Halabja Garden Inn",
    nameI18n: { ckb: "نزڵگەی باخچەی هەڵەبجە", kmr: "Mêvanxaneya Baxçeyê ya Helebceyê", ar: "نزل حديقة حلبجة" },
    city: "Halabja",
    price: 65_000,
    rating: 4.2,
    image:
      "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&q=80",
    features: ["Wi-Fi", "Garden", "Breakfast"],
    rooms: [
      { type: "Single", price: 55_000 },
      { type: "Double", price: 80_000 },
      { type: "Suite", price: 130_000 },
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
    nameI18n: { ckb: "هۆتێلی بەرزاییەکانی دهۆک", kmr: "Otêla Bilindahiyên Duhokê", ar: "فندق مرتفعات دهوك" },
    city: "Duhok",
    price: 85_000,
    rating: 4.5,
    image:
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80",
    features: ["Wi-Fi", "Mountain view", "Parking", "Restaurant"],
    rooms: [
      { type: "Single", price: 70_000 },
      { type: "Double", price: 100_000 },
      { type: "Suite", price: 165_000 },
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
    nameI18n: { ckb: "هۆتێلی بابە گوڕگوڕی کەرکوک", kmr: "Otêla Baba Gurgurê ya Kerkûkê", ar: "فندق بابا كركر كركوك" },
    city: "Kirkuk",
    price: 70_000,
    rating: 4.0,
    image:
      "https://images.unsplash.com/photo-1568084680786-a84f91d1153c?w=800&q=80",
    features: ["Wi-Fi", "Parking", "Restaurant"],
    rooms: [
      { type: "Single", price: 60_000 },
      { type: "Double", price: 85_000 },
      { type: "Suite", price: 130_000 },
    ],
    available: 14,
    featured: false,
    recommended: false,
    discount: { active: true, oldPrice: 95_000, newPrice: 70_000 },
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
