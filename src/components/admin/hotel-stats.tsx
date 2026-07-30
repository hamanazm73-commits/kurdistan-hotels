"use client";

import { useState } from "react";
import {
  Eye,
  MessageCircle,
  CalendarCheck,
  Star,
  Phone,
  MapPin,
  ChevronDown,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import type { Hotel } from "@/lib/types";

const DAY_MS = 86_400_000;

type Tap = { at: number; kind: string };

/** Read the contact log, tolerating the older bare-timestamp rows. */
function taps(list: Hotel["contactClicksAt"]): Tap[] {
  if (!Array.isArray(list)) return [];
  return list
    .map((e) =>
      typeof e === "number"
        ? { at: e, kind: "" }
        : { at: Number(e?.at), kind: String(e?.kind ?? "") },
    )
    .filter((e) => Number.isFinite(e.at))
    .sort((a, b) => b.at - a.at);
}

/** How many entries fall inside the last `days`. */
function within(list: number[] | undefined, days: number): number {
  if (!Array.isArray(list)) return 0;
  const cutoff = Date.now() - days * DAY_MS;
  return list.filter((ts) => Number.isFinite(ts) && ts >= cutoff).length;
}

const KIND_ICON: Record<string, typeof Phone> = {
  whatsapp: MessageCircle,
  call: Phone,
  map: MapPin,
};

/**
 * What the listing has actually done for this hotel.
 *
 * An owner deciding whether to stay listed has had nothing to go on. Views say
 * people looked; contact taps say they tried to get in touch, which is the
 * number that answers "is this worth it".
 *
 * The times matter as much as the count. The message we prefill for WhatsApp
 * is a draft in the guest's own app and they can clear it, so a hotel can't
 * tell from the message alone where someone came from — but a tap logged at
 * 14:32 against a message that arrived at 14:33 is attribution nothing in the
 * guest's hands can erase.
 */
export function HotelStats({ hotel }: { hotel: Hotel }) {
  const { t, lang } = useI18n();
  const [open, setOpen] = useState(false);

  const log = taps(hotel.contactClicksAt);
  const cutoff30 = Date.now() - 30 * DAY_MS;
  const contacts30 = log.filter((e) => e.at >= cutoff30).length;
  const bookings7 = within(hotel.recentBookingsAt, 7);
  const views = hotel.views ?? 0;
  const reviews = hotel.reviewCount ?? 0;

  // a brand-new listing has nothing to report yet; an empty row of zeros reads
  // worse than no row at all
  if (!views && !contacts30 && !bookings7 && !reviews) return null;

  const items = [
    { icon: Eye, value: views, label: t("stat_views") },
    { icon: MessageCircle, value: contacts30, label: t("stat_contacts") },
    { icon: CalendarCheck, value: bookings7, label: t("stat_bookings") },
    { icon: Star, value: reviews, label: t("stat_reviews") },
  ].filter((i) => i.value > 0);

  const locale = lang === "en" || lang === "kmr" ? "en-GB" : "ar";
  const when = (ts: number) =>
    new Date(ts).toLocaleString(locale, {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="mt-1.5">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        {items.map(({ icon: Icon, value, label }) => (
          <span
            key={label}
            title={label}
            className="inline-flex items-center gap-1 text-xs text-muted-foreground"
          >
            <Icon className="size-3.5 text-gold" />
            <span className="font-semibold text-foreground">{value}</span>
            {label}
          </span>
        ))}

        {log.length > 0 && (
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="inline-flex items-center gap-0.5 text-xs font-semibold text-primary hover:underline"
          >
            {t("stat_when")}
            <ChevronDown
              className={cn("size-3.5 transition-transform", open && "rotate-180")}
            />
          </button>
        )}
      </div>

      {open && (
        <div className="mt-2 rounded-lg border bg-muted/30 p-2">
          <p className="mb-1.5 text-xs text-muted-foreground">
            {t("stat_when_hint")}
          </p>
          <ul className="space-y-1">
            {log.slice(0, 15).map((e) => {
              const Icon = KIND_ICON[e.kind] ?? MessageCircle;
              return (
                <li
                  key={`${e.at}-${e.kind}`}
                  className="flex items-center gap-2 text-xs"
                >
                  <Icon className="size-3.5 shrink-0 text-gold" />
                  <span dir="ltr" className="font-medium">
                    {when(e.at)}
                  </span>
                  <span className="text-muted-foreground">
                    {e.kind ? t(`stat_kind_${e.kind}`) : t("stat_kind_contact")}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
