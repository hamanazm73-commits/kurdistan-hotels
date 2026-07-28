"use client";

import { Eye, MessageCircle, CalendarCheck, Star } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import type { Hotel } from "@/lib/types";

const DAY_MS = 86_400_000;

/** How many stamps in `list` fall inside the last `days`. */
function within(list: number[] | undefined, days: number): number {
  if (!Array.isArray(list)) return 0;
  const cutoff = Date.now() - days * DAY_MS;
  return list.filter((ts) => Number.isFinite(ts) && ts >= cutoff).length;
}

/**
 * What the listing has actually done for this hotel.
 *
 * An owner deciding whether to stay listed has had nothing to go on. Views say
 * people looked; contact clicks say they tried to get in touch, which is the
 * number that answers "is this worth it". Both windows are real counts from
 * pruned timestamps, not lifetime totals dressed up as recent activity.
 */
export function HotelStats({ hotel }: { hotel: Hotel }) {
  const { t } = useI18n();

  const contacts30 = within(hotel.contactClicksAt, 30);
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

  return (
    <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
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
    </div>
  );
}
