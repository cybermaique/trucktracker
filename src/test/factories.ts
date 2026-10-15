import type { TruckWithDistance } from "@/features/trucks/types";

/** A valid truck near São Paulo; override only what the test cares about. */
export const buildTruck = (
  overrides: Partial<TruckWithDistance> = {}
): TruckWithDistance => ({
  id: "1",
  identifier: "Volvo FH 540 · São Paulo (SP)",
  licensePlate: "ABC-1234",
  trackerSerialNumber: "VT540SP01",
  coordinates: { latitude: -23.55052, longitude: -46.633308 },
  imageUrl: null,
  startDate: "2024-01-01",
  distanceKm: 0,
  ...overrides,
});
