"use client";

import { useEffect } from "react";

/** Form fields keep their context menu so guests can still paste/select
    (e.g. long-press to paste a phone number into the booking form). */
function isEditable(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  if (!el || !el.tagName) return false;
  return (
    el.tagName === "INPUT" ||
    el.tagName === "TEXTAREA" ||
    el.isContentEditable === true
  );
}

export function SiteProtection() {
  useEffect(() => {
    // Block right-click / long-press menu, except inside form fields
    const noContext = (e: MouseEvent) => {
      if (!isEditable(e.target)) e.preventDefault();
    };

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
