"use client";

import { useEffect } from "react";

/** Last-resort boundary if the root layout itself throws. Renders its own
    <html>/<body>. Reloads once on a stale-chunk error after a deploy. */
export default function GlobalError({
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
    }
  }, [error]);

  return (
    <html lang="ckb" dir="rtl">
      <body style={{ margin: 0 }}>
        <div
          style={{
            minHeight: "100dvh",
            display: "grid",
            placeItems: "center",
            padding: "1.5rem",
            background: "#0a1a2b",
            color: "#fff",
            textAlign: "center",
            fontFamily: "system-ui, -apple-system, sans-serif",
          }}
        >
          <div style={{ maxWidth: "26rem" }}>
            <div style={{ fontSize: "2.5rem" }}>⚠️</div>
            <h1
              style={{ marginTop: ".75rem", fontSize: "1.4rem", fontWeight: 800 }}
            >
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
                style={{
                  padding: ".6rem 1.1rem",
                  borderRadius: "999px",
                  fontWeight: 700,
                  border: "none",
                  cursor: "pointer",
                  background: "#DFB250",
                  color: "#122b45",
                }}
              >
                دووبارە هەوڵبدە · Try again
              </button>
              <button
                onClick={() => window.location.reload()}
                style={{
                  padding: ".6rem 1.1rem",
                  borderRadius: "999px",
                  fontWeight: 700,
                  cursor: "pointer",
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
      </body>
    </html>
  );
}
