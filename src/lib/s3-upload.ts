"use client";

import { auth } from "./firebase";

/**
 * Uploads to an S3-compatible bucket (Cloudflare R2) via a presigned PUT URL
 * minted by /api/upload-url. The browser sends the file straight to the bucket,
 * so large videos aren't limited by the serverless body size.
 *
 * Enabled with NEXT_PUBLIC_S3_UPLOADS=on (plus the server S3_* env vars).
 */
export const s3UploadsEnabled = process.env.NEXT_PUBLIC_S3_UPLOADS === "on";

export async function uploadToS3(
  file: File,
  kind: "image" | "video" = "image",
): Promise<string> {
  const idToken = (await auth?.currentUser?.getIdToken()) ?? "";
  const contentType = file.type || (kind === "video" ? "video/mp4" : "image/jpeg");

  const res = await fetch("/api/upload-url", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contentType, kind, filename: file.name, idToken }),
  });
  if (!res.ok) {
    const e = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(e.error || "upload-url-failed");
  }
  const { uploadUrl, publicUrl } = (await res.json()) as {
    uploadUrl: string;
    publicUrl: string;
  };

  const put = await fetch(uploadUrl, {
    method: "PUT",
    body: file,
    headers: { "Content-Type": contentType },
  });
  if (!put.ok) throw new Error(`upload-failed-${put.status}`);
  return publicUrl;
}
