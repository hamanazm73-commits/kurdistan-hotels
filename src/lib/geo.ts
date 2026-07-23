import type { Hotel } from "./types";

/** Approximate centre of each city we serve (lat, lng). Used to place hotels on
    the map. Hotels are spread out a little around the centre so they don't stack
    exactly on top of each other. */
export const CITY_COORDS: Record<string, [number, number]> = {
  Dukan: [35.955, 44.955],
  Erbil: [36.191, 44.009],
  Sulaymaniyah: [35.561, 45.437],
  Duhok: [36.867, 42.988],
  Halabja: [35.177, 45.986],
  Kirkuk: [35.468, 44.392],
};

/** Centre of the region, used as the map's starting view. */
export const KURDISTAN_CENTER: [number, number] = [35.9, 44.5];

/** A small, STABLE offset derived from the hotel id, so several hotels in the
    same city fan out around its centre instead of overlapping. ~±1.5 km. */
function jitter(id: string): [number, number] {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  const dLat = ((h % 1000) / 1000 - 0.5) * 0.03;
  const dLng = (((h >>> 10) % 1000) / 1000 - 0.5) * 0.03;
  return [dLat, dLng];
}

/** Where to place a hotel on the map: its exact coordinates when the owner has
    set them, otherwise near its city centre. Null when neither is known. */
export function hotelLatLng(
  h: Pick<Hotel, "id" | "city" | "lat" | "lng">,
): [number, number] | null {
  if (typeof h.lat === "number" && typeof h.lng === "number") {
    return [h.lat, h.lng];
  }
  const c = CITY_COORDS[h.city];
  if (!c) return null;
  const [dLat, dLng] = jitter(h.id);
  return [c[0] + dLat, c[1] + dLng];
}

/**
 * Pull coordinates out of whatever the owner pastes: a plain "36.19, 44.01",
 * or a Google Maps URL containing "@lat,lng" / "?q=lat,lng". Short share links
 * (maps.app.goo.gl) carry no coordinates, so those return null.
 */
export function parseLatLng(
  input: string,
): { lat: number; lng: number } | null {
  const s = (input || "").trim();
  if (!s) return null;
  const num = String.raw`(-?\d{1,3}(?:\.\d+)?)`;
  const m =
    s.match(new RegExp(`@${num},\\s*${num}`)) ||
    s.match(new RegExp(`[?&](?:q|ll|center|destination)=${num},\\s*${num}`)) ||
    s.match(new RegExp(`^${num}\\s*[, ]\\s*${num}$`));
  if (!m) return null;
  const lat = Number(m[1]);
  const lng = Number(m[2]);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;
  return { lat, lng };
}
