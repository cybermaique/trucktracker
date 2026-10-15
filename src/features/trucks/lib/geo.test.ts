import { describe, expect, it } from "vitest";
import type { Truck } from "../types";
import {
  boundsOf,
  connectionLine,
  radiusPolygon,
  trucksToFeatureCollection,
} from "./geo";
import { distanceInKm } from "./distance";

const CENTER = { latitude: -23.55, longitude: -46.63 };

const truck: Truck = {
  id: "7",
  identifier: "Volvo FH 540",
  licensePlate: "ABC-1234",
  trackerSerialNumber: "VT540SP01",
  coordinates: { latitude: -22.9, longitude: -43.17 },
  imageUrl: null,
  startDate: "2024-01-01",
};

describe("geo", () => {
  it("converts trucks into GeoJSON points ([lng, lat] order)", () => {
    const collection = trucksToFeatureCollection([truck]);

    expect(collection.features).toEqual([
      {
        type: "Feature",
        id: "7",
        geometry: { type: "Point", coordinates: [-43.17, -22.9] },
        properties: {
          id: "7",
          identifier: "Volvo FH 540",
          licensePlate: "ABC-1234",
        },
      },
    ]);
  });

  it("builds a circle whose vertices are radiusKm away from the center", () => {
    const ring = radiusPolygon(CENTER, 100).geometry.coordinates[0] ?? [];

    expect(ring.length).toBeGreaterThan(90);
    for (const [longitude = 0, latitude = 0] of ring) {
      expect(distanceInKm(CENTER, { latitude, longitude })).toBeCloseTo(100, 0);
    }
  });

  it("connects two points with a line", () => {
    expect(
      connectionLine(CENTER, truck.coordinates).geometry.coordinates
    ).toEqual([
      [-46.63, -23.55],
      [-43.17, -22.9],
    ]);
  });

  it("computes the bounding box of a set of points", () => {
    expect(boundsOf([CENTER, truck.coordinates])).toEqual([
      [-46.63, -23.55],
      [-43.17, -22.9],
    ]);
    expect(boundsOf([])).toBeNull();
  });
});
