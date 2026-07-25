"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { getSettings } from "./hotels-db";

interface SiteConfigValue {
  /** while ON: show the "coming soon" notice and disable booking */
  comingSoon: boolean;
  /** while ON: hide every guest-facing price (cards, detail page, map) */
  hidePrices: boolean;
  /** true once the setting has loaded (avoids a banner/price flash) */
  ready: boolean;
}

const Ctx = createContext<SiteConfigValue>({
  comingSoon: false,
  hidePrices: false,
  ready: false,
});

export function SiteConfigProvider({ children }: { children: ReactNode }) {
  const [comingSoon, setComingSoon] = useState(false);
  const [hidePrices, setHidePrices] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;
    getSettings()
      .then((s) => {
        if (!alive) return;
        // Absent is treated as ON — a fresh site starts in setup; the owner
        // turns it off from the dashboard when ready.
        setComingSoon(s.comingSoon !== false);
        // Absent is treated as OFF — prices show by default.
        setHidePrices(s.hidePrices === true);
        setReady(true);
      })
      .catch(() => {
        if (alive) setReady(true);
      });
    return () => {
      alive = false;
    };
  }, []);

  return (
    <Ctx.Provider value={{ comingSoon, hidePrices, ready }}>
      {children}
    </Ctx.Provider>
  );
}

export const useSiteConfig = () => useContext(Ctx);
