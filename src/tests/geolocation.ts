import { vi } from "vitest";
import { UserLocation } from "../interfaces/user-location";

/** Replaces `navigator.geolocation` with a stub that grants the given position. */
export const mockGeolocationSuccess = (location: UserLocation) =>
  vi.stubGlobal("navigator", {
    ...navigator,
    geolocation: {
      getCurrentPosition: vi.fn((success: PositionCallback) =>
        success({ coords: location } as GeolocationPosition)
      ),
    },
  });

/** Replaces `navigator.geolocation` with a stub that denies permission. */
export const mockGeolocationDenied = () =>
  vi.stubGlobal("navigator", {
    ...navigator,
    geolocation: {
      getCurrentPosition: vi.fn(
        (_success: PositionCallback, error?: PositionErrorCallback | null) =>
          error?.({
            code: 1,
            message: "User denied",
          } as GeolocationPositionError)
      ),
    },
  });
