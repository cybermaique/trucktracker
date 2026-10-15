import { describe, expect, it } from "vitest";
import {
  formatCoordinate,
  formatDate,
  formatDistance,
  formatDuration,
  formatSince,
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

  it.each([
    [0.2, "1 min"],
    [45, "45 min"],
    [120, "2 h"],
    [107.4, "1 h 47 min"],
  ])("formats %s minutes as %s", (minutes, expected) => {
    expect(formatDuration(minutes)).toBe(expected);
  });

  it("describes how long ago a date was", () => {
    const now = new Date("2026-10-15T12:00:00Z");
    expect(formatSince("2024-02-17", now)).toBe("há 2 anos");
    expect(formatSince("2026-05-01", now)).toBe("há 5 meses");
    expect(formatSince("2026-10-14", now)).toBe("ontem");
  });

  it("returns today as YYYY-MM-DD", () => {
    expect(todayIsoDate()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
