import Link from "next/link";
import Image from "next/image";
import { BookOpen, ArrowLeft } from "lucide-react";
import { getPublishedPosts } from "@/lib/posts-server";
import { mediaSrc, isRawSrc } from "@/lib/types";

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
    <section className="mx-auto max-w-6xl px-6 py-14">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-xl font-bold">
          <BookOpen className="size-5 text-gold" />
          کوردستان بناسە · Explore Kurdistan
        </h2>
        <Link
          href="/blog"
          className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
        >
          هەمووی ببینە
          <ArrowLeft className="size-4 rtl:rotate-180" />
        </Link>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((p) => {
          const cover = p.coverImage ? mediaSrc(p.coverImage) : "";
          return (
            <Link
              key={p.id}
              href={`/blog/${p.slug}`}
              className="group overflow-hidden rounded-2xl border bg-card shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
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
                </div>
              )}
              <div className="p-4">
                <h3 className="line-clamp-2 font-bold group-hover:text-primary">
                  {p.title}
                </h3>
                {p.excerpt && (
                  <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">
                    {p.excerpt}
                  </p>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
