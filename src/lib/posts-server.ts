import "server-only";
import { cache } from "react";
import { getAdminDb } from "./firebase-admin";
import type { BlogPost } from "./types";

/**
 * Blog posts, read on the server with the Admin SDK. Nothing about posts goes
 * through the client Firestore SDK, so no security rules are involved. Returns
 * empty/null when Admin creds are missing rather than throwing.
 */
export const getPublishedPosts = cache(async (): Promise<BlogPost[]> => {
  const db = getAdminDb();
  if (!db) return [];
  try {
    const snap = await db.collection("posts").get();
    return snap.docs
      .map((d) => ({ id: d.id, ...(d.data() ?? {}) }) as BlogPost)
      .filter((p) => p.published)
      .sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
  } catch {
    return [];
  }
});

export const getPostBySlug = cache(
  async (slug: string): Promise<BlogPost | null> => {
    const db = getAdminDb();
    if (!db) return null;
    try {
      const snap = await db
        .collection("posts")
        .where("slug", "==", slug)
        .limit(1)
        .get();
      if (snap.empty) return null;
      const d = snap.docs[0];
      const post = { id: d.id, ...(d.data() ?? {}) } as BlogPost;
      return post.published ? post : null;
    } catch {
      return null;
    }
  },
);
