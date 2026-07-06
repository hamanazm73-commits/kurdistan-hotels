"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { useI18n } from "./i18n";
import { formatPrice } from "./types";
import { getSettings } from "./hotels-db";

/** Fallback IQD-per-USD until the owner sets the market rate in the admin.
    (Kurdistan market rate, roughly — the owner keeps it current.) */
export const DEFAULT_IQD_PER_USD = 1500;

export interface CurrencyInfo {
  code: string;
  flag: string;
}

/** Currencies a visitor can view prices in. IQD is the base (stored) currency. */
export const CURRENCIES: CurrencyInfo[] = [
  { code: "IQD", flag: "🇮🇶" },
  { code: "USD", flag: "🇺🇸" },
  { code: "EUR", flag: "🇪🇺" },
  { code: "GBP", flag: "🇬🇧" },
  { code: "TRY", flag: "🇹🇷" },
  { code: "AED", flag: "🇦🇪" },
];

interface CurrencyValue {
  currency: string;
  setCurrency: (c: string) => void;
  /** IQD → currency multipliers from the live market, or null before they load */
  rates: Record<string, number> | null;
  /** UTC date string of the rate snapshot */
  updatedAt: string | null;
  /** Format an IQD amount in the selected currency (converts at the live rate). */
  format: (iqd: number) => string;
}

const CurrencyContext = createContext<CurrencyValue | null>(null);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const { lang } = useI18n();
  const [currency, setCurrencyState] = useState("IQD");
  const [rates, setRates] = useState<Record<string, number> | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  // Owner-set market rate (IQD per 1 USD), the anchor for the IQD peg.
  const [iqdPerUsd, setIqdPerUsd] = useState(DEFAULT_IQD_PER_USD);

  useEffect(() => {
    let alive = true;
    getSettings().then((s) => {
      if (alive && s.iqdPerUsd && s.iqdPerUsd > 0) setIqdPerUsd(s.iqdPerUsd);
    });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    // hydrate the saved choice after mount (avoids SSR hydration mismatch)
    const saved = localStorage.getItem("currency");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (saved) setCurrencyState(saved);
  }, []);

  // Live market rates (base IQD), fetched via our own cached API route.
  useEffect(() => {
    let alive = true;
    fetch("/api/rates")
      .then((r) => r.json())
      .then((d) => {
        if (alive && d?.rates) {
          setRates(d.rates);
          setUpdatedAt(d.date ?? null);
        }
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  const setCurrency = useCallback((c: string) => {
    setCurrencyState(c);
    localStorage.setItem("currency", c);
  }, []);

  const money = (amount: number, cur: string) => {
    try {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: cur,
        maximumFractionDigits: 0,
      }).format(amount);
    } catch {
      return `${Math.round(amount).toLocaleString("en-US")} ${cur}`;
    }
  };

  const format = useCallback(
    (iqd: number): string => {
      if (currency === "IQD") return formatPrice(iqd, lang);
      // The market rate anchors the IQD→USD conversion (forex only has the
      // official rate, which is off for the Kurdistan market).
      const usd = iqd / iqdPerUsd;
      if (currency === "USD") return money(usd, "USD");
      // Other currencies: convert USD→target with the accurate forex cross-rate.
      if (!rates || !rates[currency] || !rates.USD)
        return formatPrice(iqd, lang);
      return money(usd * (rates[currency] / rates.USD), currency);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currency, rates, iqdPerUsd, lang],
  );

  return (
    <CurrencyContext.Provider
      value={{ currency, setCurrency, rates, updatedAt, format }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used within CurrencyProvider");
  return ctx;
}
