import type { Metadata } from "next";
import { getHotelById, getApprovedReviews } from "@/lib/hotels-server";
import {
  effectivePrice,
  mapsUrl,
  reviewSummary,
  type Hotel,
} from "@/lib/types";
import { HotelDetailClient } from "./hotel-detail-client";

const SITE = "https://hotelskurdistan.com";
const DEFAULT_OG =
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=630&fit=crop&q=85";

/** A crawler-friendly absolute image URL for OG/structured data.
    base64 data URIs are too large for social crawlers, so fall back. */
function ogImage(url: string | undefined): string {
  if (!url || url.startsWith("data:")) return DEFAULT_OG;
  return url;
}

/** A ~160-char description: the hotel's own text if it has one, else a
    generated line with city + starting price. */
function metaDescription(h: Hotel): string {
  const own = h.description?.trim().replace(/\s+/g, " ");
  if (own) return own.slice(0, 160);
  const price = effectivePrice(h).toLocaleString("en-US");
  const feats = (h.features ?? []).slice(0, 4).join(", ");
  return `Book ${h.name} in ${h.city}, Kurdistan — rooms from ${price} IQD.${
    feats ? ` ${feats}.` : ""
  }`.slice(0, 200);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const hotel = await getHotelById(id);

  if (!hotel) {
    return {
      title: "Hotel",
      description:
        "Discover and book hotels across Kurdistan on Kurdistan Hotels.",
    };
  }

  const title = `${hotel.name} — ${hotel.city}`;
  const description = metaDescription(hotel);
  const image = ogImage(hotel.image);
  const url = `${SITE}/hotels/${id}`;

  return {
    title,
    description,
    alternates: { canonical: `/hotels/${id}` },
    // hidden hotels stay reachable by link but out of search results
    ...(hotel.hidden ? { robots: { index: false, follow: false } } : {}),
    openGraph: {
      title: `${hotel.name} — Kurdistan Hotels`,
      description,
      url,
      type: "website",
      images: [{ url: image, width: 1200, height: 630, alt: hotel.name }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${hotel.name} — Kurdistan Hotels`,
      description,
      images: [image],
    },
  };
}

export default async function HotelPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const hotel = await getHotelById(id);

  // Approved guest reviews feed the aggregateRating so Google can show ⭐ stars
  // in search results (rich snippets). Only included when reviews exist —
  // an empty aggregateRating is invalid and Google would flag it.
  const reviews = hotel ? await getApprovedReviews(id) : [];
  const { average, count } = reviewSummary(reviews);

  // schema.org Hotel — helps Google show a richer result for each hotel.
  const jsonLd = hotel
    ? {
        "@context": "https://schema.org",
        "@type": "Hotel",
        "@id": `${SITE}/hotels/${id}#hotel`,
        name: hotel.name,
        description: metaDescription(hotel),
        image: ogImage(hotel.image),
        url: `${SITE}/hotels/${id}`,
        priceRange: `IQD ${effectivePrice(hotel).toLocaleString("en-US")}`,
        ...(hotel.phone ? { telephone: hotel.phone } : {}),
        hasMap: mapsUrl(hotel),
        address: {
          "@type": "PostalAddress",
          ...(hotel.address ? { streetAddress: hotel.address } : {}),
          addressLocality: hotel.city,
          addressRegion: "Kurdistan Region",
          addressCountry: "IQ",
        },
        ...(count > 0
          ? {
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: average,
                reviewCount: count,
                bestRating: 5,
                worstRating: 1,
              },
              review: reviews.slice(0, 5).map((r) => ({
                "@type": "Review",
                author: { "@type": "Person", name: r.name },
                reviewRating: {
                  "@type": "Rating",
                  ratingValue: r.rating,
                  bestRating: 5,
                  worstRating: 1,
                },
                ...(r.comment ? { reviewBody: r.comment } : {}),
                ...(r.createdAt
                  ? {
                      datePublished: new Date(r.createdAt)
                        .toISOString()
                        .slice(0, 10),
                    }
                  : {}),
              })),
            }
          : {}),
      }
    : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
          }}
        />
      )}
      <HotelDetailClient id={id} initialHotel={hotel} />
    </>
  );
}
