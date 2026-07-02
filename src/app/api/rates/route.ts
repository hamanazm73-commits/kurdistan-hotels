import { NextResponse } from "next/server";

export const runtime = "nodejs";

const WANTED = ["IQD", "USD", "EUR", "GBP", "TRY", "AED"];
const TTL = 6 * 60 * 60 * 1000; // rates update ~daily; cache for 6h

let cache: { rates: Record<string, number>; date: string; at: number } | null =
  null;

export async function GET() {
  if (cache && Date.now() - cache.at < TTL) {
    return NextResponse.json({ rates: cache.rates, date: cache.date, cached: true });
  }
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 8000);
    const res = await fetch("https://open.er-api.com/v6/latest/IQD", {
      signal: ctrl.signal,
    });
    clearTimeout(timer);
    if (!res.ok) throw new Error("rates_fetch_failed");
    const data = (await res.json()) as {
      rates?: Record<string, number>;
      time_last_update_utc?: string;
    };
    const all = data.rates ?? {};
    const rates: Record<string, number> = {};
    for (const c of WANTED) if (typeof all[c] === "number") rates[c] = all[c];
    const date = data.time_last_update_utc ?? new Date().toUTCString();
    cache = { rates, date, at: Date.now() };
    return NextResponse.json({ rates, date });
  } catch {
    // Serve stale rates if we have any; otherwise report unavailable.
    if (cache)
      return NextResponse.json({
        rates: cache.rates,
        date: cache.date,
        cached: true,
        stale: true,
      });
    return NextResponse.json({ error: "rates_unavailable" }, { status: 502 });
  }
}
