import type { TruckWithDistance } from "../types";

export interface TruckFilters {
  /** Matches identifier, license plate or tracker serial number. */
  search: string;
  /** Maximum distance from the user, in km. `null` means any distance. */
  radiusKm: number | null;
}

/** Case, accent and punctuation insensitive (`abc1234` matches `ABC-1234`). */
const normalize = (value: string) =>
  value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z\d]/gi, "")
    .toLowerCase();

export function filterTrucks(
  trucks: readonly TruckWithDistance[],
  { search, radiusKm }: TruckFilters
): TruckWithDistance[] {
  const query = normalize(search);

  return trucks.filter(
    (truck) =>
      (radiusKm === null || truck.distanceKm <= radiusKm) &&
      (!query ||
        [truck.identifier, truck.licensePlate, truck.trackerSerialNumber].some(
          (field) => normalize(field).includes(query)
        ))
  );
}
