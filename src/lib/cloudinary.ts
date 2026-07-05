"use client";

/**
 * Cloudinary unsigned upload — hosts real images and videos outside Firestore,
 * so only a short URL is stored on the hotel document.
 *
 * Configure with two public env vars (create a free Cloudinary account, then an
 * *unsigned* upload preset):
 *   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
 *   NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
 *
 * When these aren't set, callers fall back to inline base64 storage, so the app
 * keeps working with no setup.
 */
const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

export const cloudinaryEnabled = Boolean(CLOUD_NAME && UPLOAD_PRESET);

/** Upload a file to Cloudinary and return its permanent secure URL. */
export async function uploadToCloudinary(
  file: File,
  resourceType: "image" | "video" = "image",
): Promise<string> {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error("cloudinary-not-configured");
  }
  const form = new FormData();
  form.append("file", file);
  form.append("upload_preset", UPLOAD_PRESET);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`,
    { method: "POST", body: form },
  );
  if (!res.ok) throw new Error("cloudinary-upload-failed");
  const data = (await res.json()) as { secure_url?: string };
  if (!data.secure_url) throw new Error("cloudinary-no-url");
  return data.secure_url;
}
