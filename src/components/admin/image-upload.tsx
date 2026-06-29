"use client";

import { useRef, useState } from "react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { toast } from "sonner";
import { Upload, Loader2, X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { storage } from "@/lib/firebase";
import { useI18n } from "@/lib/i18n";

function safeName(name: string) {
  return name.replace(/[^\w.\-]/g, "_");
}

async function uploadFile(file: File, folder: string) {
  if (!storage) throw new Error("Firebase Storage is not enabled");
  const path = `hotels/${folder}/${Date.now()}-${safeName(file.name)}`;
  const r = ref(storage, path);
  await uploadBytes(r, file);
  return getDownloadURL(r);
}

/** Single cover image: upload, preview, remove, or paste a URL. */
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

  async function handleFile(file: File) {
    setUploading(true);
    try {
      onChange(await uploadFile(file, "cover"));
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-2">
      {value && (
        <div className="relative overflow-hidden rounded-lg border">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="" className="h-32 w-full object-cover" />
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
          <Upload className="size-4" />
        )}
        {uploading ? t("admin_uploading") : t("admin_upload")}
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

/** Gallery: multiple images with add/remove. */
export function GalleryUpload({
  value,
  onChange,
}: {
  value: string[];
  onChange: (urls: string[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFiles(files: FileList) {
    setUploading(true);
    try {
      const urls: string[] = [];
      for (const file of Array.from(files)) {
        urls.push(await uploadFile(file, "gallery"));
      }
      onChange([...value, ...urls]);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {value.map((url, i) => (
        <div
          key={i}
          className="relative size-20 overflow-hidden rounded-lg border"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt="" className="size-full object-cover" />
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
