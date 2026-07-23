import { SEO_ABOUT, SEO_ABOUT_HEADING } from "@/lib/site-content";

/**
 * A static, server-rendered "about" band in all four languages at once.
 * Unlike the rest of the site (which swaps language on the client), every
 * language ships in the HTML here — so search engines can match the site for
 * Kurdish, Arabic, English and Kurmanji queries alike.
 */
export function SeoAbout() {
  return (
    <section
      aria-label="About Kurdistan Hotels"
      className="border-t bg-muted/20"
    >
      <div className="mx-auto max-w-5xl px-6 py-12">
        <h2 className="mb-6 text-center text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          {SEO_ABOUT_HEADING.ckb} · {SEO_ABOUT_HEADING.ar} ·{" "}
          {SEO_ABOUT_HEADING.en}
        </h2>
        <div className="grid gap-6 sm:grid-cols-2">
          {SEO_ABOUT.map((b) => (
            <div key={b.lang} dir={b.dir} className="rounded-xl border bg-card p-5">
              <div className="mb-2 flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground">
                  {b.label}
                </span>
              </div>
              <h3 className="mb-2 text-base font-bold">{b.heading}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {b.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
