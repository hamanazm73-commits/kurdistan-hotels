import { getPublicHotels, trimForList } from "@/lib/hotels-server";
import { MapClient } from "./map-client";

// new hotels should turn up on the map without waiting for a deploy
export const revalidate = 3600;

/**
 * The map, seeded on the server. The page itself is a server component so the
 * pins are ready the moment Leaflet finishes loading, rather than waiting for
 * Firestore to answer after the bundle has booted.
 */
export default async function MapPage() {
  const hotels = await getPublicHotels();
  return <MapClient initialHotels={hotels.map(trimForList)} />;
}
