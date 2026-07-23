"use client";

import { useMemo, useSyncExternalStore } from "react";

/**
 * The visitor's favourite hotels, saved on their own device (no login needed).
 * A tap on the heart on any hotel card adds/removes it; the "Favourites" page
 * lists them. Stored as an array of hotel ids in localStorage.
 */
const KEY = "favorites";

function read(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const arr = JSON.parse(localStorage.getItem(KEY) || "[]");
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function write(ids: string[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(ids));
    // let every card / the header badge react on the same page
    window.dispatchEvent(new Event("favorites-changed"));
  } catch {
    /* storage full / disabled — ignore */
  }
}

/** Add the hotel if missing, remove it if already saved. */
export function toggleFavorite(id: string) {
  const ids = read();
  write(ids.includes(id) ? ids.filter((x) => x !== id) : [id, ...ids]);
}

export function getFavorites(): string[] {
  return read();
}

function subscribe(cb: () => void) {
  window.addEventListener("favorites-changed", cb);
  window.addEventListener("storage", cb); // other tabs
  return () => {
    window.removeEventListener("favorites-changed", cb);
    window.removeEventListener("storage", cb);
  };
}

// a stable string snapshot so useSyncExternalStore doesn't loop
function getSnapshot() {
  return (typeof window !== "undefined" && localStorage.getItem(KEY)) || "[]";
}

/** Reactive access to the favourites — re-renders when they change. */
export function useFavorites() {
  const json = useSyncExternalStore(subscribe, getSnapshot, () => "[]");
  const ids = useMemo(() => {
    try {
      const arr = JSON.parse(json);
      return Array.isArray(arr) ? (arr as string[]) : [];
    } catch {
      return [];
    }
  }, [json]);
  return {
    ids,
    count: ids.length,
    has: (id: string) => ids.includes(id),
    toggle: toggleFavorite,
  };
}
