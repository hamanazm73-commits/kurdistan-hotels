"use client";

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
            <span>🟡</span>
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
