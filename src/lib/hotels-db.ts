"use client";

import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  setDoc,
  getDocs,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "./firebase";
import { SAMPLE_HOTELS } from "./sample-data";
import type { AdminRecord, Booking, Hotel, HotelInput } from "./types";

function requireDb() {
  if (!db) throw new Error("Firebase not configured");
  return db;
}

/* ---------------- hotels CRUD ---------------- */

export async function addHotel(data: HotelInput) {
  return addDoc(collection(requireDb(), "hotels"), {
    ...data,
    createdAt: Date.now(),
  });
}

export async function updateHotel(id: string, data: Partial<HotelInput>) {
  return updateDoc(doc(requireDb(), "hotels", id), data);
}

export async function deleteHotel(id: string) {
  return deleteDoc(doc(requireDb(), "hotels", id));
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

/* ---------------- admins ---------------- */

export async function listAdmins(): Promise<AdminRecord[]> {
  const snap = await getDocs(collection(requireDb(), "roles"));
  return snap.docs.map((d) => d.data() as AdminRecord);
}

export async function addAdmin(email: string, addedBy: string) {
  const e = email.trim().toLowerCase();
  return setDoc(doc(requireDb(), "roles", e), {
    email: e,
    role: "admin",
    enabled: true,
    addedBy,
    createdAt: Date.now(),
  } satisfies AdminRecord);
}

export async function setAdminEnabled(email: string, enabled: boolean) {
  return updateDoc(doc(requireDb(), "roles", email.toLowerCase()), { enabled });
}

export async function removeAdmin(email: string) {
  return deleteDoc(doc(requireDb(), "roles", email.toLowerCase()));
}

/* ---------------- bookings (read for admin) ---------------- */

export async function listBookings(): Promise<(Booking & { id: string })[]> {
  const q = query(
    collection(requireDb(), "bookings"),
    orderBy("createdAt", "desc"),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Booking) }));
}
