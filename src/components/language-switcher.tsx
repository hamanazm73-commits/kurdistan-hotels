"use client";

import { useId } from "react";
import { Globe, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import { useI18n, LANGS } from "@/lib/i18n";
import type { Lang } from "@/lib/types";

const KURDISH_LANGS: Lang[] = ["ckb", "kmr"];
const OTHER_LANGS: Lang[] = ["en", "ar"];

/** The flag of Kurdistan: red / white / green stripes with the golden sun (Roj). */
function KurdistanFlag({ className }: { className?: string }) {
  const id = useId().replace(/:/g, "");
  const rays = Array.from({ length: 16 }, (_, i) => {
    const a = (i / 16) * Math.PI * 2;
    return {
      x1: 12 + Math.cos(a) * 2.7,
      y1: 8 + Math.sin(a) * 2.7,
      x2: 12 + Math.cos(a) * 3.7,
      y2: 8 + Math.sin(a) * 3.7,
    };
  });
  return (
    <svg viewBox="0 0 24 16" className={className} role="img" aria-label="Kurdistan">
      <defs>
        <clipPath id={id}>
          <rect width="24" height="16" rx="2.5" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id})`}>
        <rect width="24" height="16" fill="#fff" />
        <rect width="24" height="5.34" fill="#EE2A35" />
        <rect y="10.66" width="24" height="5.34" fill="#249F58" />
        {rays.map((r, i) => (
          <line
            key={i}
            x1={r.x1}
            y1={r.y1}
            x2={r.x2}
            y2={r.y2}
            stroke="#FEDA00"
            strokeWidth="0.7"
          />
        ))}
        <circle cx="12" cy="8" r="2.6" fill="#FEDA00" />
      </g>
    </svg>
  );
}

export function LanguageSwitcher() {
  const { lang, setLang } = useI18n();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="ghost" size="sm" className="gap-2" />}
      >
        <Globe className="size-4" />
        <span className="hidden sm:inline">{LANGS[lang].label}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-40">
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="flex items-center gap-2">
            <KurdistanFlag className="h-3.5 w-5 shrink-0 rounded-[3px] shadow-sm ring-1 ring-black/10" />
            <span>کوردی</span>
            {KURDISH_LANGS.includes(lang) && (
              <Check className="size-4 text-gold" />
            )}
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {KURDISH_LANGS.map((l) => (
              <DropdownMenuItem
                key={l}
                onClick={() => setLang(l)}
                className="flex items-center justify-between gap-3"
              >
                {LANGS[l].label}
                {lang === l && <Check className="size-4 text-gold" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        {OTHER_LANGS.map((l) => (
          <DropdownMenuItem
            key={l}
            onClick={() => setLang(l)}
            className="flex items-center justify-between gap-3"
          >
            <span className="flex items-center gap-2">
              <span>{LANGS[l].flag}</span>
              {LANGS[l].label}
            </span>
            {lang === l && <Check className="size-4 text-gold" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
