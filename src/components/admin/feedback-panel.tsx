"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, Inbox, Star, RefreshCw, MapPin, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { listFeedback, deleteFeedback } from "@/lib/hotels-db";
import { cn } from "@/lib/utils";
import type { Feedback } from "@/lib/types";

function Stars({ n }: { n?: number }) {
  if (!n) return null;
  return (
    <span className="inline-flex">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={cn(
            "size-4",
            i <= n ? "fill-gold text-gold" : "text-muted-foreground/30",
          )}
        />
      ))}
    </span>
  );
}

export function FeedbackPanel() {
  const { t, lang } = useI18n();
  const [items, setItems] = useState<(Feedback & { id: string })[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      setItems(await listFeedback());
    } catch {
      /* keep whatever we already have */
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let stop = false;
    const run = () => {
      if (!stop) void load();
    };
    run();
    const timer = setInterval(run, 30_000);
    return () => {
      stop = true;
      clearInterval(timer);
    };
  }, []);

  async function remove(id: string) {
    setItems((xs) => xs.filter((x) => x.id !== id)); // optimistic
    try {
      await deleteFeedback(id);
    } catch {
      toast.error(t("fb_error"));
      void load(); // restore on failure
    }
  }

  if (loading)
    return (
      <div className="grid place-items-center py-16">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );

  const fmtDate = (ms?: number) =>
    ms
      ? new Date(ms).toLocaleString(
          lang === "en" || lang === "kmr" ? "en-GB" : "ar",
        )
      : "";

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {t("admin_feedback")} — {items.length}
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => void load()}
          className="gap-1.5"
        >
          <RefreshCw className="size-4" />
          {t("fb_refresh")}
        </Button>
      </div>

      {items.length === 0 ? (
        <Card className="grid place-items-center gap-2 py-16 text-muted-foreground">
          <Inbox className="size-8" />
          <p>{t("fb_none")}</p>
        </Card>
      ) : (
        items.map((f) => (
          <Card key={f.id} className="p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold">{f.name || t("fb_anon")}</span>
                  <Stars n={f.rating} />
                </div>
                {f.contact && (
                  <a
                    href={`tel:${f.contact}`}
                    dir="ltr"
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    {f.contact}
                  </a>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <span className="text-xs text-muted-foreground">
                  {fmtDate(f.createdAt)}
                </span>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  title={t("fb_delete")}
                  onClick={() => remove(f.id)}
                >
                  <Trash2 className="size-4 text-destructive" />
                </Button>
              </div>
            </div>
            <p className="mt-2 whitespace-pre-wrap text-sm">{f.message}</p>
            {f.page && (
              <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="size-3 shrink-0" />
                {f.page}
              </p>
            )}
          </Card>
        ))
      )}
    </div>
  );
}
