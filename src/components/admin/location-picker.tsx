"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const pinIcon = L.divIcon({
  className: "",
  html: `<svg width="30" height="30" viewBox="0 0 24 24" style="filter:drop-shadow(0 2px 3px rgba(0,0,0,.4))">
    <path d="M12 2C8.1 2 5 5.1 5 9c0 5 7 13 7 13s7-8 7-13c0-3.9-3.1-7-7-7z" fill="#DFB250" stroke="#15304A" stroke-width="1.4"/>
    <circle cx="12" cy="9" r="2.6" fill="#15304A"/>
  </svg>`,
  iconSize: [30, 30],
  iconAnchor: [15, 28],
});

/**
 * Click (or drag the pin) to set a hotel's exact spot. Calls `onPick` only on
 * a real user action — never on load — so an un-pinned hotel keeps falling
 * back to its city centre until the owner actually places the pin.
 */
export function LocationPicker({
  lat,
  lng,
  center,
  onPick,
}: {
  lat: number | null;
  lng: number | null;
  center: [number, number];
  onPick: (lat: number, lng: number) => void;
}) {
  const holder = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const onPickRef = useRef(onPick);
  onPickRef.current = onPick;

  // Initialise the map once.
  useEffect(() => {
    if (!holder.current || mapRef.current) return;
    const has = lat != null && lng != null;
    const start: [number, number] = has ? [lat, lng] : center;

    const map = L.map(holder.current, { scrollWheelZoom: false }).setView(
      start,
      has ? 15 : 12,
    );
    mapRef.current = map;
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "&copy; OpenStreetMap",
    }).addTo(map);

    const marker = L.marker(start, { icon: pinIcon, draggable: true }).addTo(
      map,
    );
    markerRef.current = marker;

    marker.on("dragend", () => {
      const p = marker.getLatLng();
      onPickRef.current(p.lat, p.lng);
    });
    map.on("click", (e: L.LeafletMouseEvent) => {
      marker.setLatLng(e.latlng);
      onPickRef.current(e.latlng.lat, e.latlng.lng);
    });

    // The map often mounts inside an animating dialog; recalc once settled.
    const id = setTimeout(() => map.invalidateSize(), 250);
    return () => {
      clearTimeout(id);
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
    // Init once — later coord changes are handled by the effect below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reflect coordinates changed elsewhere (e.g. pasted into the text field).
  useEffect(() => {
    const map = mapRef.current;
    const marker = markerRef.current;
    if (!map || !marker || lat == null || lng == null) return;
    const cur = marker.getLatLng();
    if (Math.abs(cur.lat - lat) > 1e-9 || Math.abs(cur.lng - lng) > 1e-9) {
      marker.setLatLng([lat, lng]);
      map.setView([lat, lng], Math.max(map.getZoom(), 14));
    }
  }, [lat, lng]);

  return (
    <div
      ref={holder}
      className="h-64 w-full overflow-hidden rounded-lg border"
    />
  );
}
