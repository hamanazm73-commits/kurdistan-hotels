"use client";

import { useEffect, useRef, useState } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db, firebaseEnabled } from "./firebase";
import { SAMPLE_HOTELS } from "./sample-data";
import type { Hotel } from "./types";

/**
 * Live hotels from Firestore. Falls back to bundled samples when
 * Firebase isn't configured, the collection is empty, or a read fails —
 * so the site is never blank.
 *
 * Pass `initial` (a server-rendered list) to show real hotels on the very
 * first paint. Without it the visitor stares at a skeleton until the whole
 * bundle has booted and Firestore has answered; the live subscription then
 * takes over either way.
 */
export function useHotels(initial?: Hotel[]) {
  const seeded = !!initial?.length;
  const [hotels, setHotels] = useState<Hotel[]>(initial?.length ? initial : SAMPLE_HOTELS);
  const [loading, setLoading] = useState(!seeded);
  const [usingSamples, setUsingSamples] = useState(!seeded);

  // The server list, if we were given one, is real data — an empty or failed
  // read must not replace it with samples.
  const seededRef = useRef(seeded);
  seededRef.current = seeded;

  useEffect(() => {
    if (!firebaseEnabled || !db) {
      setLoading(false);
      return;
    }
    const fallback = () => {
      if (!seededRef.current) {
        setHotels(SAMPLE_HOTELS);
        setUsingSamples(true);
      }
      setLoading(false);
    };
    const q = query(collection(db, "hotels"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(
      q,
      (snap) => {
        if (snap.empty) {
          fallback();
          return;
        }
        setHotels(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Hotel));
        setUsingSamples(false);
        setLoading(false);
      },
      fallback,
    );
    return unsub;
  }, []);

  return { hotels, loading, usingSamples };
}
