import type { Coordinates } from "@/lib/coordinates";

export type { Coordinates };

export interface Truck {
  id: string;
  identifier: string;
  licensePlate: string;
  trackerSerialNumber: string;
  coordinates: Coordinates;
  /** Data URL of the uploaded photo, if any. */
  imageUrl: string | null;
  /** Date-only ISO string (`YYYY-MM-DD`). */
  startDate: string;
}

export type TruckInput = Omit<Truck, "id">;

export interface TruckWithDistance extends Truck {
  /** Great-circle distance from the user, in kilometers. */
  distanceKm: number;
}
