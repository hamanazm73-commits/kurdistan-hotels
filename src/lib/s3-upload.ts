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
  onProgress?: (percent: number) => void,
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

  // XHR (not fetch) so we can report upload progress for large videos.
  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", uploadUrl);
    xhr.setRequestHeader("Content-Type", contentType);
    xhr.upload.onprogress = (e) => {
      if (onProgress && e.lengthComputable) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };
    xhr.onload = () =>
      xhr.status >= 200 && xhr.status < 300
        ? resolve()
        : reject(new Error(`upload-failed-${xhr.status}`));
    xhr.onerror = () => reject(new Error("upload-network-error"));
    xhr.ontimeout = () => reject(new Error("upload-timeout"));
    xhr.send(file);
  });
  return publicUrl;
}
