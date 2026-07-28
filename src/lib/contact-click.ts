"use client";

import { track } from "./analytics";

export type ContactKind = "whatsapp" | "call" | "map";

/**
 * Record that a guest tried to reach a hotel.
 *
 * Called from the click handler of a link that is about to navigate away — to
 * WhatsApp, the dialer, Google Maps — so it must not block or delay that.
 * `sendBeacon` is built for exactly this: the browser takes the payload and
 * delivers it even as the page goes away. `fetch` with keepalive is the
 * fallback where it isn't available.
 */
export function recordContactClick(hotelId: string, kind: ContactKind) {
  if (!hotelId) return;
  track("contact_click", { hotel_id: hotelId, kind });

  const body = JSON.stringify({ hotelId, kind });
  try {
    if (navigator.sendBeacon) {
      navigator.sendBeacon(
        "/api/contact-click",
        new Blob([body], { type: "application/json" }),
      );
      return;
    }
    void fetch("/api/contact-click", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => {});
  } catch {
    /* never let a metric get in the way of reaching the hotel */
  }
}
