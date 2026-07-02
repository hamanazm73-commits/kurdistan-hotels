"use client";

import { Coins, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCurrency, CURRENCIES } from "@/lib/currency";
import { useI18n } from "@/lib/i18n";

export function CurrencySwitcher() {
  const { currency, setCurrency, updatedAt } = useCurrency();
  const { t } = useI18n();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="ghost" size="sm" className="gap-1.5" />}
      >
        <Coins className="size-4" />
        <span className="hidden text-xs font-semibold sm:inline">{currency}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-44">
        <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
          {t("currency")}
        </div>
        {CURRENCIES.map((c) => (
          <DropdownMenuItem
            key={c.code}
            onClick={() => setCurrency(c.code)}
            className="flex items-center justify-between gap-3"
          >
            <span className="flex items-center gap-2">
              <span>{c.flag}</span>
              {c.code}
            </span>
            {currency === c.code && <Check className="size-4 text-gold" />}
          </DropdownMenuItem>
        ))}
        {updatedAt && (
          <p className="px-2 pt-1.5 text-[10px] text-muted-foreground">
            {t("currency_rate_note")}
          </p>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
