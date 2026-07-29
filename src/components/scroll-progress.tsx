/**
 * A thin gold line across the top that fills as the page scrolls.
 *
 * Driven by a CSS scroll-driven animation (see .scroll-progress in
 * globals.css) — no scroll listener and no JS frame work, so it costs
 * nothing on a phone. Where the browser lacks support the bar stays at
 * zero width and is simply invisible.
 */
export function ScrollProgress() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 z-[70] h-0.5"
    >
      <div className="scroll-progress h-full bg-gradient-to-r from-gold via-amber-300 to-gold" />
    </div>
  );
}
