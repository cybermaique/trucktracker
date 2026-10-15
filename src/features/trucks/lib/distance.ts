import type { Coordinates, Truck, TruckWithDistance } from "../types";

const EARTH_RADIUS_KM = 6371;
const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

/** Great-circle distance between two points (Haversine formula), in km. */
export function distanceInKm(from: Coordinates, to: Coordinates): number {
  const dLat = toRadians(to.latitude - from.latitude);
  const dLon = toRadians(to.longitude - from.longitude);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(from.latitude)) *
      Math.cos(toRadians(to.latitude)) *
      Math.sin(dLon / 2) ** 2;

  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Adds the distance from `origin` to each truck, nearest first. */
export const withDistanceFrom = (
  trucks: readonly Truck[],
  origin: Coordinates
): TruckWithDistance[] =>
  trucks
    .map((truck) => ({
      ...truck,
      distanceKm: distanceInKm(origin, truck.coordinates),
    }))
    .sort((a, b) => a.distanceKm - b.distanceKm);
