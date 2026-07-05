"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { Upload, Loader2, X, Plus, Film } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/lib/i18n";
import { remoteUploadsEnabled, uploadMedia } from "@/lib/uploads";

/**
 * Image handling WITHOUT Firebase Storage.
 *
 * The picked file is downscaled + JPEG-compressed in the browser and stored
 * inline as a data URL on the hotel document in Firestore. That keeps the app
 * working with zero backend setup (no Storage bucket / Blaze plan needed).
 *
 * A Firestore document is capped at ~1 MB, so we keep each image well under
 * that: the cover ≲ 220 KB and each gallery image ≲ 130 KB, and the gallery
 * refuses new images once its total nears the safe budget below.
 */
const COVER_MAX_CHARS = 220_000;
const GALLERY_ITEM_MAX_CHARS = 130_000;
const GALLERY_TOTAL_BUDGET = 720_000; // leaves room for the cover + text fields

/**
 * Store an image: upload it to the remote host (Vercel Blob) and return the URL;
 * if remote uploads aren't available or fail, fall back to an inline base64 data
 * URL so the owner is never blocked.
 */
async function storeImage(
  file: File,
  opts: { maxDim: number; maxChars: number },
  onProgress?: (percent: number) => void,
): Promise<string> {
  if (remoteUploadsEnabled) {
    try {
      // Shrink + JPEG-compress first so uploads and page loads stay fast.
      let toUpload = file;
      try {
        toUpload = await compressToFile(file, opts.maxDim);
      } catch {
        /* couldn't compress (e.g. odd format) — upload the original */
      }
      return await uploadMedia(toUpload, "image", onProgress);
    } catch {
      /* remote unavailable/failed — fall through to inline base64 */
    }
  }
  return compressImage(file, opts);
}

/** Toast the failure WITH the underlying reason so the owner can report it. */
function reportUploadError(e: unknown, fallback: string) {
  const detail = e instanceof Error && e.message ? e.message : String(e ?? "");
  toast.error(detail ? `${fallback} — ${detail.slice(0, 160)}` : fallback, {
    duration: 12000,
  });
}

function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(fr.result as string);
    fr.onerror = () => reject(new Error("read-failed"));
    fr.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("decode-failed"));
    img.src = src;
  });
}

/**
 * Downscale + JPEG-compress `file` in the browser, returning a data URL whose
 * length is ≤ `maxChars`. Lowers quality first, then shrinks dimensions, so
 * even a huge phone photo ends up small enough to store inline.
 */
async function compressImage(
  file: File,
  { maxDim = 1600, maxChars = COVER_MAX_CHARS } = {},
): Promise<string> {
  const src = await readFileAsDataURL(file);
  const img = await loadImage(src);

  let dim = maxDim;
  let last = "";
  for (let attempt = 0; attempt < 6; attempt++) {
    let width = img.width || dim;
    let height = img.height || dim;
    const longest = Math.max(width, height);
    if (longest > dim) {
      const scale = dim / longest;
      width = Math.max(1, Math.round(width * scale));
      height = Math.max(1, Math.round(height * scale));
    }

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("canvas-unavailable");
    ctx.drawImage(img, 0, 0, width, height);

    for (let q = 0.8; q >= 0.4; q -= 0.1) {
      last = canvas.toDataURL("image/jpeg", q);
      if (last.length <= maxChars) return last;
    }
    dim = Math.round(dim * 0.8); // still too big — shrink and retry
  }
  return last; // smallest we could manage
}

/** Downscale + JPEG-compress into a small File, for fast remote uploads. */
async function compressToFile(file: File, maxDim = 1600): Promise<File> {
  const src = await readFileAsDataURL(file);
  const img = await loadImage(src);
  let width = img.width || maxDim;
  let height = img.height || maxDim;
  const longest = Math.max(width, height);
  if (longest > maxDim) {
    const scale = maxDim / longest;
    width = Math.max(1, Math.round(width * scale));
    height = Math.max(1, Math.round(height * scale));
  }
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas-unavailable");
  ctx.drawImage(img, 0, 0, width, height);
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", 0.82),
  );
  if (!blob) throw new Error("compress-failed");
  const name = file.name.replace(/\.[^./\\]+$/, "") + ".jpg";
  return new File([blob], name, { type: "image/jpeg" });
}

/** Single cover image: upload (compressed inline), preview, remove, or paste a URL. */
export function ImageUpload({
  value,
  onChange,
}: {
  value: string;
  onChange: (url: string) => void;
}) {
  const { t } = useI18n();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);

  async function handleFile(file: File) {
    setUploading(true);
    setProgress(null);
    try {
      onChange(
        await storeImage(
          file,
          { maxDim: 1600, maxChars: COVER_MAX_CHARS },
          setProgress,
        ),
      );
    } catch (e) {
      reportUploadError(e, t("admin_upload_failed"));
    } finally {
      setUploading(false);
      setProgress(null);
    }
  }

  return (
    <div className="space-y-2">
      {value && (
        <div className="relative overflow-hidden rounded-lg border bg-muted">
          {/* blurred fill so the whole image shows undistorted, like the card */}
          <div
            aria-hidden
            className="absolute inset-0 scale-110 bg-cover bg-center opacity-40 blur-xl"
            style={{ backgroundImage: `url("${value}")` }}
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt=""
            className="relative mx-auto h-40 w-full object-contain"
          />
          <Button
            type="button"
            variant="secondary"
            size="icon-sm"
            className="absolute end-2 top-2 z-10"
            onClick={() => onChange("")}
          >
            <X className="size-4" />
          </Button>
        </div>
      )}
      <Button
        type="button"
        variant="outline"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="w-full gap-2"
      >
        {uploading ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Upload className="size-4" />
        )}
        {uploading
          ? progress != null
            ? `${t("admin_uploading")} ${progress}%`
            : t("admin_uploading")
          : t("admin_upload")}
      </Button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          e.target.value = "";
        }}
      />
      <Input
        dir="ltr"
        placeholder={t("admin_image_url")}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

