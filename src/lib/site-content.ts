import type { Lang } from "./types";

/** A short string in every supported language. */
type L = Record<Lang, string>;

/* ---------------- Multilingual "about" (server-rendered SEO) ----------------
   Rendered once, in all four languages at the same time, so search engines
   crawl real Kurdish / Arabic / English / Kurmanji text (the rest of the site
   swaps language on the client, so only one language would otherwise appear in
   the HTML). This is what lets the site be found by searches like
   "فنادق كردستان", "hotels in Kurdistan" or "otêlên Kurdistanê". */

export interface SeoAboutBlock {
  lang: Lang;
  dir: "rtl" | "ltr";
  /** short language label shown to readers */
  label: string;
  heading: string;
  body: string;
}

export const SEO_ABOUT_HEADING: L = {
  ckb: "دەربارەی هۆتێلەکانی کوردستان",
  en: "About Kurdistan Hotels",
  ar: "حول فنادق كردستان",
  kmr: "Derbarê Otêlên Kurdistanê",
};

export const SEO_ABOUT: SeoAboutBlock[] = [
  {
    lang: "ckb",
    dir: "rtl",
    label: "کوردی",
    heading: "هۆتێلەکانی کوردستان",
    body: "هۆتێلەکانی کوردستان پلاتفۆرمێکە بۆ دۆزینەوە و حیجزکردنی هۆتێل لە هەموو هەرێمی کوردستان — هەولێر، سلێمانی، دهۆک، دووکان، هەڵەبجە و کەرکووک. بە ئاسانی هۆتێل بدۆزەرەوە، نرخەکان بەراورد بکە و ڕاستەوخۆ لەگەڵ هۆتێلەکە حیجز بکە.",
  },
  {
    lang: "ar",
    dir: "rtl",
    label: "عربي",
    heading: "فنادق كردستان",
    body: "فنادق كردستان منصّة للبحث عن الفنادق وحجزها في جميع أنحاء إقليم كردستان — أربيل (هەولێر)، السليمانية، دهوك، دوكان، حلبجة وكركوك. ابحث عن فندق، قارن الأسعار واحجز مباشرة مع الفندق دون رسوم إضافية.",
  },
  {
    lang: "en",
    dir: "ltr",
    label: "English",
    heading: "Hotels in Kurdistan",
    body: "Kurdistan Hotels helps you find and book hotels across the Kurdistan Region — Erbil (Hawler), Sulaymaniyah (Slemani), Duhok, Dukan, Halabja and Kirkuk. Search for a hotel, compare prices and book directly with the hotel, with no extra fees.",
  },
  {
    lang: "kmr",
    dir: "ltr",
    label: "Kurmancî",
    heading: "Otêlên Kurdistanê",
    body: "Otêlên Kurdistanê alîkariya te dike ku li seranserê Herêma Kurdistanê otêlan bibînî û rezerve bikî — Hewlêr, Silêmanî, Dihok, Dûkan, Helebce û Kerkûk. Otêlekê bigere, bihayan bide ber hev û rasterast bi otêlê re rezerve bike.",
  },
];

/* ---------------- "Why book with us" trust section ---------------- */

export const TRUST_EYEBROW: L = {
  ckb: "متمانە",
  en: "Trusted",
  ar: "موثوق",
  kmr: "Bawer",
};

export const TRUST_HEADING: L = {
  ckb: "بۆچی لە ئێمەوە حجز بکەیت؟",
  en: "Why book with us?",
  ar: "لماذا تحجز معنا؟",
  kmr: "Çima bi me re rezerve bikî?",
};

export interface TrustItem {
  /** icon key mapped to a lucide icon in the component */
  icon: "shield-check" | "wallet" | "headset" | "zap";
  title: L;
  desc: L;
}

export const TRUST_ITEMS: TrustItem[] = [
  {
    icon: "shield-check",
    title: {
      ckb: "هۆتێلی پشتڕاستکراو",
      en: "Verified hotels",
      ar: "فنادق موثوقة",
      kmr: "Otêlên piştrastkirî",
    },
    desc: {
      ckb: "هەموو هۆتێلەکان پشکنراون و زانیارییەکانیان نوێ و دروستن.",
      en: "Every hotel is checked, with accurate and up-to-date details.",
      ar: "يتم التحقق من كل فندق بمعلومات دقيقة ومحدثة.",
      kmr: "Her otêl tê kontrolkirin, bi agahiyên rast û nû.",
    },
  },
  {
    icon: "wallet",
    title: {
      ckb: "پارەدان ڕاستەوخۆ بۆ هۆتێل",
      en: "Pay the hotel directly",
      ar: "ادفع للفندق مباشرة",
      kmr: "Rasterast ji otêlê re bide",
    },
    desc: {
      ckb: "پارەکەت ڕاستەوخۆ دەچێتە هۆتێل — بەبێ کرێی زیادە.",
      en: "Your money goes straight to the hotel — with no extra fees.",
      ar: "أموالك تذهب مباشرة إلى الفندق — بدون رسوم إضافية.",
      kmr: "Drav rasterast diçe otêlê — bêyî xercên zêde.",
    },
  },
  {
    icon: "headset",
    title: {
      ckb: "پشتگیری خۆماڵی",
      en: "Local support",
      ar: "دعم محلي",
      kmr: "Piştgiriya herêmî",
    },
    desc: {
      ckb: "پەیوەندی ڕاستەوخۆ لەگەڵ هۆتێل لە ڕێگەی واتساپەوە.",
      en: "Reach the hotel directly over WhatsApp.",
      ar: "تواصل مع الفندق مباشرة عبر واتساب.",
      kmr: "Rasterast bi rêya WhatsApp bi otêlê re têkilî dayne.",
    },
  },
  {
    icon: "zap",
    title: {
      ckb: "حجزی خێرا و ئاسان",
      en: "Fast, easy booking",
      ar: "حجز سريع وسهل",
      kmr: "Rezervasyona bilez û hêsan",
    },
    desc: {
      ckb: "لە چەند خولەکێکدا ژوورەکەت حجز بکە.",
      en: "Book your room in just a few minutes.",
      ar: "احجز غرفتك في دقائق معدودة.",
      kmr: "Odeya xwe di çend deqîqeyan de rezerve bike.",
    },
  },
];

