"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { FAQ_HEADING, FAQ_ITEMS } from "@/lib/site-content";
import { cn } from "@/lib/utils";

export function FaqSection() {
  const { lang } = useI18n();
  // first item open by default; null = all collapsed
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="mx-auto max-w-3xl px-6 py-16">
      <h2 className="mb-10 text-center text-3xl font-extrabold tracking-tight">
        {FAQ_HEADING[lang]}
      </h2>
      <div className="flex flex-col gap-3">
        {FAQ_ITEMS.map((item, i) => {
          const isOpen = open === i;
          return (
            <div key={i} className="overflow-hidden rounded-2xl border bg-card">
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : i)}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between gap-3 px-5 py-4 text-start text-base font-semibold transition hover:bg-accent/40"
              >
                <span>{item.q[lang]}</span>
                <ChevronDown
                  className={cn(
                    "size-5 shrink-0 text-muted-foreground transition-transform duration-300",
                    isOpen && "rotate-180",
                  )}
                />
              </button>
              {/* grid-rows trick animates height; answer stays in the DOM
                  (collapsed, not removed) so search engines still read it */}
              <div
                className={cn(
                  "grid transition-all duration-300 ease-out",
                  isOpen
                    ? "grid-rows-[1fr] opacity-100"
                    : "grid-rows-[0fr] opacity-0",
                )}
              >
                <div className="overflow-hidden">
                  <p className="px-5 pb-4 leading-relaxed text-muted-foreground">
                    {item.a[lang]}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
