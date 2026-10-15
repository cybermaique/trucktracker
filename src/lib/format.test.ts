import { describe, expect, it } from "vitest";
import {
  formatCoordinate,
  formatDate,
  formatDistance,
  todayIsoDate,
} from "./format";

describe("format", () => {
  it.each([
    [0.85, "850 m"],
    [3.24, "3,2 km"],
    [1245.4, "1.245 km"],
  ])("formats %s km as %s", (km, expected) => {
    expect(formatDistance(km)).toBe(expected);
  });

  it("formats date-only strings without timezone shifts", () => {
    expect(formatDate("2024-01-01")).toBe("01/01/2024");
  });

  it("formats coordinates with five decimals", () => {
    expect(formatCoordinate(-23.5)).toBe("-23,50000");
  });

  it("returns today as YYYY-MM-DD", () => {
    expect(todayIsoDate()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
