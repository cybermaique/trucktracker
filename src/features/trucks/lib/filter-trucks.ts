import { matchesSearch } from "@/lib/search";
import type { TruckWithDistance } from "../types";

export interface TruckFilters {
  /** Matches identifier, license plate or tracker serial number. */
  search: string;
  /** Maximum distance from the user, in km. `null` means any distance. */
  radiusKm: number | null;
}

export function filterTrucks(
  trucks: readonly TruckWithDistance[],
  { search, radiusKm }: TruckFilters
): TruckWithDistance[] {
  return trucks.filter(
    (truck) =>
      (radiusKm === null || truck.distanceKm <= radiusKm) &&
      matchesSearch(search, [
        truck.identifier,
        truck.licensePlate,
        truck.trackerSerialNumber,
      ])
  );
}
