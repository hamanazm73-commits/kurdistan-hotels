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

  const format = useCallback(
    (iqd: number): string => {
      // Base currency, or rates not ready → show IQD in the current language.
      if (currency === "IQD" || !rates || !rates[currency])
        return formatPrice(iqd, lang);
      const converted = iqd * rates[currency];
      try {
        return new Intl.NumberFormat("en-US", {
          style: "currency",
          currency,
          maximumFractionDigits: 0,
        }).format(converted);
      } catch {
        return `${Math.round(converted).toLocaleString("en-US")} ${currency}`;
      }
    },
    [currency, rates, lang],
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
