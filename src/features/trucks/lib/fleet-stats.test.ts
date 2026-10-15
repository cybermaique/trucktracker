import { describe, expect, it } from "vitest";
import { buildTruck as truck } from "@/test/factories";
import { computeFleetStats } from "./fleet-stats";

describe("computeFleetStats", () => {
  it("aggregates a sorted fleet", () => {
    const stats = computeFleetStats([
      truck({ id: "1", distanceKm: 10, startDate: "2023-05-01" }),
      truck({ id: "2", distanceKm: 700, startDate: "2025-02-11" }),
      truck({ id: "3", distanceKm: 2500, startDate: "2024-09-09" }),
    ]);

    expect(stats).toMatchObject({
      total: 3,
      nearest: expect.objectContaining({ id: "1" }),
      withinRadius: 1,
      latestStartDate: "2025-02-11",
    });
    expect(stats.averageDistanceKm).toBeCloseTo(1070);
    expect(stats.bands.map(({ count }) => count)).toEqual([1, 1, 0, 1]);
  });

  it("handles an empty fleet", () => {
    expect(computeFleetStats([])).toMatchObject({
      total: 0,
      nearest: null,
      averageDistanceKm: null,
      latestStartDate: null,
    });
  });
});
