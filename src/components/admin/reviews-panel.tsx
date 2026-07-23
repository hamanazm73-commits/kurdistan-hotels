"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, Inbox, Star, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { useHotels } from "@/lib/use-hotels";
import { cn } from "@/lib/utils";

interface AdminReview {
  id: string;
  hotelId: string;
  name: string;
  rating: number;
  comment: string;
  status?: string;
  createdAt?: number;
}

const STATUS_STYLE: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  approved:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  rejected: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
};

function Stars({ value }: { value: number }) {
  return (
    <span className="inline-flex">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={cn(
            "size-3.5",
            n <= Math.round(value)
              ? "fill-gold text-gold"
              : "text-muted-foreground/30",
          )}
        />
      ))}
    </span>
  );
}

export function ReviewsPanel() {
  const { t } = useI18n();
  const { user } = useAuth();
  const { hotels } = useHotels();
  const [rows, setRows] = useState<AdminReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [filter, setFilter] = useState<"pending" | "all">("pending");

  const hotelName = (id: string) =>
    hotels.find((h) => h.id === id)?.name ?? id;

  const load = useCallback(async () => {
    if (!user) return;
    try {
      const idToken = await user.getIdToken();
      const res = await fetch("/api/reviews/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });
      const d = await res.json();
      setRows(Array.isArray(d.reviews) ? d.reviews : []);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  async function setStatus(id: string, status: "approved" | "rejected") {
    if (!user) return;
    setBusy(id);
    try {
      const idToken = await user.getIdToken();
      const res = await fetch("/api/reviews/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status, idToken }),
      });
      if (!res.ok) throw new Error(String(res.status));
      toast.success(t("rv_updated"));
      setRows((rs) => rs.map((r) => (r.id === id ? { ...r, status } : r)));
    } catch {
      toast.error(t("rv_update_failed"));
    } finally {
      setBusy(null);
    }
  }

  if (loading)
    return (
      <div className="grid place-items-center py-16">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );

  const pendingCount = rows.filter(
    (r) => (r.status ?? "pending") === "pending",
  ).length;
  const shown =
    filter === "pending"
      ? rows.filter((r) => (r.status ?? "pending") === "pending")
      : rows;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          size="sm"
          variant={filter === "pending" ? "default" : "outline"}
          className="rounded-full"
          onClick={() => setFilter("pending")}
        >
          {t("rv_pending")}
          {pendingCount > 0 ? ` (${pendingCount})` : ""}
        </Button>
        <Button
          type="button"
          size="sm"
          variant={filter === "all" ? "default" : "outline"}
          className="rounded-full"
          onClick={() => setFilter("all")}
        >
          {t("bk_all")}
        </Button>
      </div>

      {shown.length === 0 ? (
        <Card className="grid place-items-center gap-2 py-16 text-muted-foreground">
          <Inbox className="size-8" />
          <p>{t("rv_none_admin")}</p>
        </Card>
      ) : (
        <div className="grid gap-3">
          {shown.map((r) => {
            const s = r.status ?? "pending";
            return (
              <Card key={r.id} className="p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold">{r.name}</span>
                  <Stars value={r.rating} />
                  <Badge
                    className={cn(
                      "gap-1 border-transparent",
                      STATUS_STYLE[s],
                    )}
                  >
                    {t(`rv_status_${s}`)}
                  </Badge>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {hotelName(r.hotelId)}
                </p>
                <p className="mt-2 whitespace-pre-line text-sm text-muted-foreground">
                  {r.comment}
                </p>

                {busy === r.id ? (
                  <div className="mt-3 border-t pt-3">
                    <Loader2 className="size-4 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <div className="mt-3 flex flex-wrap gap-2 border-t pt-3">
                    {s !== "approved" && (
                      <Button
                        type="button"
                        size="sm"
                        className="h-8 gap-1"
                        onClick={() => setStatus(r.id, "approved")}
                      >
                        <Check className="size-4" />
                        {t("rv_approve")}
                      </Button>
                    )}
                    {s !== "rejected" && (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="h-8 gap-1 text-muted-foreground"
                        onClick={() => setStatus(r.id, "rejected")}
                      >
                        <X className="size-4" />
                        {t("rv_reject")}
                      </Button>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
