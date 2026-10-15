import circle from "@turf/circle";
import type {
  Feature,
  FeatureCollection,
  LineString,
  Point,
  Polygon,
  Position,
} from "geojson";
import type { Coordinates, Truck } from "../types";

export interface TruckFeatureProperties {
  id: string;
  identifier: string;
  licensePlate: string;
}

const toPosition = ({ longitude, latitude }: Coordinates): Position => [
  longitude,
  latitude,
];

/** Trucks as GeoJSON points, consumed by the clustered map source. */
export const trucksToFeatureCollection = (
  trucks: readonly Truck[]
): FeatureCollection<Point, TruckFeatureProperties> => ({
  type: "FeatureCollection",
  features: trucks.map((truck) => ({
    type: "Feature",
    id: truck.id,
    geometry: { type: "Point", coordinates: toPosition(truck.coordinates) },
    properties: {
      id: truck.id,
      identifier: truck.identifier,
      licensePlate: truck.licensePlate,
    },
  })),
});

/** Polygon approximating a circle of `radiusKm` around `center`. */
export const radiusPolygon = (
  center: Coordinates,
  radiusKm: number
): Feature<Polygon> =>
  circle(toPosition(center), radiusKm, { steps: 96, units: "kilometers" });

/** Straight segment from the user to the selected truck. */
export const connectionLine = (
  from: Coordinates,
  to: Coordinates
): Feature<LineString> => ({
  type: "Feature",
  properties: {},
  geometry: {
    type: "LineString",
    coordinates: [toPosition(from), toPosition(to)],
  },
});

export type LngLatBounds = [[number, number], [number, number]];

/**
 * Smallest bounding box containing every point, or `null` when empty.
 * A loop instead of Math.min(...spread): routes can have tens of thousands
 * of points, beyond the engine's argument limit.
 */
export function boundsOf(points: readonly Coordinates[]): LngLatBounds | null {
  const [first, ...rest] = points;
  if (!first) return null;

  let [west, south, east, north] = [
    first.longitude,
    first.latitude,
    first.longitude,
    first.latitude,
  ];
  for (const { longitude, latitude } of rest) {
    west = Math.min(west, longitude);
    east = Math.max(east, longitude);
    south = Math.min(south, latitude);
    north = Math.max(north, latitude);
  }
  return [
    [west, south],
    [east, north],
  ];
}

/** Bounding box of a line string (e.g. a driving route). */
export const lineBounds = ({ geometry }: Feature<LineString>) =>
  boundsOf(
    geometry.coordinates.map(([longitude = 0, latitude = 0]) => ({
      longitude,
      latitude,
    }))
  );
