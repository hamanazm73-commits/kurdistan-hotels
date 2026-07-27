"use client";

import { useMemo, useSyncExternalStore } from "react";

/**
 * The hotels this visitor opened, newest first, saved on their own device.
 * Someone who browses a handful of hotels and comes back tomorrow would
 * otherwise have to find them all again. No login, no backend — same shape as
 * the favourites store so both behave the same across tabs.
 */
const KEY = "recently-viewed";
const MAX = 8;

function read(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const arr = JSON.parse(localStorage.getItem(KEY) || "[]");
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

/** Move `id` to the front, dropping the oldest once the list is full. */
export function recordView(id: string) {
  if (!id) return;
  try {
    const next = [id, ...read().filter((x) => x !== id)].slice(0, MAX);
    localStorage.setItem(KEY, JSON.stringify(next));
    window.dispatchEvent(new Event("recently-viewed-changed"));
  } catch {
    /* storage full / disabled — ignore */
  }
}

function subscribe(cb: () => void) {
  window.addEventListener("recently-viewed-changed", cb);
  window.addEventListener("storage", cb); // other tabs
  return () => {
    window.removeEventListener("recently-viewed-changed", cb);
    window.removeEventListener("storage", cb);
  };
}

// a stable string snapshot so useSyncExternalStore doesn't loop
function getSnapshot() {
  return (typeof window !== "undefined" && localStorage.getItem(KEY)) || "[]";
}

/** Reactive access to the recently viewed ids — re-renders when they change. */
export function useRecentlyViewed(): string[] {
  const json = useSyncExternalStore(subscribe, getSnapshot, () => "[]");
  return useMemo(() => {
    try {
      const arr = JSON.parse(json);
      return Array.isArray(arr) ? (arr as string[]) : [];
    } catch {
      return [];
    }
  }, [json]);
}
