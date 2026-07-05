"use client";

import { s3UploadsEnabled, uploadToS3 } from "./s3-upload";
import { blobUploadsEnabled, uploadToBlob } from "./vercel-blob";
import { cloudinaryEnabled, uploadToCloudinary } from "./cloudinary";
import { storageUploadsEnabled, uploadToStorage } from "./firebase-storage";

/**
 * One entry point for media uploads. Prefers Cloudflare R2 (S3), then Vercel
 * Blob, then Firebase Storage, then Cloudinary. When none are configured,
 * `remoteUploadsEnabled` is false and callers store the file inline as base64.
 */
export const remoteUploadsEnabled =
  s3UploadsEnabled ||
  blobUploadsEnabled ||
  storageUploadsEnabled ||
  cloudinaryEnabled;

export async function uploadMedia(
  file: File,
  kind: "image" | "video" = "image",
  onProgress?: (percent: number) => void,
): Promise<string> {
  if (s3UploadsEnabled) return uploadToS3(file, kind, onProgress);
  if (blobUploadsEnabled) return uploadToBlob(file, kind, onProgress);
  if (storageUploadsEnabled) return uploadToStorage(file, kind);
  if (cloudinaryEnabled) return uploadToCloudinary(file, kind);
  throw new Error("no-remote-uploads-configured");
}