/* ---------------- Frequently asked questions ---------------- */

export const FAQ_EYEBROW: L = {
  ckb: "یارمەتی",
  en: "Help",
  ar: "مساعدة",
  kmr: "Alîkarî",
};

export const FAQ_HEADING: L = {
  ckb: "پرسیارە باوەکان",
  en: "Frequently asked questions",
  ar: "الأسئلة الشائعة",
  kmr: "Pirsên pir têne pirsîn",
};

export interface FaqItem {
  q: L;
  a: L;
}

export const FAQ_ITEMS: FaqItem[] = [
  {
    q: {
      ckb: "چۆن ژوور حجز بکەم؟",
      en: "How do I book a room?",
      ar: "كيف أحجز غرفة؟",
      kmr: "Ez çawa odeyekê rezerve dikim?",
    },
    a: {
      ckb: "هۆتێلەکە هەڵبژێرە، ژوور هەڵبژێرە و «حیجزکردن» بکە. پاشان ناو و ژمارەی تەلەفۆنت بنووسە.",
      en: "Pick a hotel, choose a room and tap 'Book'. Then enter your name and phone number.",
      ar: "اختر فندقًا، اختر غرفة واضغط «حجز»، ثم أدخل اسمك ورقم هاتفك.",
      kmr: "Otêlê hilbijêre, odeyê hilbijêre û 'Rezerve' bike. Paşê nav û hejmara telefonê binivîse.",
    },
  },
  {
    q: {
      ckb: "چۆن پارە دەدەم؟",
      en: "How do I pay?",
      ar: "كيف أدفع؟",
      kmr: "Ez çawa didim?",
    },
    a: {
      ckb: "دەتوانیت لە هۆتێلەکە پارە بدەیت، یان ئەگەر هۆتێلەکە بەردەستی کرد، بە کارت/FIB ڕاستەوخۆ بۆ هۆتێل.",
      en: "You can pay at the hotel, or — where the hotel offers it — online by card/FIB directly to the hotel.",
      ar: "يمكنك الدفع في الفندق، أو عبر البطاقة/FIB مباشرة إلى الفندق حيث يتوفر ذلك.",
      kmr: "Tu dikarî li otêlê bidî, an jî bi kart/FIB rasterast ji otêlê re.",
    },
  },
  {
    q: {
      ckb: "ئایا کرێی زیادە هەیە؟",
      en: "Are there any extra fees?",
      ar: "هل توجد رسوم إضافية؟",
      kmr: "Xercên zêde hene?",
    },
    a: {
      ckb: "نەخێر. نرخی پیشاندراو هەمان نرخی هۆتێلە و پارەکە ڕاستەوخۆ دەچێتە هۆتێل.",
      en: "No. The price shown is the hotel's own price, and the money goes straight to the hotel.",
      ar: "لا. السعر المعروض هو سعر الفندق نفسه، والمال يذهب مباشرة إلى الفندق.",
      kmr: "Na. Bihayê ku tê nîşandan bihayê otêlê ye, drav rasterast diçe otêlê.",
    },
  },
  {
    q: {
      ckb: "ئایا دەتوانم پەیوەندی بە هۆتێلەوە بکەم؟",
      en: "Can I contact the hotel?",
      ar: "هل يمكنني التواصل مع الفندق؟",
      kmr: "Ez dikarim bi otêlê re têkilî daynim?",
    },
    a: {
      ckb: "بەڵێ. هەر لاپەڕەیەکی هۆتێل ژمارەی تەلەفۆن و دوگمەی واتساپی هەیە بۆ پەیوەندی ڕاستەوخۆ.",
      en: "Yes. Each hotel page has a phone number and a WhatsApp button for direct contact.",
      ar: "نعم. تحتوي صفحة كل فندق على رقم هاتف وزر واتساب للتواصل المباشر.",
      kmr: "Erê. Rûpela her otêlê hejmara telefonê û bişkoka WhatsApp heye.",
    },
  },
  {
    q: {
      ckb: "ئایا نرخ و ژوورە بەردەستەکان وردن؟",
      en: "Are prices and availability accurate?",
      ar: "هل الأسعار والتوفر دقيقة؟",
      kmr: "Biha û hebûna odeyan rast in?",
    },
    a: {
      ckb: "بەڵێ. هۆتێلەکان زانیارییەکانیان نوێ دەکەنەوە، و ژوورە بەردەستەکان بە شێوەی زیندوو پیشان دەدرێن.",
      en: "Yes. Hotels keep their details updated, and room availability is shown live.",
      ar: "نعم. تحدّث الفنادق بياناتها، ويظهر توفر الغرف بشكل مباشر.",
      kmr: "Erê. Otêl agahiyên xwe nû dikin, hebûna odeyan zindî tê nîşandan.",
    },
  },
];
