import {
  TruckApiResponse,
  TruckFilters,
  TruckWithDistance,
} from "../interfaces/truck";
import { UserLocation } from "../interfaces/user-location";

const EARTH_RADIUS_KM = 6371;

export const getTruckCellValue = (
  truck: TruckWithDistance,
  key: string
): string => {
  switch (key) {
    case "distance":
      return truck.distance.toFixed(2);
    case "coordinates.latitude":
      return truck.coordinates.latitude.toString();
    case "coordinates.longitude":
      return truck.coordinates.longitude.toString();
    default:
      return String(truck[key as keyof TruckWithDistance] ?? "");
  }
};

/**
 * Normalizes a Brazilian license plate while the user types.
 * Old format: `ABC-1234` · Mercosul format: `ABC1D23`.
 */
export const formatLicensePlate = (value: string): string => {
  const formatted = value
    .toUpperCase()
    .replace(/[^A-Z\d]/g, "")
    .slice(0, 7);

  if (/^[A-Z]{3}\d{4}$/.test(formatted)) {
    return `${formatted.slice(0, 3)}-${formatted.slice(3)}`;
  }

  return formatted;
};

/** Great-circle distance in kilometers (Haversine formula). */
export const getDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) => {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const includesIgnoringCase = (value: string, search: string) =>
  value.toLowerCase().includes(search.toLowerCase());

export const sortAndFilterTrucks = (
  trucks: TruckApiResponse[],
  appliedFilters: Partial<TruckFilters>,
  isDistanceDescending: boolean,
  userLocation: UserLocation
): TruckWithDistance[] => {
  const { licensePlate, trackerSerialNumber, maxDistance } = appliedFilters;
  const maxDistanceKm = maxDistance ? parseFloat(maxDistance) : Infinity;

  return trucks
    .map((truck) => ({
      ...truck,
      distance: getDistance(
        userLocation.latitude,
        userLocation.longitude,
        truck.coordinates.latitude,
        truck.coordinates.longitude
      ),
    }))
    .filter(
      (truck) =>
        (!licensePlate ||
          includesIgnoringCase(truck.license_plate, licensePlate)) &&
        (!trackerSerialNumber ||
          includesIgnoringCase(
            truck.tracker_serial_number,
            trackerSerialNumber
          )) &&
        truck.distance <= maxDistanceKm
    )
    .sort((a, b) =>
      isDistanceDescending ? b.distance - a.distance : a.distance - b.distance
    );
};
