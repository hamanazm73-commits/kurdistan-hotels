"use client";

import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  setDoc,
  getDoc,
  getDocs,
  onSnapshot,
  deleteField,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { db } from "./firebase";
import { SAMPLE_HOTELS } from "./sample-data";
import type { AdminRecord, Booking, Hotel, HotelInput, Role } from "./types";

function requireDb() {
  if (!db) throw new Error("Firebase not configured");
  return db;
}

/* ---------------- hotels CRUD ----------------
 * Heavy media (gallery images + inline video) lives in a separate
 * `hotelMedia/{hotelId}` document, so the public hotel list — which reads the
 * whole `hotels` collection — stays light. The cover image stays on the hotel
 * doc because the cards show it. The detail page and the admin editor load the
 * media doc on demand. Older hotels that still have media inline keep working
 * as a fallback until the next time they are saved. */

export interface HotelMedia {
  images?: string[];
  video?: string;
}

/** Split a hotel payload into the light "core" (kept on the hotel doc) and the
    heavy "media" (kept on hotelMedia). Only the keys present in `data` move. */
function splitMedia(data: Partial<HotelInput>) {
  const core: Record<string, unknown> = { ...data };
  const media: HotelMedia = {};
  let hasMedia = false;
  if ("images" in data) {
    media.images = data.images ?? [];
    delete core.images;
    hasMedia = true;
  }
  if ("video" in data) {
    media.video = data.video ?? "";
    delete core.video;
    hasMedia = true;
  }
  return { core, media, hasMedia };
}

/** True when a write failed because the hotelMedia rules aren't published yet.
    In that case callers fall back to the old inline behaviour so nothing breaks. */
function isPermissionError(e: unknown): boolean {
  const code = (e as { code?: string })?.code;
  const msg = e instanceof Error ? e.message : String(e);
  return code === "permission-denied" || /permission|insufficient/i.test(msg);
}

/** Read a hotel's gallery + video. Returns null when there is no media doc
    (e.g. an un-migrated hotel, or rules not published) so callers fall back. */
export async function getHotelMedia(id: string): Promise<HotelMedia | null> {
  try {
    const snap = await getDoc(doc(requireDb(), "hotelMedia", id));
    return snap.exists() ? (snap.data() as HotelMedia) : null;
  } catch {
    return null;
  }
}

export async function addHotel(data: HotelInput) {
  const d = requireDb();
  const { core, media, hasMedia } = splitMedia(data);
  const ref = doc(collection(d, "hotels"));
  if (hasMedia) {
    try {
      // Write media first: if it fails, we never create a half hotel.
      await setDoc(doc(d, "hotelMedia", ref.id), media);
    } catch (e) {
      if (!isPermissionError(e)) throw e; // e.g. too large — surface it
      // Rules not published yet: keep the old inline layout so it still works.
      await setDoc(ref, { ...core, ...media, createdAt: Date.now() });
      return ref;
    }
  }
  await setDoc(ref, { ...core, createdAt: Date.now() });
  return ref;
}

export async function updateHotel(id: string, data: Partial<HotelInput>) {
  const d = requireDb();
  const { core, media, hasMedia } = splitMedia(data);
  if (hasMedia) {
    try {
      // Media first, so a failed write never strips the inline copy below.
      await setDoc(doc(d, "hotelMedia", id), media, { merge: true });
    } catch (e) {
      if (!isPermissionError(e)) throw e; // e.g. too large — surface it
      // Rules not published yet: store media inline on the hotel doc as before.
      await updateDoc(doc(d, "hotels", id), { ...core, ...media });
      return;
    }
  }
  const patch: Record<string, unknown> = { ...core };
  // Drop any legacy inline media now that it lives on hotelMedia.
  if ("images" in data) patch.images = deleteField();
  if ("video" in data) patch.video = deleteField();
  if (Object.keys(patch).length > 0)
    await updateDoc(doc(d, "hotels", id), patch);
}

export async function deleteHotel(id: string) {
  const d = requireDb();
  await deleteDoc(doc(d, "hotels", id));
  try {
    await deleteDoc(doc(d, "hotelMedia", id));
  } catch {
    /* best effort — a missing media doc is fine */
  }
}

/** One-click sample data so the owner has something to start from. */
export async function seedHotels() {
  const d = requireDb();
  await Promise.all(
    SAMPLE_HOTELS.map(({ id, ...rest }) => {
      void id;
      return addDoc(collection(d, "hotels"), { ...rest, createdAt: Date.now() });
    }),
  );
}

/* ---------------- global settings ---------------- */

export interface AppSettings {
  /** market exchange rate: how many IQD per 1 USD. Owner-set and updated as the
      Kurdistan market moves — forex APIs only carry the official rate. */
  iqdPerUsd?: number;
}

export async function getSettings(): Promise<AppSettings> {
  try {
    const snap = await getDoc(doc(requireDb(), "settings", "config"));
    return snap.exists() ? (snap.data() as AppSettings) : {};
  } catch {
    return {};
  }
}

export async function setIqdPerUsd(iqdPerUsd: number) {
  return setDoc(
    doc(requireDb(), "settings", "config"),
    { iqdPerUsd },
    { merge: true },
  );
}

/* ---------------- admins ---------------- */

export async function listAdmins(): Promise<AdminRecord[]> {
  const snap = await getDocs(collection(requireDb(), "roles"));
  return snap.docs.map((d) => d.data() as AdminRecord);
}

export async function addAdmin(
  email: string,
  addedBy: string,
  role: Role = "admin",
  hotel?: { id: string; name: string },
) {
  const e = email.trim().toLowerCase();
  const rec: AdminRecord = {
    email: e,
    role,
    enabled: true,
    addedBy,
    createdAt: Date.now(),
  };
  if (role === "hotel" && hotel) {
    rec.hotelId = hotel.id;
    rec.hotelName = hotel.name;
  }
  return setDoc(doc(requireDb(), "roles", e), rec);
}

export async function setAdminEnabled(email: string, enabled: boolean) {
  return updateDoc(doc(requireDb(), "roles", email.toLowerCase()), { enabled });
}

export async function removeAdmin(email: string) {
  return deleteDoc(doc(requireDb(), "roles", email.toLowerCase()));
}

/* ---------------- bookings (read for admin) ---------------- */

function bookingsQuery(hotelId?: string) {
  const col = collection(requireDb(), "bookings");
  // For a hotel owner, filter by hotelId (sorted client-side to avoid a
  // composite index). Owners/admins get all, sorted by Firestore.
  return hotelId
    ? query(col, where("hotelId", "==", hotelId))
    : query(col, orderBy("createdAt", "desc"));
}

export async function listBookings(
  hotelId?: string,
): Promise<(Booking & { id: string })[]> {
  const snap = await getDocs(bookingsQuery(hotelId));
  const rows = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Booking) }));
  if (hotelId) rows.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
  return rows;
}

/**
 * Live bookings — calls `onData` whenever a booking is added/changed/removed,
 * so the admin panel updates on its own (no manual refresh). Returns an
 * unsubscribe function. On error the existing rows are kept (onData isn't
 * called with an empty list).
 */
export function watchBookings(
  hotelId: string | undefined,
  onData: (rows: (Booking & { id: string })[]) => void,
  onError?: () => void,
): () => void {
  return onSnapshot(
    bookingsQuery(hotelId),
    (snap) => {
      const rows = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Booking) }));
      if (hotelId) rows.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
      onData(rows);
    },
    () => onError?.(),
  );
}
