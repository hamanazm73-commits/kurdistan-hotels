"use client";

import { useState } from "react";
import { Coins, Check, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCurrency, CURRENCIES } from "@/lib/currency";
import { useI18n } from "@/lib/i18n";

export function CurrencySwitcher() {
  const { currency, setCurrency, updatedAt } = useCurrency();
  const { t } = useI18n();
  const [noteOpen, setNoteOpen] = useState(false);

  function choose(code: string) {
    setCurrency(code);
    // The first time a visitor picks a non-IQD currency this session, explain
    // that the $ conversion follows the Kurdistan market (bazaar) rate, not the
    // official exchange rate — so a $ price is never mistaken for the bank rate.
    if (
      code !== "IQD" &&
      typeof window !== "undefined" &&
      !sessionStorage.getItem("fxNoteSeen")
    ) {
      sessionStorage.setItem("fxNoteSeen", "1");
      setNoteOpen(true);
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={<Button variant="ghost" size="sm" className="gap-1.5" />}
        >
          <Coins className="size-4" />
          <span className="hidden text-xs font-semibold sm:inline">
            {currency}
          </span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-44">
          <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
            {t("currency")}
          </div>
          {CURRENCIES.map((c) => (
            <DropdownMenuItem
              key={c.code}
              onClick={() => choose(c.code)}
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

      <Dialog open={noteOpen} onOpenChange={setNoteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-gold/15 text-gold">
                <Info className="size-4" />
              </span>
              {t("fx_note_title")}
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {t("fx_note_body")}
          </p>
          <DialogFooter>
            <Button onClick={() => setNoteOpen(false)}>{t("fx_note_ok")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
