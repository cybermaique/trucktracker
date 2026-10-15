import type { Feature, LineString } from "geojson";
import { z } from "zod";
import type { Coordinates } from "@/lib/coordinates";
import { decodePolyline } from "./polyline";

/**
 * OSRM car routing hosted by FOSSGIS (the engine behind openstreetmap.org
 * directions): free, keyless and CORS-enabled, fine for a demo's light
 * traffic. Production would point this at a self-hosted OSRM/Valhalla or a
 * commercial provider with truck profiles (weight, height, tolls).
 */
export const ROUTING_BASE_URL =
  "https://routing.openstreetmap.de/routed-car/route/v1/driving";

const routeResponseSchema = z.object({
  code: z.literal("Ok"),
  routes: z
    .array(
      z.object({
        distance: z.number(), // meters
        duration: z.number(), // seconds
        geometry: z.string(), // polyline6
      })
    )
    .min(1),
});

export interface DrivingRoute {
  distanceKm: number;
  durationMinutes: number;
  geometry: Feature<LineString>;
}

export class RoutingError extends Error {}

const toPair = ({ longitude, latitude }: Coordinates) =>
  `${longitude.toFixed(6)},${latitude.toFixed(6)}`;

/** Fastest driving route between two points, following the road network. */
export async function fetchDrivingRoute(
  from: Coordinates,
  to: Coordinates,
  signal?: AbortSignal
): Promise<DrivingRoute> {
  const url = `${ROUTING_BASE_URL}/${toPair(from)};${toPair(to)}?overview=full&geometries=polyline6`;
  const response = await fetch(url, { signal });

  const parsed = routeResponseSchema.safeParse(
    await response.json().catch(() => null)
  );
  if (!response.ok || !parsed.success) {
    throw new RoutingError(`No driving route found (HTTP ${response.status})`);
  }

  const [route] = parsed.data.routes;
  if (!route) throw new RoutingError("No driving route found");

  return {
    distanceKm: route.distance / 1000,
    durationMinutes: route.duration / 60,
    geometry: {
      type: "Feature",
      properties: {},
      geometry: {
        type: "LineString",
        coordinates: decodePolyline(route.geometry),
      },
    },
  };
}
