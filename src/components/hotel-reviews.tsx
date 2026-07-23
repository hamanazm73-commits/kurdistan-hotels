"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Star, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useI18n } from "@/lib/i18n";
import { reviewSummary } from "@/lib/types";
import { cn } from "@/lib/utils";

interface PublicReview {
  id: string;
  name: string;
  rating: number;
  comment: string;
  createdAt: number;
}

function Stars({ value, className }: { value: number; className?: string }) {
  return (
    <span className="inline-flex" aria-label={`${value} / 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={cn(
            className ?? "size-4",
            n <= Math.round(value)
              ? "fill-gold text-gold"
              : "text-muted-foreground/30",
          )}
        />
      ))}
    </span>
  );
}

export function HotelReviews({ hotelId }: { hotelId: string }) {
  const { t } = useI18n();
  const [reviews, setReviews] = useState<PublicReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let alive = true;
    fetch(`/api/reviews?hotelId=${encodeURIComponent(hotelId)}`)
      .then((r) => r.json())
      .then((d) => {
        if (alive) setReviews(Array.isArray(d.reviews) ? d.reviews : []);
      })
      .catch(() => {})
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [hotelId]);

  const { average, count } = reviewSummary(reviews);

  async function submit() {
    if (!name.trim() || rating < 1 || comment.trim().length < 3) {
      toast.error(t("rv_required"));
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hotelId,
          name: name.trim(),
          rating,
          comment: comment.trim(),
        }),
      });
      if (res.status === 429) {
        toast.error(t("rv_ratelimited"));
        return;
      }
      if (!res.ok) {
        toast.error(t("rv_failed"));
        return;
      }
      toast.success(t("rv_thanks"));
      setName("");
      setRating(0);
      setComment("");
    } catch {
      toast.error(t("rv_failed"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="mt-10">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-bold">{t("rv_title")}</h2>
        {count > 0 && (
          <div className="flex items-center gap-2 text-sm">
            <Stars value={average} />
            <span className="font-bold">{average.toFixed(1)}</span>
            <span className="text-muted-foreground">
              ({t("rv_count", { n: count })})
            </span>
          </div>
        )}
      </div>

      {loading ? null : count === 0 ? (
        <p className="rounded-lg border border-dashed bg-muted/40 px-4 py-6 text-center text-sm text-muted-foreground">
          {t("rv_none")}
        </p>
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <div key={r.id} className="rounded-xl border bg-card p-4">
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold">{r.name}</span>
                <Stars value={r.rating} className="size-3.5" />
              </div>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                {r.comment}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* write a review */}
      <div className="mt-6 rounded-xl border bg-muted/30 p-4">
        <h3 className="mb-3 font-bold">{t("rv_write")}</h3>
        <div className="grid gap-3">
          <div className="grid gap-1.5">
            <Label>{t("rv_your_rating")}</Label>
            <div
              className="flex gap-1"
              onMouseLeave={() => setHover(0)}
            >
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  aria-label={`${n}`}
                  onMouseEnter={() => setHover(n)}
                  onClick={() => setRating(n)}
                  className="p-0.5"
                >
                  <Star
                    className={cn(
                      "size-8 transition",
                      n <= (hover || rating)
                        ? "fill-gold text-gold"
                        : "text-muted-foreground/30",
                    )}
                  />
                </button>
              ))}
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="rv-name">{t("book_name")}</Label>
            <Input
              id="rv-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="rv-comment">{t("rv_comment")}</Label>
            <Textarea
              id="rv-comment"
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>
          <Button
            onClick={submit}
            disabled={submitting}
            className="gap-1.5 sm:w-fit"
          >
            <Send className="size-4" />
            {t("rv_submit")}
          </Button>
          <p className="text-xs leading-relaxed text-muted-foreground">
            {t("rv_moderation_note")}
          </p>
        </div>
      </div>
    </section>
  );
}
