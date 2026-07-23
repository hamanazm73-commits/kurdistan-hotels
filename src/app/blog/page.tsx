import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getPublishedPosts } from "@/lib/posts-server";
import { mediaSrc } from "@/lib/types";

const SITE = "https://hotelskurdistan.com";

// refresh hourly so newly published posts appear without a redeploy
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Blog — گۆڤاری گەشتیاری کوردستان",
  description:
    "Travel guides and tips for Kurdistan — Erbil, Sulaymaniyah, Duhok, Dukan and more. ڕێنمایی گەشت و هۆتێل لە کوردستان.",
  alternates: { canonical: "/blog" },
};

const RTL = new Set(["ckb", "ar"]);

export default async function BlogIndexPage() {
  const posts = await getPublishedPosts();

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
      <main className="mx-auto max-w-5xl px-6 py-10">
        <header className="mb-8 border-b pb-6">
          <h1 className="text-3xl font-extrabold sm:text-4xl">
            بلاگ · Blog
          </h1>
          <p className="mt-2 text-muted-foreground">
            ڕێنمایی گەشت و هۆتێل لە کوردستان — Travel guides for Kurdistan.
          </p>
        </header>

        {posts.length === 0 ? (
          <p className="py-20 text-center text-muted-foreground">
            هێشتا هیچ بابەتێک بڵاو نەکراوەتەوە.
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2">
            {posts.map((p) => (
              <Link
                key={p.id}
                href={`/blog/${p.slug}`}
                dir={RTL.has(p.lang) ? "rtl" : "ltr"}
                className="group overflow-hidden rounded-2xl border bg-card shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                {p.coverImage && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={mediaSrc(p.coverImage)}
                    alt=""
                    className="h-44 w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                )}
                <div className="p-5">
                  <h2 className="text-lg font-bold transition-colors group-hover:text-primary">
                    {p.title}
                  </h2>
                  {p.excerpt && (
                    <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
                      {p.excerpt}
                    </p>
                  )}
                  {p.createdAt && (
                    <p className="mt-3 text-xs text-muted-foreground">
                      {new Date(p.createdAt).toLocaleDateString("en-GB")}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
