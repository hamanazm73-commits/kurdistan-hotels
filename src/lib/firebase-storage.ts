"use client";

import { firebaseEnabled, getStorageLazy } from "./firebase";

/**
 * Firebase Storage uploads. Enabled once the project is on the Blaze plan,
 * Storage is turned on, and NEXT_PUBLIC_STORAGE_UPLOADS=on is set. Until then,
 * callers fall back to inline base64 so the app keeps working.
 *
 * The SDK itself is imported only when an upload actually happens — every
 * visitor pays for what this module imports at the top level, and almost none
 * of them upload anything.
 */
export const storageUploadsEnabled =
  firebaseEnabled && process.env.NEXT_PUBLIC_STORAGE_UPLOADS === "on";

/** Upload a file to Storage under /hotels and return its public download URL. */
export async function uploadToStorage(
  file: File,
  kind: "image" | "video" = "image",
): Promise<string> {
  const storage = await getStorageLazy();
  if (!storage) throw new Error("storage-unavailable");
  const { ref, uploadBytes, getDownloadURL } = await import("firebase/storage");
  const ext =
    file.name.includes(".") ? file.name.split(".").pop() : kind === "video" ? "mp4" : "jpg";
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const r = ref(storage, `hotels/${kind}s/${id}.${ext}`);
  await uploadBytes(r, file, { contentType: file.type || undefined });
  return getDownloadURL(r);
}
