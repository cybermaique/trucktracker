import { describe, expect, it } from "vitest";
import { formatLicensePlate, formatTrackerSerial } from "./license-plate";

describe("formatLicensePlate", () => {
  it.each([
    ["abc1234", "ABC-1234"],
    ["abc-1234", "ABC-1234"],
    ["abc1d23", "ABC1D23"],
    ["ABC 1D23 extra", "ABC1D23"],
    ["ab", "AB"],
  ])("formats %s as %s", (input, expected) => {
    expect(formatLicensePlate(input)).toBe(expected);
  });
});

describe("formatTrackerSerial", () => {
  it("keeps uppercase alphanumerics up to 20 characters", () => {
    expect(formatTrackerSerial("vt-540 sp/01")).toBe("VT540SP01");
    expect(formatTrackerSerial("x".repeat(30))).toHaveLength(20);
  });
});
