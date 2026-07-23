"use client";

import { useI18n } from "@/lib/i18n";
import { SEO_ABOUT, SEO_ABOUT_HEADING } from "@/lib/site-content";

/**
 * "About" band. All four languages are rendered into the HTML (so search
 * engines can match Kurdish / Arabic / English / Kurmanji queries alike), but
 * only the visitor's selected language is shown — the other three are present
 * in the markup yet hidden. Best of both: multilingual SEO, clean UI.
 */
export function SeoAbout() {
  const { lang } = useI18n();
  return (
    <section aria-label="About Kurdistan Hotels" className="border-t bg-muted/20">
      <div className="mx-auto max-w-3xl px-6 py-12 text-center">
        {SEO_ABOUT.map((b) => (
          <div key={b.lang} dir={b.dir} hidden={b.lang !== lang}>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {SEO_ABOUT_HEADING[b.lang]}
            </p>
            <h2 className="mb-3 text-xl font-bold">{b.heading}</h2>
            <p className="mx-auto max-w-2xl leading-relaxed text-muted-foreground">
              {b.body}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
