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

/** Smallest bounding box containing every point, or `null` when empty. */
export function boundsOf(points: readonly Coordinates[]): LngLatBounds | null {
  if (points.length === 0) return null;

  const longitudes = points.map((point) => point.longitude);
  const latitudes = points.map((point) => point.latitude);

  return [
    [Math.min(...longitudes), Math.min(...latitudes)],
    [Math.max(...longitudes), Math.max(...latitudes)],
  ];
}
