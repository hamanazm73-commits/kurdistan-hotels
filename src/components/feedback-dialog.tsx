"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Star, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useI18n } from "@/lib/i18n";
import { submitFeedback } from "@/lib/hotels-db";
import { cn } from "@/lib/utils";

/** Lets any visitor send feedback about the site. Pass the element that opens it. */
export function FeedbackDialog({ trigger }: { trigger: React.ReactElement }) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [rating, setRating] = useState(0);
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [message, setMessage] = useState("");

  async function submit() {
    if (!message.trim()) {
      toast.error(t("fb_required"));
      return;
    }
    setSubmitting(true);
    try {
      await submitFeedback({
        message: message.trim(),
        name: name.trim() || undefined,
        contact: contact.trim() || undefined,
        rating: rating || undefined,
        page: typeof window !== "undefined" ? window.location.pathname : undefined,
      });
      toast.success(t("fb_success"));
      setOpen(false);
      setRating(0);
      setName("");
      setContact("");
      setMessage("");
    } catch (e) {
      toast.error(
        e instanceof Error && e.message === "rate_limited"
          ? t("book_ratelimited")
          : t("fb_error"),
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("fb_title")}</DialogTitle>
          <DialogDescription>{t("fb_subtitle")}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label>{t("fb_rating")}</Label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating(n === rating ? 0 : n)}
                  className="p-0.5 transition active:scale-90"
                  aria-label={`${n}`}
                >
                  <Star
                    className={cn(
                      "size-7",
                      n <= rating
                        ? "fill-gold text-gold"
                        : "text-muted-foreground/40",
                    )}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="fb-msg">{t("fb_message")}</Label>
            <Textarea
              id="fb-msg"
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t("fb_message_ph")}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-3">
            <div className="grid gap-2">
              <Label htmlFor="fb-name">{t("fb_name")}</Label>
              <Input
                id="fb-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="fb-contact">{t("fb_contact")}</Label>
              <Input
                id="fb-contact"
                dir="ltr"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={submit} disabled={submitting} className="w-full">
            {submitting && <Loader2 className="size-4 animate-spin" />}
            {t("fb_send")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
