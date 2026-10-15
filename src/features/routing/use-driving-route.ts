import { useQuery } from "@tanstack/react-query";
import type { Coordinates } from "@/lib/coordinates";
import { fetchDrivingRoute } from "./routing-api";

// ~1 m precision: GPS jitter must not create new cache entries.
const key = (point?: Coordinates) =>
  point ? `${point.latitude.toFixed(5)},${point.longitude.toFixed(5)}` : null;

/**
 * Road route from `from` to `to`, fetched on demand and cached for the
 * session (routes don't change while the app is open). Callers fall back to
 * the straight line while it loads or when the routing service fails.
 */
export function useDrivingRoute(from?: Coordinates, to?: Coordinates) {
  return useQuery({
    queryKey: ["driving-route", key(from), key(to)],
    queryFn: ({ signal }) => {
      if (!from || !to) throw new Error("Both points are required");
      return fetchDrivingRoute(from, to, signal);
    },
    enabled: Boolean(from && to),
    staleTime: Infinity,
    retry: 1,
  });
}
