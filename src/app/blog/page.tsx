import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Clock, CalendarDays, ArrowLeft, Sparkles } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getPublishedPosts } from "@/lib/posts-server";
import { postDir, readingMinutes, postDate } from "@/lib/posts";
import { mediaSrc, isRawSrc, type Lang } from "@/lib/types";
import { alternatesFor } from "@/lib/hreflang";

const SITE = "https://hotelskurdistan.com";

// refresh hourly so newly published posts appear without a redeploy
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "گۆڤاری گەشتیاری کوردستان · Kurdistan Travel Journal",
  description:
    "Travel guides and tips for Kurdistan — Erbil, Sulaymaniyah, Duhok, Dukan and more. ڕێنمایی گەشت و هۆتێل لە کوردستان.",
  alternates: alternatesFor("/blog"),
};

/** The date + reading-time line that sits under every headline. */
function Meta({
  createdAt,
  content,
  lang,
  className = "",
}: {
  createdAt?: number;
  content: string;
  lang: Lang;
  className?: string;
}) {
  const date = postDate(createdAt, lang);
  return (
    <p
      className={`flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground ${className}`}
    >
      {date && (
        <span className="inline-flex items-center gap-1">
          <CalendarDays className="size-3.5" />
          {date}
        </span>
      )}
      <span className="inline-flex items-center gap-1">
        <Clock className="size-3.5" />
        {readingMinutes(content)} min
      </span>
    </p>
  );
}

export default async function BlogIndexPage() {
  const posts = await getPublishedPosts();
  // the newest leads the page; the rest sit in the grid below it
  const [lead, ...rest] = posts;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "@id": `${SITE}/blog#blog`,
    name: "Kurdistan Hotels Blog",
    url: `${SITE}/blog`,
    blogPost: posts.slice(0, 20).map((p) => ({
      "@type": "BlogPosting",
      headline: p.title,
      url: `${SITE}/blog/${p.slug}`,
      ...(p.createdAt
        ? { datePublished: new Date(p.createdAt).toISOString() }
        : {}),
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <SiteHeader />
      <main className="relative mx-auto max-w-6xl px-6 pb-16">
        {/* the same soft gold glow the hotels section opens with, so the blog
            reads as part of the site rather than a page bolted on beside it */}
        {/* max-w keeps the blur inside a 375px phone — at a fixed 26rem it
            pushed the page 21px wider than the viewport */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-6 -z-10 h-56 w-[26rem] max-w-full -translate-x-1/2 rounded-full bg-gold/20 blur-3xl"
        />

        <header className="py-12 text-center sm:py-16">
          <p className="text-xs font-bold tracking-[0.2em] text-gold uppercase">
            Kurdistan Hotels
          </p>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight sm:text-5xl">
            <span className="text-gradient-gold">گۆڤاری گەشتیاری</span>
          </h1>
          {/* a gold rule under the title — the mark of a masthead rather than
              just another page heading */}
          <span
            aria-hidden
            className="mx-auto mt-5 block h-px w-24 bg-gradient-to-r from-transparent via-gold to-transparent"
          />
          <p className="mx-auto mt-5 max-w-xl leading-relaxed text-muted-foreground">
            ڕێنمایی گەشت، شوێنی سەیرکردن و هۆتێل لە کوردستان — Travel guides for
            Erbil, Sulaymaniyah, Duhok and Dukan.
          </p>
          {posts.length > 0 && (
            <p className="mt-4 text-xs font-semibold tracking-wide text-muted-foreground">
              {posts.length} بابەت
            </p>
          )}
        </header>

        {posts.length === 0 ? (
          <p className="py-20 text-center text-muted-foreground">
            هێشتا هیچ بابەتێک بڵاو نەکراوەتەوە.
          </p>
        ) : (
          <>
            {/* lead story — wide, so the page opens on something rather than
                dropping straight into a grid of equal tiles */}
            {lead && (
              <Link
                href={`/blog/${lead.slug}`}
                dir={postDir(lead.lang)}
                className="journal-card group grid overflow-hidden rounded-3xl border bg-card shadow-sm hover:-translate-y-1 hover:shadow-2xl md:grid-cols-2"
              >
                {lead.coverImage && (
                  <div className="relative aspect-16/10 overflow-hidden bg-muted md:aspect-auto md:h-full">
                    <Image
                      src={mediaSrc(lead.coverImage)}
                      alt={lead.title}
                      fill
                      priority
                      sizes="(min-width: 768px) 50vw, 100vw"
                      unoptimized={isRawSrc(mediaSrc(lead.coverImage))}
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    {/* a whisper of gold over the photo, so the cover belongs
                        to the page rather than sitting on top of it */}
                    <div
                      aria-hidden
                      className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent"
                    />
                  </div>
                )}
                <div className="flex flex-col justify-center gap-3 p-6 sm:p-8">
                  <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-gold/15 px-3 py-1 text-xs font-bold text-amber-700 ring-1 ring-gold/25 dark:text-amber-400">
                    <Sparkles className="size-3.5" />
                    نوێترین
                  </span>
                  <h2 className="text-2xl font-extrabold leading-snug transition-colors group-hover:text-primary sm:text-3xl">
                    {lead.title}
                  </h2>
                  {lead.excerpt && (
                    <p className="line-clamp-3 leading-relaxed text-muted-foreground">
                      {lead.excerpt}
                    </p>
                  )}
                  <Meta
                    createdAt={lead.createdAt}
                    content={lead.content}
                    lang={lead.lang}
                  />
                  <span className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-primary">
                    بیخوێنەوە
                    <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1 rtl:rotate-180 rtl:group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            )}

            {rest.length > 0 && (
              <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {rest.map((p) => (
                  <Link
                    key={p.id}
                    href={`/blog/${p.slug}`}
                    dir={postDir(p.lang)}
                    className="journal-card group flex flex-col overflow-hidden rounded-2xl border bg-card shadow-sm hover:-translate-y-1.5 hover:shadow-xl"
                  >
                    {p.coverImage && (
                      <div className="relative aspect-16/10 overflow-hidden bg-muted">
                        <Image
                          src={mediaSrc(p.coverImage)}
                          alt={p.title}
                          fill
                          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                          unoptimized={isRawSrc(mediaSrc(p.coverImage))}
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div
                          aria-hidden
                          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"
                        />
                      </div>
                    )}
                    <div className="flex flex-1 flex-col gap-2 p-5">
                      <h2 className="text-lg font-bold leading-snug transition-colors group-hover:text-primary">
                        {p.title}
                      </h2>
                      {p.excerpt && (
                        <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                          {p.excerpt}
                        </p>
                      )}
                      <Meta
                        createdAt={p.createdAt}
                        content={p.content}
                        lang={p.lang}
                        className="mt-auto pt-2"
                      />
                      <span className="inline-flex items-center gap-1 pt-1 text-sm font-semibold text-primary opacity-0 transition-opacity group-hover:opacity-100">
                        بیخوێنەوە
                        <ArrowLeft className="size-3.5 rtl:rotate-180" />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
