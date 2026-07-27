"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

const REDUCED = "(prefers-reduced-motion: reduce)";

/** Live read of the user's reduced-motion preference, without setState-in-effect. */
function usePrefersReducedMotion() {
  return useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia(REDUCED);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    () => window.matchMedia(REDUCED).matches,
    () => false, // server render: assume motion is fine
  );
}

/**
 * Counts up from 0 to `value` once the element scrolls into view — a small,
 * one-time flourish that draws the eye to a number without being noisy.
 * Uses a native IntersectionObserver so it fires reliably, and falls back to
 * showing the final value if observers aren't available.
 *
 * Under reduced motion the number is shown outright, matching globals.css,
 * which mutes the eye's pulse under the same preference.
 */
export function CountUp({
  value,
  duration = 900,
  className,
}: {
  value: number;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [n, setN] = useState(0);
  const [done, setDone] = useState(false);
  const reduced = usePrefersReducedMotion();
  const animates = value > 0 && !reduced;

  useEffect(() => {
    const el = ref.current;
    if (!el || !animates) return;

    let raf = 0;
    let started = false;
    const run = () => {
      if (started) return;
      started = true;
      const start = performance.now();
      const tick = (now: number) => {
        const p = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
        setN(Math.round(eased * value));
        if (p < 1) raf = requestAnimationFrame(tick);
        else setDone(true);
      };
      raf = requestAnimationFrame(tick);
    };

    if (typeof IntersectionObserver === "undefined") {
      run();
      return () => cancelAnimationFrame(raf);
    }

    const obs = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          run();
          obs.disconnect();
        }
      },
      { rootMargin: "0px 0px -40px 0px", threshold: 0.1 },
    );
    obs.observe(el);
    return () => {
      obs.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [value, duration, animates]);

  return (
    <span
      ref={ref}
      className={[className, done && "count-up-done"].filter(Boolean).join(" ")}
    >
      {animates ? n : value}
    </span>
  );
}
