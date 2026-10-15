import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import useUserLocation from ".";
import { DEFAULT_LOCATION } from "../../constants/map";
import { useSnackbarStore } from "../../stores/snackbar";
import {
  mockGeolocationDenied,
  mockGeolocationSuccess,
} from "../../tests/geolocation";

describe("useUserLocation", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    useSnackbarStore.getState().closeSnackbar();
  });

  it("should return the user's location when permission is granted", async () => {
    mockGeolocationSuccess({ latitude: 40.7128, longitude: -74.006 });

    const { result } = renderHook(() => useUserLocation());

    await waitFor(() => expect(result.current.status).toBe("granted"));
    expect(result.current.location).toEqual({
      latitude: 40.7128,
      longitude: -74.006,
    });
  });

  it("should fall back to the default location and warn the user when denied", async () => {
    mockGeolocationDenied();

    const { result } = renderHook(() => useUserLocation());

    await waitFor(() => expect(result.current.status).toBe("fallback"));
    expect(result.current.location).toEqual(DEFAULT_LOCATION);
    expect(useSnackbarStore.getState()).toMatchObject({
      open: true,
      severity: "warning",
    });
  });

  it("should fall back when the Geolocation API is unavailable", async () => {
    vi.stubGlobal("navigator", {});

    const { result } = renderHook(() => useUserLocation());

    await waitFor(() => expect(result.current.status).toBe("fallback"));
    expect(result.current.location).toEqual(DEFAULT_LOCATION);
  });
});
