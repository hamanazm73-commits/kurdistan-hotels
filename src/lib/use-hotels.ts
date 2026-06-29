"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db, firebaseEnabled } from "./firebase";
import { SAMPLE_HOTELS } from "./sample-data";
import type { Hotel } from "./types";

/**
 * Live hotels from Firestore. Falls back to bundled samples when
 * Firebase isn't configured, the collection is empty, or a read fails —
 * so the site is never blank.
 */
export function useHotels() {
  const [hotels, setHotels] = useState<Hotel[]>(SAMPLE_HOTELS);
  const [loading, setLoading] = useState(true);
  const [usingSamples, setUsingSamples] = useState(true);

  useEffect(() => {
    if (!firebaseEnabled || !db) {
      setLoading(false);
      return;
    }
    const q = query(collection(db, "hotels"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(
      q,
      (snap) => {
        if (snap.empty) {
          setHotels(SAMPLE_HOTELS);
          setUsingSamples(true);
        } else {
          setHotels(
            snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Hotel),
          );
          setUsingSamples(false);
        }
        setLoading(false);
      },
      () => {
        setHotels(SAMPLE_HOTELS);
        setUsingSamples(true);
        setLoading(false);
      },
    );
    return unsub;
  }, []);

  return { hotels, loading, usingSamples };
}
