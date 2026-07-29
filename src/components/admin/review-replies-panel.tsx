"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, Star, CornerDownLeft, RefreshCw, Send } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useI18n } from "@/lib/i18n";
import { auth } from "@/lib/firebase";
import { cn } from "@/lib/utils";

interface Row {
  id: string;
  name: string;
  rating: number;
  comment: string;
  createdAt: number;
  reply?: string;
}

function Stars({ value }: { value: number }) {
  return (
    <span className="inline-flex" aria-label={`${value} / 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={cn(
            "size-3.5",
            n <= Math.round(value) ? "fill-gold text-gold" : "text-muted-foreground/30",
          )}
        />
      ))}
    </span>
  );
}

/**
 * Where a hotel answers the reviews written about it.
 *
 * Only replying — never moderation. Whether a review is published stays with
 * the platform, because a hotel that can bury criticism makes every rating on
 * the site worthless. A reply is the opposite: the hotel's voice next to the
 * complaint, which is usually worth more to a reader than the complaint costs.
 */
export function ReviewRepliesPanel({ hotelId }: { hotelId: string }) {
  const { t } = useI18n();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!hotelId) return;
    setLoading(true);
    try {
      // the public endpoint already returns this hotel's approved reviews
      const res = await fetch(
        `/api/reviews?hotelId=${encodeURIComponent(hotelId)}`,
      );
      const d = (await res.json()) as { reviews?: Row[] };
      const list = Array.isArray(d.reviews) ? d.reviews : [];
      setRows(list);
      setDrafts(
        Object.fromEntries(list.map((r) => [r.id, r.reply ?? ""])),
      );
    } catch {
      toast.error(t("rvr_load_failed"));
    } finally {
      setLoading(false);
    }
  }, [hotelId, t]);

  useEffect(() => {
    void load();
  }, [load]);

  async function save(id: string) {
    setBusy(id);
    try {
      const idToken = (await auth?.currentUser?.getIdToken()) ?? "";
      const res = await fetch("/api/reviews/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken, id, reply: drafts[id] ?? "" }),
      });
      if (!res.ok) {
        toast.error(t("rvr_save_failed"));
        return;
      }
      setRows((prev) =>
        prev.map((r) => (r.id === id ? { ...r, reply: drafts[id] ?? "" } : r)),
      );
      toast.success(t("rvr_saved"));
    } catch {
      toast.error(t("rvr_save_failed"));
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">{t("admin_reviews")}</h2>
        <Button variant="outline" onClick={load} className="gap-1.5">
          <RefreshCw className={cn("size-4", loading && "animate-spin")} />
          {t("lead_refresh")}
        </Button>
      </div>

      <p className="text-sm text-muted-foreground">{t("rvr_hint")}</p>

      {loading && rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("loading")}</p>
      ) : rows.length === 0 ? (
        <p className="rounded-lg border border-dashed bg-muted/40 px-4 py-6 text-center text-sm text-muted-foreground">
          {t("rv_none_admin")}
        </p>
      ) : (
        <div className="space-y-3">
          {rows.map((r) => (
            <Card key={r.id} className="p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-semibold">{r.name}</span>
                <Stars value={r.rating} />
              </div>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                {r.comment}
              </p>

              <div className="mt-3 border-s-2 border-gold ps-3">
                <p className="flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-400">
                  <CornerDownLeft className="size-3.5" />
                  {t("rvr_your_reply")}
                </p>
                <Textarea
                  className="mt-1.5"
                  rows={2}
                  placeholder={t("rvr_placeholder")}
                  value={drafts[r.id] ?? ""}
                  onChange={(e) =>
                    setDrafts((d) => ({ ...d, [r.id]: e.target.value }))
                  }
                />
                <Button
                  size="sm"
                  className="mt-2 gap-1.5"
                  disabled={busy === r.id || (drafts[r.id] ?? "") === (r.reply ?? "")}
                  onClick={() => save(r.id)}
                >
                  {busy === r.id ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Send className="size-4" />
                  )}
                  {(drafts[r.id] ?? "").trim() ? t("rvr_save") : t("rvr_remove")}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
