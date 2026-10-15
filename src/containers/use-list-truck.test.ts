import { renderHook } from "@testing-library/react";
import { act } from "react";
import { beforeEach, describe, expect, it, Mock, vi } from "vitest";
import useUserLocation from "../hooks/use-user-location";
import { TruckApiResponse } from "../interfaces/truck";
import { useGetTrucks } from "../services/get-trucks";
import { useSnackbarStore } from "../stores/snackbar";
import { EMPTY_FILTERS } from "./use-truck-filters";
import { useListTruck } from "./use-list-truck";

vi.mock("../services/get-trucks", () => ({ useGetTrucks: vi.fn() }));
vi.mock("../hooks/use-user-location", () => ({ default: vi.fn() }));

const SAO_PAULO = { latitude: -23.55052, longitude: -46.63331 };

const buildTruck = (
  id: string,
  license_plate: string,
  latitude: number,
  longitude: number
): TruckApiResponse => ({
  id,
  identifier: `Caminhão ${id}`,
  license_plate,
  tracker_serial_number: `T${id}0000`,
  coordinates: { latitude, longitude },
  image: "",
  start_date: "2024-01-01T00:00:00Z",
});

const TRUCKS = [
  buildTruck("1", "RIO-0001", -22.9068, -43.1729), // ~360 km
  buildTruck("2", "SPO-0002", -23.5617, -46.6559), // ~2 km
  buildTruck("3", "CWB-0003", -25.4284, -49.2733), // ~340 km
];

const mockApi = (value: Partial<ReturnType<typeof useGetTrucks>>) =>
  (useGetTrucks as Mock).mockReturnValue({
    data: undefined,
    error: undefined,
    isLoading: false,
    ...value,
  });

describe("useListTruck", () => {
  beforeEach(() => {
    useSnackbarStore.getState().closeSnackbar();
    (useUserLocation as Mock).mockReturnValue({
      location: SAO_PAULO,
      status: "granted",
    });
    mockApi({ data: TRUCKS });
  });

  it("should sort trucks by proximity to the user", () => {
    const { result } = renderHook(() => useListTruck(EMPTY_FILTERS));

    expect(result.current.trucks.map(({ id }) => id)).toEqual(["2", "3", "1"]);
    expect(result.current.hasData).toBe(true);
  });

  it("should toggle to descending distance order", () => {
    const { result } = renderHook(() => useListTruck(EMPTY_FILTERS));

    act(() => result.current.setIsDistanceDescending(true));

    expect(result.current.trucks.map(({ id }) => id)).toEqual(["1", "3", "2"]);
  });

  it("should apply the filters", () => {
    const { result } = renderHook(() =>
      useListTruck({ ...EMPTY_FILTERS, maxDistance: "350" })
    );

    expect(result.current.trucks.map(({ id }) => id)).toEqual(["2", "3"]);
  });

  it("should stay loading while the API request is pending", () => {
    mockApi({ isLoading: true });

    const { result } = renderHook(() => useListTruck(EMPTY_FILTERS));

    expect(result.current.isLoading).toBe(true);
    expect(result.current.hasData).toBe(false);
  });

  it("should stay loading until the user's location is resolved", () => {
    (useUserLocation as Mock).mockReturnValue({
      location: null,
      status: "pending",
    });

    const { result } = renderHook(() => useListTruck(EMPTY_FILTERS));

    expect(result.current.isLoading).toBe(true);
    expect(result.current.trucks).toEqual([]);
  });

  it("should notify the user when the request fails", () => {
    mockApi({ error: new Error("Network error") });

    const { result } = renderHook(() => useListTruck(EMPTY_FILTERS));

    expect(result.current.hasError).toBe(true);
    expect(useSnackbarStore.getState()).toMatchObject({
      open: true,
      message: "Erro ao carregar os veículos.",
      severity: "error",
    });
  });
});
