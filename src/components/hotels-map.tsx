"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { KURDISTAN_CENTER } from "@/lib/geo";

export type MapPoint = {
  id: string;
  lat: number;
  lng: number;
  name: string;
  cityLabel: string;
  priceLabel: string;
  image: string;
  rating: number;
};

const esc = (s: string) =>
  s.replace(/[<>&"]/g, (c) =>
    c === "<" ? "&lt;" : c === ">" ? "&gt;" : c === "&" ? "&amp;" : "&quot;",
  );

/** A gold teardrop pin (a DivIcon, so no external marker images are needed). */
const pinIcon = L.divIcon({
  className: "",
  html: `<svg width="30" height="30" viewBox="0 0 24 24" style="filter:drop-shadow(0 2px 3px rgba(0,0,0,.4))">
    <path d="M12 2C8.1 2 5 5.1 5 9c0 5 7 13 7 13s7-8 7-13c0-3.9-3.1-7-7-7z" fill="#DFB250" stroke="#15304A" stroke-width="1.4"/>
    <circle cx="12" cy="9" r="2.6" fill="#15304A"/>
  </svg>`,
  iconSize: [30, 30],
  iconAnchor: [15, 28],
  popupAnchor: [0, -26],
});

export function HotelsMap({ points }: { points: MapPoint[] }) {
  const holder = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!holder.current || mapRef.current) return;

    const map = L.map(holder.current, { scrollWheelZoom: false }).setView(
      KURDISTAN_CENTER,
      7,
    );
    mapRef.current = map;

    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "&copy; OpenStreetMap",
    }).addTo(map);

    const markers: L.Marker[] = [];
    for (const p of points) {
      const m = L.marker([p.lat, p.lng], { icon: pinIcon }).addTo(map);
      m.bindPopup(
        `<a href="/hotels/${encodeURIComponent(p.id)}" style="text-decoration:none;color:inherit;display:block;width:180px;">
          <img src="${esc(p.image)}" alt="" style="width:100%;height:96px;object-fit:cover;border-radius:8px;display:block;margin-bottom:6px;" onerror="this.style.display='none'"/>
          <div style="font-weight:700;font-size:14px;line-height:1.3;">${esc(p.name)}</div>
          <div style="color:#64748b;font-size:12px;margin-top:2px;">📍 ${esc(p.cityLabel)} · ⭐ ${p.rating.toFixed(1)}</div>
          <div style="color:#15304A;font-weight:800;font-size:14px;margin-top:4px;">${esc(p.priceLabel)}</div>
        </a>`,
      );
      markers.push(m);
    }

    if (markers.length) {
      map.fitBounds(L.featureGroup(markers).getBounds().pad(0.25));
    }

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [points]);

  return (
    <div
      ref={holder}
      className="z-0 h-[72vh] w-full overflow-hidden rounded-2xl border shadow-sm"
    />
  );
}
