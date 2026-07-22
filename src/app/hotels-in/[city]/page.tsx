import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getPublicHotels } from "@/lib/hotels-server";
import { CityHotelList } from "./city-hotel-list";

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
    intro: { ckb: string; en: string };
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
  const title = `Hotels in ${seo.en}${aka} — هۆتێلەکانی ${seo.ckb}`;
  const description = `Find and book the best hotels in ${seo.en}${aka}, Kurdistan. Clear prices, real photos and fast booking on Kurdistan Hotels. باشترین هۆتێلەکانی ${seo.ckb}.`;

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

  const aka = seo.aka.length ? ` · ${seo.aka.join(" / ")}` : "";

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
      <main className="mx-auto max-w-7xl px-6 py-12">
        <nav
          aria-label="Breadcrumb"
          className="mb-5 flex items-center gap-1.5 text-sm text-muted-foreground"
        >
          <Link href="/" className="hover:text-primary">
            سەرەتا
          </Link>
          <span aria-hidden>›</span>
          <span className="text-foreground">هۆتێلی {seo.ckb}</span>
        </nav>
        {/* Server-rendered heading + intro so the key terms are in the crawled
            HTML in every language, regardless of the visitor's chosen one. */}
        <header className="mb-8 border-b pb-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-gold">
            {seo.ckb}
          </p>
          <h1 className="mt-1 text-3xl font-extrabold sm:text-4xl">
            هۆتێلەکانی {seo.ckb}
            <span className="block text-xl font-bold text-muted-foreground sm:text-2xl">
              Hotels in {seo.en}
              {aka}
            </span>
          </h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            باشترین هۆتێلەکانی {seo.ckb} لە کوردستان — نرخی ڕوون، وێنەی
            ڕاستەقینە، و حجزی خێرا. Book the best hotels in {seo.en}
            {aka}, Kurdistan Region of Iraq.
          </p>
        </header>

        <CityHotelList city={seo.city} initialHotels={cityHotels} />

        {/* unique per-city content — real, distinct text so each page ranks on
            its own rather than looking thin/duplicated to search engines */}
        <section className="mt-14 border-t pt-8">
          <h2 className="mb-3 text-xl font-bold">
            دەربارەی مانەوە لە {seo.ckb} — About staying in {seo.en}
          </h2>
          <p className="max-w-3xl leading-relaxed text-muted-foreground">
            {seo.intro.ckb}
          </p>
          <p className="mt-3 max-w-3xl leading-relaxed text-muted-foreground">
            {seo.intro.en}
          </p>
        </section>

        {/* internal links to the other city pages — strengthens crawling and
            lets visitors jump between cities */}
        <nav className="mt-14 border-t pt-8">
          <h2 className="mb-4 text-lg font-bold">
            هۆتێل لە شارەکانی تر — Hotels in other cities
          </h2>
          <div className="flex flex-wrap gap-2">
            {Object.entries(CITY_SEO)
              .filter(([s]) => s !== slug)
              .map(([s, o]) => (
                <Link
                  key={s}
                  href={`/hotels-in/${s}`}
                  className="inline-flex items-center gap-1.5 rounded-full border bg-card px-3.5 py-1.5 text-sm transition-colors hover:border-gold hover:text-gold"
                >
                  هۆتێلی {o.ckb} · {o.en}
                </Link>
              ))}
          </div>
        </nav>
      </main>
      <SiteFooter />
    </>
  );
}
