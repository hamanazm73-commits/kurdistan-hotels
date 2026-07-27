/**
 * hreflang alternates for a page.
 *
 * The site serves four languages from one URL, picked client-side, so a search
 * engine only ever indexed one of them — Arabic and English speakers couldn't
 * find us. `?lang=` makes each language its own URL, and these tags tell Google
 * they are translations of one page rather than duplicates.
 *
 * Kurdish Sorani is the default, so the bare path is x-default.
 */
export const SITE_URL = "https://hotelskurdistan.com";

/** The app's language codes; ckb/kmr are valid BCP-47 tags as they stand. */
export const LANG_CODES = ["ckb", "kmr", "en", "ar"] as const;

/** The absolute URL of `path` in one language. */
function urlFor(path: string, lang: string): string {
  return `${SITE_URL}${path === "/" ? "/" : path}?lang=${lang}`;
}

/** Every language variant of a path, keyed by hreflang tag. */
export function languagesFor(path: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const lang of LANG_CODES) out[lang] = urlFor(path, lang);
  return out;
}

/**
 * `alternates` metadata for a page: the canonical (language-free) URL plus one
 * entry per language, with the bare path as x-default.
 */
export function alternatesFor(path: string) {
  return {
    canonical: path,
    languages: {
      ...languagesFor(path),
      "x-default": `${SITE_URL}${path === "/" ? "/" : path}`,
    },
  };
}
