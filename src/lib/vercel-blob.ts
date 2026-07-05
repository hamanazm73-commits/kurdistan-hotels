"use client";

import { upload } from "@vercel/blob/client";
import { auth } from "./firebase";

/**
 * Vercel Blob uploads. Enabled by NEXT_PUBLIC_BLOB_UPLOADS=on after a Blob
 * store is created in the Vercel dashboard (which injects BLOB_READ_WRITE_TOKEN
 * on the server). The browser uploads straight to Blob via a token minted by
 * /api/upload, so large videos aren't limited by the serverless body size.
 */
// On by default — the /api/upload route + BLOB_READ_WRITE_TOKEN gate real use,
// and callers fall back to inline base64 if a Blob upload can't be made. Set
// NEXT_PUBLIC_BLOB_UPLOADS=off to force the base64 path (e.g. offline dev).
export const blobUploadsEnabled =
  process.env.NEXT_PUBLIC_BLOB_UPLOADS !== "off";

export async function uploadToBlob(
  file: File,
  kind: "image" | "video" = "image",
): Promise<string> {
  const idToken = (await auth?.currentUser?.getIdToken()) ?? "";
  const result = await upload(`hotels/${kind}s/${file.name}`, file, {
    access: "public",
    handleUploadUrl: "/api/upload",
    clientPayload: idToken,
    contentType: file.type || undefined,
  });
  return result.url;
}
