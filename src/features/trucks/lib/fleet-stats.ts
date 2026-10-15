import type { TruckWithDistance } from "../types";

const DISTANCE_BANDS_KM = [
  { label: "Até 500 km", max: 500 },
  { label: "500 a 1.000 km", max: 1000 },
  { label: "1.000 a 2.000 km", max: 2000 },
  { label: "Mais de 2.000 km", max: Infinity },
] as const;

export interface FleetStats {
  total: number;
  nearest: TruckWithDistance | null;
  averageDistanceKm: number | null;
  withinRadius: number;
  /** Most recent `startDate` (YYYY-MM-DD), or null for an empty fleet. */
  latestStartDate: string | null;
  bands: { label: string; count: number }[];
}

export const NEARBY_RADIUS_KM = 500;

/** Aggregates for the overview page; expects trucks sorted by distance. */
export function computeFleetStats(
  trucks: readonly TruckWithDistance[]
): FleetStats {
  const total = trucks.length;
  const totalDistance = trucks.reduce(
    (sum, truck) => sum + truck.distanceKm,
    0
  );

  const bands = DISTANCE_BANDS_KM.map(({ label }) => ({ label, count: 0 }));
  for (const truck of trucks) {
    const index = DISTANCE_BANDS_KM.findIndex(
      ({ max }) => truck.distanceKm <= max
    );
    const band = bands[index];
    if (band) band.count += 1;
  }

  return {
    total,
    nearest: trucks[0] ?? null,
    averageDistanceKm: total ? totalDistance / total : null,
    withinRadius: trucks.filter((truck) => truck.distanceKm <= NEARBY_RADIUS_KM)
      .length,
    latestStartDate:
      trucks
        .map((truck) => truck.startDate)
        .sort()
        .at(-1) ?? null,
    bands,
  };
}
