import { vi } from "vitest";
import type { Coordinates } from "@/lib/coordinates";

/** Position used by tests that grant geolocation (Campinas, SP). */
export const CAMPINAS: Coordinates = {
  latitude: -22.9056,
  longitude: -47.0608,
};

// jsdom has no Geolocation API, which the app treats as "unavailable".
// These helpers install one; `resetGeolocation` runs after every test.
const define = (geolocation: Partial<Geolocation>) =>
  Object.defineProperty(navigator, "geolocation", {
    value: geolocation,
    configurable: true,
  });

export const grantGeolocation = (coordinates: Coordinates = CAMPINAS) =>
  define({
    getCurrentPosition: vi.fn((success: PositionCallback) =>
      success({ coords: coordinates } as GeolocationPosition)
    ),
  });

export const denyGeolocation = () =>
  define({
    getCurrentPosition: vi.fn(
      (_success: PositionCallback, error?: PositionErrorCallback | null) =>
        error?.({ code: 1 } as GeolocationPositionError)
    ),
  });

export const resetGeolocation = () => {
  Reflect.deleteProperty(navigator, "geolocation");
};
