import Link from "next/link";
import { Star, Quote } from "lucide-react";
import type { FeaturedReview } from "@/lib/hotels-server";
import type { Hotel } from "@/lib/types";
import { REVIEWS_STRIP_EYEBROW, REVIEWS_STRIP_HEADING } from "@/lib/site-content";

/**
 * What guests said, on the homepage. A server component: the words ship in the
 * HTML with no client JS behind them, so it adds trust without adding weight.
 * Renders nothing until there are real approved reviews to show.
 */
export function ReviewsStrip({
  reviews,
  hotels,
}: {
  reviews: FeaturedReview[];
  hotels: Hotel[];
}) {
  if (reviews.length === 0) return null;
  const nameOf = (id: string) => hotels.find((h) => h.id === id)?.name ?? "";

  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <div className="mb-8 text-center">
        <p className="text-sm font-semibold text-gold">
          {REVIEWS_STRIP_EYEBROW.ckb} · {REVIEWS_STRIP_EYEBROW.en}
        </p>
        <h2 className="mt-1.5 text-2xl font-extrabold sm:text-3xl">
          {REVIEWS_STRIP_HEADING.ckb}
        </h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {reviews.map((r, i) => {
          const hotel = nameOf(r.hotelId);
          return (
            <figure
              key={`${r.hotelId}-${i}`}
              className="relative flex h-full flex-col rounded-2xl border bg-card p-5 shadow-sm"
            >
              <Quote
                aria-hidden
                className="absolute end-4 top-4 size-8 text-gold/15"
              />
              <div className="flex gap-0.5" aria-label={`${r.rating} / 5`}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star
                    key={n}
                    className={
                      n <= Math.round(r.rating)
                        ? "size-4 fill-gold text-gold"
                        : "size-4 text-muted-foreground/25"
                    }
                  />
                ))}
              </div>
              <blockquote className="relative mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                {r.comment}
              </blockquote>
              <figcaption className="mt-4 border-t pt-3 text-sm">
                <span className="font-semibold">{r.name}</span>
                {hotel && (
                  <>
                    <span className="text-muted-foreground"> · </span>
                    <Link
                      href={`/hotels/${r.hotelId}`}
                      className="text-muted-foreground transition-colors hover:text-primary hover:underline"
                    >
                      {hotel}
                    </Link>
                  </>
                )}
              </figcaption>
            </figure>
          );
        })}
      </div>
    </section>
  );
}
