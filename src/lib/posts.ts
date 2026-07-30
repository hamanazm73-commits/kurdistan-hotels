import type { Lang } from "./types";

/** Languages the blog is written in that read right to left. */
const RTL = new Set<string>(["ckb", "ar"]);

export function postDir(lang: string): "rtl" | "ltr" {
  return RTL.has(lang) ? "rtl" : "ltr";
}

/**
 * Roughly how long the post takes to read.
 *
 * Deliberately coarse — the point isn't accuracy, it's telling someone whether
 * they have time for this now. 200 words a minute is the usual figure, and
 * Kurdish and Arabic are counted the same way since word counts are close
 * enough at this resolution.
 */
export function readingMinutes(content: string): number {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

/** The post's date in the reader's language, or "" when it has none. */
export function postDate(ts: number | undefined, lang: Lang): string {
  if (!ts) return "";
  const locale =
    lang === "en" ? "en-GB" : lang === "kmr" ? "en-GB" : lang === "ar" ? "ar" : "ckb-IQ";
  try {
    return new Date(ts).toLocaleDateString(locale, {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return new Date(ts).toLocaleDateString("en-GB");
  }
}
