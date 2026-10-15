import { useUserLocation } from "@/features/location/use-user-location";
import { useTrucks } from "../api/queries";
import { withDistanceFrom } from "../lib/distance";

/**
 * Trucks enriched with their distance from the user, nearest first.
 * Distances need both the API data and an origin (real or fallback), so the
 * fleet is only ready once both queries resolve.
 *
 * No manual memoization: the React Compiler memoizes derived values.
 */
export function useFleet() {
  const trucksQuery = useTrucks();
  const locationQuery = useUserLocation();
  const location = locationQuery.data;

  const trucks =
    trucksQuery.data && location
      ? withDistanceFrom(trucksQuery.data, location.coordinates)
      : [];

  return {
    trucks,
    location,
    isPending: trucksQuery.isPending || locationQuery.isPending,
    isError: trucksQuery.isError,
    refetch: trucksQuery.refetch,
  };
}
