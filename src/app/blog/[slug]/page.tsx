import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, Clock } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PostContent } from "@/components/post-content";
import { ShareButton } from "@/components/share-button";
import { getPostBySlug, getPublishedPosts } from "@/lib/posts-server";
import { postDir, readingMinutes, postDate } from "@/lib/posts";
import { mediaSrc, isRawSrc } from "@/lib/types";
import { alternatesFor } from "@/lib/hreflang";

const SITE = "https://hotelskurdistan.com";

export const revalidate = 3600;

export async function generateStaticParams() {
  const posts = await getPublishedPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "Blog" };

  const description =
    post.excerpt?.trim() || post.content.replace(/\s+/g, " ").slice(0, 160);

  return {
    title: post.title,
    description,
    alternates: alternatesFor(`/blog/${post.slug}`),
    openGraph: {
      title: post.title,
      description,
      url: `${SITE}/blog/${post.slug}`,
      type: "article",
      ...(post.coverImage && !post.coverImage.startsWith("data:")
        ? { images: [{ url: post.coverImage }] }
        : {}),
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const dir = postDir(post.lang);
  const date = postDate(post.createdAt, post.lang);
  const cover = post.coverImage ? mediaSrc(post.coverImage) : "";

  // Something to read next, so the page doesn't dead-end. Same language where
  // possible — sending a Kurdish reader to an English guide helps nobody.
  const all = await getPublishedPosts();
  const others = all.filter((p) => p.slug !== post.slug);
  const sameLang = others.filter((p) => p.lang === post.lang);
  const more = (sameLang.length >= 2 ? sameLang : others).slice(0, 3);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${SITE}/blog/${post.slug}#post`,
    headline: post.title,
    description: post.excerpt || undefined,
    inLanguage: post.lang,
    url: `${SITE}/blog/${post.slug}`,
    ...(post.coverImage && !post.coverImage.startsWith("data:")
      ? { image: post.coverImage }
      : {}),
    ...(post.createdAt
      ? { datePublished: new Date(post.createdAt).toISOString() }
      : {}),
    ...(post.updatedAt
      ? { dateModified: new Date(post.updatedAt).toISOString() }
      : {}),
    publisher: {
      "@type": "Organization",
      name: "Kurdistan Hotels",
      logo: `${SITE}/logo-square.png`,
    },
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

      <article dir={dir}>
        {/* Full-bleed cover with the title over it. A headline sitting on the
            photograph reads as an article; the same headline above a boxed
            image reads as a database record. */}
        {cover ? (
          <header className="relative">
            <div className="relative h-[52vh] min-h-72 w-full overflow-hidden bg-muted">
              <Image
                src={cover}
                alt={post.title}
                fill
                priority
                sizes="100vw"
                unoptimized={isRawSrc(cover)}
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/10" />
            </div>
            <div className="absolute inset-x-0 bottom-0">
              <div className="mx-auto max-w-3xl px-6 pb-8 sm:pb-10">
                <h1 className="text-3xl font-extrabold leading-tight text-white drop-shadow-sm sm:text-4xl md:text-5xl">
                  {post.title}
                </h1>
                <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-white/80">
                  {date && (
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarDays className="size-4" />
                      {date}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="size-4" />
                    {readingMinutes(post.content)} min
                  </span>
                </p>
              </div>
            </div>
          </header>
        ) : (
          <header className="mx-auto max-w-3xl px-6 pt-10">
            <h1 className="text-3xl font-extrabold leading-tight sm:text-4xl">
              {post.title}
            </h1>
            <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
              {date && (
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays className="size-4" />
                  {date}
                </span>
              )}
              <span className="inline-flex items-center gap-1.5">
                <Clock className="size-4" />
                {readingMinutes(post.content)} min
              </span>
            </p>
          </header>
        )}

        <div className="mx-auto max-w-3xl px-6 py-8 sm:py-10">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b pb-5">
            <Link
              href="/blog"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              <ArrowLeft className="size-4 rtl:rotate-180" />
              گۆڤار
            </Link>
            <ShareButton title={post.title} />
          </div>

          {post.excerpt && (
            <p className="mb-6 border-s-2 border-gold ps-4 text-lg leading-relaxed text-foreground/80">
              {post.excerpt}
            </p>
          )}

          <PostContent content={post.content} />
        </div>
      </article>

      {more.length > 0 && (
        <section className="border-t bg-muted/30">
          <div className="mx-auto max-w-6xl px-6 py-12">
            <h2 className="mb-5 text-lg font-bold">زیاتر بخوێنەوە</h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {more.map((p) => {
                const c = p.coverImage ? mediaSrc(p.coverImage) : "";
                return (
                  <Link
                    key={p.id}
                    href={`/blog/${p.slug}`}
                    dir={postDir(p.lang)}
                    className="group overflow-hidden rounded-2xl border bg-card shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                  >
                    {c && (
                      <div className="relative aspect-16/10 overflow-hidden bg-muted">
                        <Image
                          src={c}
                          alt={p.title}
                          fill
                          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                          unoptimized={isRawSrc(c)}
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                    )}
                    <div className="p-4">
                      <h3 className="line-clamp-2 font-bold group-hover:text-primary">
                        {p.title}
                      </h3>
                      <p className="mt-1.5 inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="size-3.5" />
                        {readingMinutes(p.content)} min
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      <SiteFooter />
    </>
  );
}
