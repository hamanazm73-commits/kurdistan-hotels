import Link from "next/link";
import Image from "next/image";
import { BookOpen, ArrowLeft, Clock } from "lucide-react";
import { getPublishedPosts } from "@/lib/posts-server";
import { mediaSrc, isRawSrc } from "@/lib/types";
import { readingMinutes } from "@/lib/posts";

/**
 * The three newest posts, on the home page.
 *
 * The blog was reachable only from the footer, which is where search engines
 * put pages nobody links to and where readers never look. These articles are
 * the site's answer to searches like "hotels in Erbil" that aren't a hotel
 * name, so burying them wastes the one thing that brings people who don't
 * already know us.
 *
 * Server component: the posts are already fetched for the sitemap, and this
 * way the links are in the HTML rather than appearing after hydration.
 */
export async function BlogTeaser() {
  const posts = (await getPublishedPosts()).slice(0, 3);
  if (posts.length === 0) return null;

  return (
    <section className="relative mx-auto max-w-6xl px-6 py-14">
      {/* the same soft gold wash the journal page opens with */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-4 -z-10 h-40 w-80 max-w-full -translate-x-1/2 rounded-full bg-gold/10 blur-3xl"
      />
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold tracking-[0.18em] text-gold uppercase">
            Journal
          </p>
          <h2 className="mt-1.5 flex items-center gap-2 text-xl font-bold sm:text-2xl">
            <BookOpen className="size-5 text-gold" />
            کوردستان بناسە · Explore Kurdistan
          </h2>
        </div>
        <Link
          href="/blog"
          className="group inline-flex items-center gap-1.5 rounded-full border border-gold/30 px-4 py-1.5 text-sm font-semibold text-primary transition hover:border-gold hover:bg-gold/10"
        >
          هەمووی ببینە
          <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5 rtl:rotate-180 rtl:group-hover:translate-x-0.5" />
        </Link>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((p) => {
          const cover = p.coverImage ? mediaSrc(p.coverImage) : "";
          return (
            <Link
              key={p.id}
              href={`/blog/${p.slug}`}
              className="journal-card group overflow-hidden rounded-2xl border bg-card shadow-sm hover:-translate-y-1.5 hover:shadow-xl"
            >
              {cover && (
                <div className="relative aspect-[16/9] overflow-hidden bg-muted">
                  <Image
                    src={cover}
                    alt={p.title}
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    unoptimized={isRawSrc(cover)}
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"
                  />
                </div>
              )}
              <div className="p-4">
                <h3 className="line-clamp-2 font-bold leading-snug group-hover:text-primary">
                  {p.title}
                </h3>
                {p.excerpt && (
                  <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                    {p.excerpt}
                  </p>
                )}
                <p className="mt-2.5 inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="size-3.5" />
                  {readingMinutes(p.content)} min
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
