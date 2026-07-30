import { getPublicHotels, trimForList } from "@/lib/hotels-server";
import { FavoritesClient } from "./favorites-client";

// which hotels exist changes rarely; which ones are saved is read on the device
export const revalidate = 3600;

/**
 * Saved hotels. The list of hotels comes from the server so a visitor's
 * favourites appear immediately — only the ids themselves live on the device.
 */
export default async function FavoritesPage() {
  const hotels = await getPublicHotels();
  return <FavoritesClient initialHotels={hotels.map(trimForList)} />;
}
