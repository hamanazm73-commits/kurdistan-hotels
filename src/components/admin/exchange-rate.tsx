"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { DollarSign, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { getSettings, setIqdPerUsd } from "@/lib/hotels-db";
import { DEFAULT_IQD_PER_USD } from "@/lib/currency";

/** Owner/admin control for the market USD rate used to show prices in dollars. */
export function ExchangeRateCard() {
  const { t } = useI18n();
  // Kurdistan quotes the rate per 100 USD (e.g. 153,000), so the field is
  // per-100; we store it internally as IQD per 1 USD.
  const [per100, setPer100] = useState(DEFAULT_IQD_PER_USD * 100);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getSettings().then((s) => {
      if (s.iqdPerUsd && s.iqdPerUsd > 0) setPer100(s.iqdPerUsd * 100);
    });
  }, []);

  async function save() {
    if (!per100 || per100 <= 0) {
      toast.error(t("admin_usd_rate"));
      return;
    }
    setSaving(true);
    try {
      await setIqdPerUsd(per100 / 100);
      toast.success(t("admin_saved"));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="p-4">
      <div className="mb-1 flex items-center gap-2 text-sm font-semibold">
        <DollarSign className="size-4 text-green-600" />
        {t("admin_usd_rate")}
      </div>
      <p className="mb-3 text-xs text-muted-foreground">
        {t("admin_usd_rate_hint")}
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm whitespace-nowrap">100 USD =</span>
        <Input
          type="text"
          inputMode="numeric"
          value={per100 ? per100.toLocaleString("en-US") : ""}
          onChange={(e) =>
            setPer100(Number(e.target.value.replace(/\D/g, "")) || 0)
          }
          className="w-32"
        />
        <span className="text-sm">IQD</span>
        <Button onClick={save} disabled={saving} size="sm" className="gap-1.5">
          {saving && <Loader2 className="size-4 animate-spin" />}
          {t("admin_save")}
        </Button>
      </div>
    </Card>
  );
}