/** Gallery: multiple images (compressed inline) with add/remove. */
export function GalleryUpload({
  value,
  onChange,
}: {
  value: string[];
  onChange: (urls: string[]) => void;
}) {
  const { t } = useI18n();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFiles(files: FileList) {
    setUploading(true);
    try {
      // Remote host: upload each file, store just the URL (no size budget).
      if (remoteUploadsEnabled) {
        const uploaded: string[] = [];
        for (const file of Array.from(files)) {
          uploaded.push(
            await storeImage(file, {
              maxDim: 1280,
              maxChars: GALLERY_ITEM_MAX_CHARS,
            }),
          );
        }
        onChange([...value, ...uploaded]);
        return;
      }
      const next = [...value];
      let total = next.reduce((sum, url) => sum + url.length, 0);
      let hitLimit = false;
      for (const file of Array.from(files)) {
        const url = await compressImage(file, {
          maxDim: 1280,
          maxChars: GALLERY_ITEM_MAX_CHARS,
        });
        if (total + url.length > GALLERY_TOTAL_BUDGET) {
          hitLimit = true;
          break;
        }
        next.push(url);
        total += url.length;
      }
      onChange(next);
      if (hitLimit) toast.error(t("admin_gallery_full"));
    } catch (e) {
      reportUploadError(e, t("admin_upload_failed"));
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {value.map((url, i) => (
        <div
          key={i}
          className="relative size-20 overflow-hidden rounded-lg border bg-muted"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt="" className="size-full object-contain" />
          <button
            type="button"
            onClick={() => onChange(value.filter((_, j) => j !== i))}
            className="absolute end-1 top-1 grid size-5 place-items-center rounded-full bg-background/80 text-foreground shadow"
          >
            <X className="size-3.5" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="grid size-20 place-items-center rounded-lg border border-dashed text-muted-foreground hover:bg-muted"
      >
        {uploading ? (
          <Loader2 className="size-5 animate-spin" />
        ) : (
          <Plus className="size-5" />
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files) handleFiles(e.target.files);
          e.target.value = "";
        }}
      />
    </div>
  );
}

/**
 * Video: pick from the phone gallery (stored inline as a data URL) OR paste a
 * link. Firestore docs are capped at ~1 MB and there is no Storage bucket, so
 * a real (multi-MB) video can't be stored inline — for those we tell the owner
 * exactly why and to use a YouTube link instead.
 */
const MAX_VIDEO_BYTES = 480 * 1024; // ~0.5 MB — must fit the Firestore document

function isYouTube(url: string) {
  return /youtu\.?be/i.test(url);
}

export function VideoUpload({
  value,
  onChange,
}: {
  value: string;
  onChange: (url: string) => void;
}) {
  const { t } = useI18n();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);

  async function handleFile(file: File) {
    // Without a remote host, a real video can't fit inline in Firestore.
    if (!remoteUploadsEnabled && file.size > MAX_VIDEO_BYTES) {
      const mb = (file.size / (1024 * 1024)).toFixed(1);
      toast.error(t("admin_video_too_large", { size: mb }), { duration: 10000 });
      return;
    }
    setUploading(true);
    setProgress(null);
    try {
      onChange(
        remoteUploadsEnabled
          ? await uploadMedia(file, "video", setProgress)
          : await readFileAsDataURL(file),
      );
      toast.success(t("admin_video_added"));
    } catch (e) {
      reportUploadError(e, t("admin_upload_failed"));
    } finally {
      setUploading(false);
      setProgress(null);
    }
  }

  const yt = value && isYouTube(value);

  return (
    <div className="space-y-2">
      {value && (
        <div className="relative overflow-hidden rounded-lg border">
          {yt ? (
            <div className="flex items-center gap-2 p-3 text-sm">
              <Film className="size-5 shrink-0 text-red-600" />
              {t("admin_video_youtube_linked")}
            </div>
          ) : (
            <video src={value} controls className="max-h-44 w-full bg-black" />
          )}
          <Button
            type="button"
            variant="secondary"
            size="icon-sm"
            className="absolute end-2 top-2"
            onClick={() => onChange("")}
          >
            <X className="size-4" />
          </Button>
        </div>
      )}
      <Button
        type="button"
        variant="outline"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="w-full gap-2"
      >
        {uploading ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Film className="size-4" />
        )}
        {uploading
          ? progress != null
            ? `${t("admin_uploading")} ${progress}%`
            : t("admin_uploading")
          : t("admin_video_upload")}
      </Button>
      <input
        ref={inputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          e.target.value = "";
        }}
      />
      <Input
        dir="ltr"
        placeholder={t("admin_video_ph")}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <p className="text-xs leading-relaxed text-muted-foreground">
        {remoteUploadsEnabled ? t("admin_video_hint_cloud") : t("admin_video_hint")}
      </p>
    </div>
  );
}
