"use client";

import { track } from "./analytics";

export type ContactKind = "whatsapp" | "call" | "map";

/** How long before the same browser counts as reaching out to the same hotel
    again. Long enough that idle tapping doesn't register, short enough that a
    guest who calls in the morning and again at night counts twice. */
const WINDOW_MS = 6 * 60 * 60 * 1000;

/** Whether this browser has already been counted for this hotel and kind. */
function alreadyCounted(hotelId: string, kind: ContactKind): boolean {
  const key = `contact:${hotelId}:${kind}`;
  try {
    const last = Number(localStorage.getItem(key));
    if (last && Date.now() - last < WINDOW_MS) return true;
    localStorage.setItem(key, String(Date.now()));
    return false;
  } catch {
    // storage blocked — count it rather than lose it
    return false;
  }
}

/**
 * Record that a guest tried to reach a hotel.
 *
 * This is the number an owner is shown as evidence the listing works, so it
 * counts people rather than taps: five taps on WhatsApp is one person deciding
 * to get in touch, and reporting it as five would make the figure worthless.
 *
 * Called from the click handler of a link that is about to leave for WhatsApp,
 * the dialer or Maps, so the request has to survive that. `keepalive` is what
 * does it — an earlier version used `sendBeacon`, which reads like the right
 * tool but was never actually shown to arrive; the keepalive fetch is the path
 * that was verified writing to the database.
 */
export function recordContactClick(hotelId: string, kind: ContactKind) {
  if (!hotelId) return;
  // analytics wants every tap; the owner-facing tally does not
  track("contact_click", { hotel_id: hotelId, kind });
  if (alreadyCounted(hotelId, kind)) return;

  try {
    void fetch("/api/contact-click", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hotelId, kind }),
      keepalive: true,
    }).catch(() => {});
  } catch {
    /* never let a metric get in the way of reaching the hotel */
  }
}
