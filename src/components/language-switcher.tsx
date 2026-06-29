"use client";

import { Globe, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useI18n, LANGS } from "@/lib/i18n";
import type { Lang } from "@/lib/types";

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
        {(Object.keys(LANGS) as Lang[]).map((l) => (
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
