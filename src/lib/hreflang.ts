/**
 * hreflang alternates for a page.
 *
 * The site serves four languages, and until each had its own URL a search
 * engine only ever indexed one of them — an Arabic or English speaker couldn't
 * find us. `proxy.ts` serves `/ar/hotels/x` by rewriting to the existing route,
 * so every language is a real path rather than a query string.
 *
 * Kurdish Sorani is the default and keeps the bare path, which is also
 * x-default; the other three are prefixed. That way `/` and `/ckb/` never
 * compete as duplicates of each other.
 */
export const SITE_URL = "https://hotelskurdistan.com";

/** The app's language codes; all four are valid BCP-47 tags as they stand. */
export const LANG_CODES = ["ckb", "kmr", "en", "ar"] as const;
export type LangCode = (typeof LANG_CODES)[number];

/** The default language, served from the unprefixed path. */
export const DEFAULT_LANG: LangCode = "ckb";

/** The path of `path` in `lang` — unprefixed for the default language. */
export function pathFor(path: string, lang: string): string {
  const clean = path === "/" ? "" : path;
  return lang === DEFAULT_LANG ? clean || "/" : `/${lang}${clean}`;
}

/** `path` without a leading language segment, if it has one. */
export function stripLangPrefix(path: string): string {
  const seg = path.split("/")[1];
  if (!(LANG_CODES as readonly string[]).includes(seg)) return path;
  return path.slice(seg.length + 1) || "/";
}

/** Every language variant of a path, keyed by hreflang tag. */
export function languagesFor(path: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const lang of LANG_CODES) out[lang] = `${SITE_URL}${pathFor(path, lang)}`;
  return out;
}

/** Narrow an unknown `?lang=` value to a language we actually serve. */
export function asLang(value: unknown): LangCode {
  return typeof value === "string" && (LANG_CODES as readonly string[]).includes(value)
    ? (value as LangCode)
    : DEFAULT_LANG;
}

/**
 * `alternates` metadata for a page in `lang`: one entry per language, the
 * default language's path as x-default, and — crucially — a canonical that
 * points at *this* language's own path.
 *
 * Pointing every translation's canonical at the default would tell Google the
 * others are duplicates to drop, which is the opposite of why they exist.
 */
export function alternatesFor(path: string, lang: string = DEFAULT_LANG) {
  return {
    canonical: `${SITE_URL}${pathFor(path, asLang(lang))}`,
    languages: {
      ...languagesFor(path),
      "x-default": `${SITE_URL}${pathFor(path, DEFAULT_LANG)}`,
    },
  };
}
