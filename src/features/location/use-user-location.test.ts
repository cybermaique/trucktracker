import { describe, expect, it } from "vitest";
import {
  CAMPINAS,
  denyGeolocation,
  grantGeolocation,
} from "@/test/geolocation";
import { FALLBACK_LOCATION, resolveUserLocation } from "./use-user-location";

describe("resolveUserLocation", () => {
  it("uses the device position when permission is granted", async () => {
    grantGeolocation();

    await expect(resolveUserLocation()).resolves.toEqual({
      coordinates: CAMPINAS,
      source: "device",
    });
  });

  it("falls back to São Paulo when permission is denied", async () => {
    denyGeolocation();

    await expect(resolveUserLocation()).resolves.toEqual({
      coordinates: FALLBACK_LOCATION.coordinates,
      source: "fallback",
    });
  });

  it("falls back when the Geolocation API is unavailable", async () => {
    await expect(resolveUserLocation()).resolves.toMatchObject({
      source: "fallback",
    });
  });
});
