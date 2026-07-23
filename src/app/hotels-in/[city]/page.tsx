import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getPublicHotels } from "@/lib/hotels-server";
import { CityPageBody, type CityIntro } from "./city-page-body";

const SITE = "https://hotelskurdistan.com";

// Rebuild hourly so newly added hotels show up on the city pages.
export const revalidate = 3600;

/** Per-city SEO data. `city` matches the value stored on hotels; `aka` are the
    common alternate spellings people actually type into Google. */
const CITY_SEO: Record<
  string,
  {
    city: string;
    ckb: string;
    en: string;
    ar: string;
    aka: string[];
    intro: CityIntro;
  }
> = {
  erbil: {
    city: "Erbil",
    ckb: "هەولێر",
    en: "Erbil",
    ar: "أربيل",
    aka: ["Hawler", "Hewler", "Arbil"],
    intro: {
      ckb: "هەولێر پایتەختی هەرێمی کوردستانە و یەکێکە لە کۆنترین شارە ئاوەدانەکانی جیهان، بە قەڵا مێژووییەکەیەوە کە لە لیستی یونیسکۆدایە. هۆتێلەکانی هەولێر لە نزیک قەڵا، بازاڕی قەیسەری و ناوەندی شار هەمەچەشنن — لە هۆتێلی پێنج ئەستێرە تا نرخی گونجاو بۆ کار و گەشت.",
      en: "Erbil, the capital of the Kurdistan Region, is one of the oldest continuously inhabited cities on earth, crowned by its UNESCO-listed Citadel. Hotels in Erbil range from five-star towers to great-value stays, most within reach of the Citadel, the Qaysari Bazaar and the city centre.",
      ar: "أربيل عاصمة إقليم كردستان وواحدة من أقدم المدن المأهولة في العالم، تتوّجها قلعتها المدرجة في اليونسكو. فنادق أربيل متنوّعة — من الفخمة إلى الاقتصادية — وأغلبها قريب من القلعة وقيصرية ومركز المدينة.",
    },
  },
  sulaymaniyah: {
    city: "Sulaymaniyah",
    ckb: "سلێمانی",
    en: "Sulaymaniyah",
    ar: "السليمانية",
    aka: ["Slemani", "Sulaimani", "Suli"],
    intro: {
      ckb: "سلێمانی ناوەندی ڕۆشنبیری و هونەری کوردستانە، بە بازاڕە جۆشوخرۆشەکان و دیمەنی شاخاوییەوە. هۆتێلەکانی سلێمانی لە نزیک ناوەندی شار، پارک و بازاڕەکانن و گونجاون بۆ گەشتیاری و کار.",
      en: "Sulaymaniyah is the cultural and artistic heart of Kurdistan, known for its lively bazaars and surrounding mountains. Hotels in Sulaymaniyah sit close to the city centre, parks and markets — a comfortable base for both tourism and business.",
      ar: "السليمانية قلب كردستان الثقافي والفني، تشتهر بأسواقها النابضة وجبالها المحيطة. فنادق السليمانية قريبة من مركز المدينة والحدائق والأسواق — قاعدة مريحة للسياحة والعمل معاً.",
    },
  },
  duhok: {
    city: "Duhok",
    ckb: "دهۆک",
    en: "Duhok",
    ar: "دهوك",
    aka: ["Dohuk", "Dahuk"],
    intro: {
      ckb: "دهۆک شارێکی جوانی نێوان شاخەکانە لە باکووری کوردستان، نزیک لە بەنداوی دهۆک و دیمەنی سروشتی سەرنجڕاکێش. هۆتێلەکانی دهۆک شوێنێکی باشن بۆ گەشتیارانی سروشت و بنەماڵەکان.",
      en: "Duhok is a scenic city nestled between mountains in northern Kurdistan, close to the Duhok Dam and striking natural landscapes. Hotels in Duhok make a great base for nature travellers and families.",
      ar: "دهوك مدينة جميلة بين الجبال في شمال كردستان، قرب سد دهوك والمناظر الطبيعية الخلابة. فنادق دهوك قاعدة رائعة لمحبّي الطبيعة والعائلات.",
    },
  },
  halabja: {
    city: "Halabja",
    ckb: "هەڵەبجە",
    en: "Halabja",
    ar: "حلبجة",
    aka: [],
    intro: {
      ckb: "هەڵەبجە شارێکی مێژوویی گرنگە لە ڕۆژهەڵاتی کوردستان، دەوردراو بە شاخ و سروشتی جوان. مانەوە لە هۆتێلەکانی هەڵەبجە دەرگایەکە بۆ ناسینی مێژوو و کولتووری ناوچەکە.",
      en: "Halabja is a historically significant town in eastern Kurdistan, surrounded by mountains and beautiful countryside. Staying in Halabja's hotels is a gateway to the region's history and culture.",
      ar: "حلبجة مدينة تاريخية مهمة في شرق كردستان، محاطة بالجبال والريف الجميل. الإقامة في فنادق حلبجة بوابة لتاريخ المنطقة وثقافتها.",
    },
  },
  kirkuk: {
    city: "Kirkuk",
    ckb: "کەرکوک",
    en: "Kirkuk",
    ar: "كركوك",
    aka: ["Kerkuk"],
    intro: {
      ckb: "کەرکووک شارێکی مێژوویی و فرەپێکهاتەیە و ناوەندێکی گرنگی بازرگانییە. هۆتێلەکانی کەرکووک لە نزیک ناوەندی شار و شوێنە بازرگانییەکانن و گونجاون بۆ کار و گەشت.",
      en: "Kirkuk is a historic, diverse city and an important commercial hub. Hotels in Kirkuk are conveniently located near the city centre and business districts — well suited to work and travel.",
      ar: "كركوك مدينة تاريخية متنوّعة ومركز تجاري مهم. فنادق كركوك قريبة من مركز المدينة والمناطق التجارية — مناسبة للعمل والسفر.",
    },
  },
  dukan: {
    city: "Dukan",
    ckb: "قەزای دووکان",
    en: "Dukan",
    ar: "دوكان",
    aka: ["Dokan"],
    intro: {
      ckb: "دووکان یەکێکە لە جوانترین شوێنە گەشتیارییەکانی کوردستان، بە دەریاچەی دووکان و دیمەنی شاخاوییەوە ناسراوە. هۆتێل و شوێنەکانی مانەوەی دووکان ئارامی و پشوودانێکی جوان لەتەنیشت ئاو پێشکەش دەکەن.",
      en: "Dukan is one of Kurdistan's most beautiful getaways, famous for Lake Dukan and its mountain scenery. Dukan's hotels and stays offer a relaxing lakeside escape away from the city.",
      ar: "دوكان من أجمل وجهات كردستان، تشتهر ببحيرة دوكان ومناظرها الجبلية. فنادق دوكان تمنحك استراحة هادئة على ضفاف البحيرة بعيداً عن المدينة.",
    },
  },
};

