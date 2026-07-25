"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Rocket, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useI18n } from "@/lib/i18n";
import { getSettings, setComingSoon } from "@/lib/hotels-db";

/** Owner/admin toggle for site-wide "coming soon" mode (banner + booking off). */
export function ComingSoonCard() {
  const { t } = useI18n();
  const [on, setOn] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getSettings().then((s) => {
      setOn(s.comingSoon !== false); // absent => on
      setLoaded(true);
    });
  }, []);

  async function toggle(v: boolean) {
    setOn(v);
    setSaving(true);
    try {
      await setComingSoon(v);
      toast.success(t("admin_saved"));
    } catch (e) {
      setOn(!v); // revert on failure
      toast.error(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="mb-1 flex items-center gap-2 text-sm font-semibold">
            <Rocket className="size-4 text-gold" />
            {t("admin_coming_soon")}
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground">
            {t("admin_coming_soon_hint")}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {saving && (
            <Loader2 className="size-4 animate-spin text-muted-foreground" />
          )}
          <Switch
            checked={on}
            onCheckedChange={toggle}
            disabled={!loaded || saving}
          />
        </div>
      </div>
      <p
        className={
          "mt-2 text-xs font-semibold " +
          (on ? "text-gold" : "text-emerald-600")
        }
      >
        {on ? t("admin_coming_soon_on") : t("admin_coming_soon_off")}
      </p>
    </Card>
  );
}
