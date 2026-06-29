export type Lang = "ckb" | "en" | "ar";

export type Role = "owner" | "admin";

export interface RoomType {
  type: string;
  price: number;
}

export interface Discount {
  active: boolean;
  /** price before the discount */
  oldPrice: number;
  /** price now */
  newPrice: number;
}

export interface Hotel {
  id: string;
  name: string;
  city: string;
  /** base nightly price (used when there is no discount) */
  price: number;
  rating: number;
  image: string;
  features: string[];
  rooms: RoomType[];
  available: number;
  featured: boolean;
  recommended: boolean;
  discount: Discount;
  createdAt?: number;
}

export type HotelInput = Omit<Hotel, "id">;

export interface Booking {
  hotel: string;
  name: string;
  phone: string;
  roomType: string;
  roomPrice: number;
  checkIn: string;
  nights: number;
  createdAt?: number;
}

export interface AdminRecord {
  email: string;
  role: Role;
  enabled: boolean;
  addedBy?: string;
  createdAt?: number;
}

/** the price a hotel is actually sold at right now */
export function effectivePrice(h: Pick<Hotel, "price" | "discount">): number {
  return h.discount?.active ? h.discount.newPrice : h.price;
}