export function generateStaticParams() {
  return Object.keys(CITY_SEO).map((city) => ({ city }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ city: string }>;
}): Promise<Metadata> {
  const { city } = await params;
  const seo = CITY_SEO[city.toLowerCase()];
  if (!seo) return { title: "Hotels in Kurdistan" };

  const aka = seo.aka.length ? ` (${seo.aka.join(" / ")})` : "";
  const title = `Hotels in ${seo.en}${aka} · فنادق ${seo.ar} · هۆتێلەکانی ${seo.ckb}`;
  const description = `Find and book the best hotels in ${seo.en}${aka}, Kurdistan. فنادق ${seo.ar}: احجز أفضل الفنادق بأسعار واضحة. باشترین هۆتێلەکانی ${seo.ckb}.`;

  return {
    title,
    description,
    alternates: { canonical: `/hotels-in/${city.toLowerCase()}` },
    keywords: [
      `${seo.en} hotels`,
      `hotels in ${seo.en}`,
      `${seo.en} hotel`,
      `hotels ${seo.en}`,
      ...seo.aka.flatMap((a) => [`${a} hotels`, `hotel ${a}`]),
      `هۆتێلی ${seo.ckb}`,
      `هۆتێلەکانی ${seo.ckb}`,
      `فنادق ${seo.ar}`,
    ],
    openGraph: {
      title,
      description,
      url: `${SITE}/hotels-in/${city.toLowerCase()}`,
      type: "website",
    },
  };
}

export default async function CityHotelsPage({
  params,
}: {
  params: Promise<{ city: string }>;
}) {
  const { city } = await params;
  const slug = city.toLowerCase();
  const seo = CITY_SEO[slug];
  if (!seo) notFound();

  const all = await getPublicHotels();
  const cityHotels = all.filter(
    (h) => h.city?.toLowerCase() === seo.city.toLowerCase(),
  );

  // other cities, for the "hotels in other cities" links (localized in the body)
  const others = Object.entries(CITY_SEO)
    .filter(([s]) => s !== slug)
    .map(([s, o]) => ({ slug: s, cityValue: o.city }));

  // schema.org CollectionPage listing this city's hotels for richer results
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${SITE}/hotels-in/${slug}#page`,
    name: `Hotels in ${seo.en}`,
    about: `Hotels in ${seo.en}, Kurdistan`,
    url: `${SITE}/hotels-in/${slug}`,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: cityHotels.length,
      itemListElement: cityHotels.slice(0, 30).map((h, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `${SITE}/hotels/${h.id}`,
        name: h.name,
      })),
    },
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE },
      {
        "@type": "ListItem",
        position: 2,
        name: `Hotels in ${seo.en}`,
        item: `${SITE}/hotels-in/${slug}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbLd).replace(/</g, "\\u003c"),
        }}
      />
      <SiteHeader />
      <CityPageBody
        slug={slug}
        cityValue={seo.city}
        intro={seo.intro}
        others={others}
        initialHotels={cityHotels}
      />
      <SiteFooter />
    </>
  );
}
