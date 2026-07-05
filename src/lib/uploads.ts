"use client";

import { cloudinaryEnabled, uploadToCloudinary } from "./cloudinary";
import { storageUploadsEnabled, uploadToStorage } from "./firebase-storage";

/**
 * One entry point for media uploads. Prefers Firebase Storage, then Cloudinary.
 * When neither is configured, `remoteUploadsEnabled` is false and callers store
 * the file inline as base64 instead.
 */
export const remoteUploadsEnabled = storageUploadsEnabled || cloudinaryEnabled;

export async function uploadMedia(
  file: File,
  kind: "image" | "video" = "image",
): Promise<string> {
  if (storageUploadsEnabled) return uploadToStorage(file, kind);
  if (cloudinaryEnabled) return uploadToCloudinary(file, kind);
  throw new Error("no-remote-uploads-configured");
}
