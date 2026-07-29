import { NextResponse } from "next/server";
import { rateLimit, clientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";

/**
 * Turn an address into coordinates, so an owner types where their hotel is
 * instead of hunting for lat/lng. Uses OpenStreetMap's Nominatim — the same
 * data behind our map tiles. Called from the server so we can send the
 * User-Agent their policy requires and keep the request off the client.
 */
export async function GET(req: Request) {
  const ip = clientIp(req);
  // Nominatim asks for at most ~1 request/second; this keeps us well inside it
  const rl = rateLimit(`geocode:${ip}`, { limit: 12, windowMs: 60_000 });
  if (!rl.ok) return NextResponse.json({ error: "rate_limited" }, { status: 429 });

  const url = new URL(req.url);
  const q = (url.searchParams.get("q") || "").trim();
  // an extra hint (usually the hotel's city) sharpens a bare street name
  const near = (url.searchParams.get("near") || "").trim();
  if (q.length < 3) return NextResponse.json({ results: [] });

  const query = [q, near, "Kurdistan, Iraq"].filter(Boolean).join(", ");
  const api = new URL("https://nominatim.openstreetmap.org/search");
  api.searchParams.set("q", query);
  api.searchParams.set("format", "jsonv2");
  api.searchParams.set("limit", "5");
  api.searchParams.set("countrycodes", "iq");
  api.searchParams.set("addressdetails", "0");

  try {
    const res = await fetch(api, {
      headers: {
        "User-Agent": "KurdistanHotels/1.0 (https://hotelskurdistan.com)",
        "Accept-Language": "ckb,ar,en",
      },
      // the same address resolves to the same place; let the CDN keep it a day
      next: { revalidate: 86_400 },
    });
    if (!res.ok) return NextResponse.json({ results: [] });
    const raw = (await res.json()) as {
      lat: string;
      lon: string;
      display_name: string;
    }[];
    const results = raw
      .map((r) => ({
        lat: Number(r.lat),
        lng: Number(r.lon),
        label: String(r.display_name ?? ""),
      }))
      .filter((r) => Number.isFinite(r.lat) && Number.isFinite(r.lng));
    return NextResponse.json({ results });
  } catch {
    return NextResponse.json({ results: [] });
  }
}
