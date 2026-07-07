"use client";

/**
 * Guest-side bookings saved on the visitor's own device (no login needed).
 * When someone books, we keep a copy in localStorage so they can see their
 * own reservations on the "My bookings" page.
 */
export interface MyBooking {
  id: string;
  /** the Firestore booking id, used to look up the live status (owner confirm) */
  docId?: string;
  hotelId: string;
  hotel: string;
  roomType: string;
  roomPrice: number;
  checkIn: string;
  nights: number;
  name: string;
  phone: string;
  createdAt: number;
}

const KEY = "myBookings";

export function getMyBookings(): MyBooking[] {
  if (typeof window === "undefined") return [];
  try {
    const arr = JSON.parse(localStorage.getItem(KEY) || "[]");
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export function addMyBooking(
  b: Omit<MyBooking, "id" | "createdAt">,
): MyBooking {
  const rec: MyBooking = {
    ...b,
    id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: Date.now(),
  };
  const list = [rec, ...getMyBookings()].slice(0, 50);
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
    // let other tabs / the header badge react
    window.dispatchEvent(new Event("my-bookings-changed"));
  } catch {
    /* storage full / disabled — ignore */
  }
  return rec;
}

export function removeMyBooking(id: string) {
  const list = getMyBookings().filter((b) => b.id !== id);
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
    window.dispatchEvent(new Event("my-bookings-changed"));
  } catch {
    /* ignore */
  }
}
