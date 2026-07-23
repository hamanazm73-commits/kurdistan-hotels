import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PostContent } from "@/components/post-content";
import { getPostBySlug, getPublishedPosts } from "@/lib/posts-server";
import { mediaSrc } from "@/lib/types";

const SITE = "https://hotelskurdistan.com";
const RTL = new Set(["ckb", "ar"]);

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
    post.excerpt?.trim() ||
    post.content.replace(/\s+/g, " ").slice(0, 160);

  return {
    title: post.title,
    description,
    alternates: { canonical: `/blog/${post.slug}` },
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

  const dir = RTL.has(post.lang) ? "rtl" : "ltr";
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
      <main className="mx-auto max-w-3xl px-6 py-10" dir={dir}>
        <Link
          href="/blog"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="size-4 rtl:rotate-180" />
          Blog
        </Link>

        <h1 className="text-3xl font-extrabold leading-tight sm:text-4xl">
          {post.title}
        </h1>
        {post.createdAt && (
          <p className="mt-2 text-sm text-muted-foreground">
            {new Date(post.createdAt).toLocaleDateString("en-GB")}
          </p>
        )}

        {post.coverImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={mediaSrc(post.coverImage)}
            alt=""
            className="mt-6 max-h-96 w-full rounded-2xl border object-cover"
          />
        )}

        <article className="mt-8">
          <PostContent content={post.content} />
        </article>
      </main>
      <SiteFooter />
    </>
  );
}
