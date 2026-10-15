import { queryOptions, useQuery } from "@tanstack/react-query";
import type { Coordinates } from "@/lib/coordinates";

/** São Paulo (SP): reference point when the real position is unavailable. */
export const FALLBACK_LOCATION = {
  coordinates: { latitude: -23.55052, longitude: -46.63331 },
  label: "São Paulo (SP)",
} as const;

export interface UserLocation {
  coordinates: Coordinates;
  /** `device` when the browser shared the position, `fallback` otherwise. */
  source: "device" | "fallback";
}

const GEOLOCATION_TIMEOUT_MS = 10_000;

/**
 * Never rejects: denied permission, timeouts and missing APIs resolve to the
 * fallback location, so distance-based features always have an origin.
 */
export function resolveUserLocation(): Promise<UserLocation> {
  const fallback: UserLocation = {
    coordinates: FALLBACK_LOCATION.coordinates,
    source: "fallback",
  };

  if (!("geolocation" in navigator)) return Promise.resolve(fallback);

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      ({ coords }) =>
        resolve({
          coordinates: {
            latitude: coords.latitude,
            longitude: coords.longitude,
          },
          source: "device",
        }),
      () => resolve(fallback),
      { timeout: GEOLOCATION_TIMEOUT_MS, maximumAge: 5 * 60_000 }
    );
  });
}

export const userLocationQueryOptions = queryOptions({
  queryKey: ["user-location"],
  queryFn: resolveUserLocation,
  staleTime: Infinity,
  gcTime: Infinity,
  retry: false,
});

export const useUserLocation = () => useQuery(userLocationQueryOptions);
