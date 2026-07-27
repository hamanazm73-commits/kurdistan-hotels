"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";
import { useI18n } from "@/lib/i18n";

/**
 * Share this page. Uses the phone's own share sheet where there is one
 * (WhatsApp, Telegram, …) and quietly falls back to copying the link, which is
 * all a desktop browser can offer.
 */
export function ShareButton({ title }: { title: string }) {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = window.location.href;
    if (navigator.share) {
      // a dismissed share sheet rejects — that's a choice, not a failure
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked — nothing useful left to try */
    }
  }

  return (
    <button
      type="button"
      onClick={share}
      title={t("share_cta")}
      aria-label={t("share_cta")}
      className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-semibold transition hover:bg-muted active:scale-95"
    >
      {copied ? (
        <>
          <Check className="size-4 text-emerald-600" />
          {t("share_copied")}
        </>
      ) : (
        <>
          <Share2 className="size-4" />
          {t("share_cta")}
        </>
      )}
    </button>
  );
}
