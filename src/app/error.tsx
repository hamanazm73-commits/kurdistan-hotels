"use client";

import { useEffect } from "react";

/**
 * Graceful recovery screen. Catches client-side render errors. A stale chunk
 * after a fresh deploy (common when deploying often) throws a ChunkLoadError —
 * we reload once (guarded against loops) to pull the new build; other errors
 * show a friendly retry instead of the raw browser error page.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    const msg = error?.message || "";
    const isChunk =
      /ChunkLoadError|Loading chunk|dynamically imported module|Importing a module script failed|Failed to fetch/i.test(
        msg,
      );
    if (isChunk && typeof window !== "undefined") {
      const KEY = "ck-reload-at";
      const last = Number(sessionStorage.getItem(KEY) || 0);
      if (Date.now() - last > 15000) {
        sessionStorage.setItem(KEY, String(Date.now()));
        window.location.reload();
      }
      return;
    }

    // Report anything else. A broken page used to be invisible — the visitor
    // saw this screen, left, and nobody found out. Stale chunks are excluded
    // above: they resolve themselves on the reload and would be pure noise.
    try {
      fetch("/api/client-error", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: msg.slice(0, 500),
          digest: error?.digest,
          path: window.location.pathname + window.location.search,
          ua: navigator.userAgent,
        }),
        keepalive: true,
      }).catch(() => {});
    } catch {
      /* reporting must never break the error screen itself */
    }
  }, [error]);

  const box: React.CSSProperties = {
    minHeight: "100dvh",
    display: "grid",
    placeItems: "center",
    padding: "1.5rem",
    background: "#0a1a2b",
    color: "#fff",
    textAlign: "center",
    fontFamily: "system-ui, -apple-system, sans-serif",
  };
  const btn: React.CSSProperties = {
    padding: ".6rem 1.1rem",
    borderRadius: "999px",
    fontWeight: 700,
    fontSize: ".95rem",
    cursor: "pointer",
    border: "none",
  };

  return (
    <div style={box}>
      <div style={{ maxWidth: "26rem" }}>
        <div style={{ fontSize: "2.5rem" }}>⚠️</div>
        <h1 style={{ marginTop: ".75rem", fontSize: "1.4rem", fontWeight: 800 }}>
          هەڵەیەک ڕوویدا
        </h1>
        <p style={{ marginTop: ".5rem", opacity: 0.7, fontSize: ".95rem" }}>
          Something went wrong. Please try again.
        </p>
        <div
          style={{
            marginTop: "1.25rem",
            display: "flex",
            gap: ".5rem",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <button
            onClick={reset}
            style={{ ...btn, background: "#DFB250", color: "#122b45" }}
          >
            دووبارە هەوڵبدە · Try again
          </button>
          <button
            onClick={() => window.location.reload()}
            style={{
              ...btn,
              background: "transparent",
              color: "#fff",
              border: "1px solid rgba(255,255,255,.25)",
            }}
          >
            نوێکردنەوە · Reload
          </button>
        </div>
      </div>
    </div>
  );
}
