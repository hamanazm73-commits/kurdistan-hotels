"use client";

import { useEffect } from "react";

export function SiteProtection() {
  useEffect(() => {
    // Block right-click
    const noContext = (e: MouseEvent) => e.preventDefault();

    // Block DevTools keyboard shortcuts
    const noKeys = (e: KeyboardEvent) => {
      if (e.key === "F12") { e.preventDefault(); return false; }

      if (e.ctrlKey || e.metaKey) {
        // Ctrl+U (view source) · Ctrl+S (save page)
        if (["u", "U", "s", "S"].includes(e.key)) {
          e.preventDefault(); return false;
        }
        // Ctrl+Shift+I / J / C (DevTools panels)
        if (e.shiftKey && ["i", "I", "j", "J", "c", "C"].includes(e.key)) {
          e.preventDefault(); return false;
        }
      }
    };

    document.addEventListener("contextmenu", noContext);
    document.addEventListener("keydown", noKeys);

    return () => {
      document.removeEventListener("contextmenu", noContext);
      document.removeEventListener("keydown", noKeys);
    };
  }, []);

  return null;
}
