import { describe, expect, it } from "vitest";
import type { Truck } from "../types";
import { buildTruck as truck } from "@/test/factories";
import { distanceInKm, withDistanceFrom } from "./distance";

const SAO_PAULO = { latitude: -23.55052, longitude: -46.633308 };
const RIO = { latitude: -22.9068, longitude: -43.1729 };

describe("distanceInKm", () => {
  it("computes the great-circle distance", () => {
    expect(distanceInKm(SAO_PAULO, RIO)).toBeCloseTo(360.75, 1);
  });

  it("is zero for the same point and symmetric", () => {
    expect(distanceInKm(SAO_PAULO, SAO_PAULO)).toBe(0);
    expect(distanceInKm(RIO, SAO_PAULO)).toBeCloseTo(
      distanceInKm(SAO_PAULO, RIO)
    );
  });
});

describe("withDistanceFrom", () => {
  it("adds distances and sorts nearest first", () => {
    const trucks: Truck[] = [
      truck({ id: "rio", coordinates: RIO }),
      truck({ id: "sp", coordinates: SAO_PAULO }),
    ];

    const result = withDistanceFrom(trucks, SAO_PAULO);

    expect(result.map(({ id }) => id)).toEqual(["sp", "rio"]);
    expect(result[1]?.distanceKm).toBeCloseTo(360.75, 1);
  });
});
