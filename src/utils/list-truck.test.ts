import { describe, expect, it } from "vitest";
import { TruckApiResponse, TruckWithDistance } from "../interfaces/truck";
import {
  formatLicensePlate,
  getDistance,
  getTruckCellValue,
  sortAndFilterTrucks,
} from "./list-truck";

describe("Truck Utility Functions", () => {
  const truck: TruckWithDistance = {
    id: "1",
    distance: 123.456,
    identifier: "1",
    coordinates: {
      latitude: -23.55052,
      longitude: -46.633308,
    },
    license_plate: "ABC1234",
    tracker_serial_number: "12345ABC",
    image: "",
    start_date: "2023-01-01T00:00:00Z",
  };

  it("should return the correctly formatted distance", () => {
    const result = getTruckCellValue(truck, "distance");
    expect(result).toBe("123.46");
  });

  it("should return latitude as string", () => {
    const result = getTruckCellValue(truck, "coordinates.latitude");
    expect(result).toBe("-23.55052");
  });

  it("should return longitude as string", () => {
    const result = getTruckCellValue(truck, "coordinates.longitude");
    expect(result).toBe("-46.633308");
  });

  it("should return the correct value for any key", () => {
    const result = getTruckCellValue(truck, "license_plate");
    expect(result).toBe("ABC1234");
  });

  it("should return an empty string for a non-existent key", () => {
    const result = getTruckCellValue(truck, "nonExistentKey");
    expect(result).toBe("");
  });

  it("should correctly format license plate 'abc1234' to 'ABC-1234'", () => {
    const result = formatLicensePlate("abc1234");
    expect(result).toBe("ABC-1234");
  });

  it("should keep 'ABC1234' license plate formatted as 'ABC-1234'", () => {
    const result = formatLicensePlate("ABC1234");
    expect(result).toBe("ABC-1234");
  });

  it("should keep 7-character license plates correctly formatted", () => {
    const result = formatLicensePlate("ABC1234");
    expect(result).toBe("ABC-1234");
  });

  it("should return the license plate without changes if not in 'ABC-1234' or 'ABC1234' format", () => {
    const result = formatLicensePlate("A1B2C3D4");
    expect(result).toBe("A1B2C3D");
  });

  it("should correctly format plates with alternating letters and numbers", () => {
    const result = formatLicensePlate("ABC1D23");
    expect(result).toBe("ABC1D23");
  });

  it("should correctly calculate the distance between two points", () => {
    const lat1 = -23.55052;
    const lon1 = -46.633308;
    const lat2 = -22.9068;
    const lon2 = -43.1729;

    const distance = getDistance(lat1, lon1, lat2, lon2);
    expect(distance).toBeCloseTo(360.75, 2);
  });

  it("should calculate the distance as 0 for the same points", () => {
    const lat1 = -23.55052;
    const lon1 = -46.633308;
    const lat2 = -23.55052;
    const lon2 = -46.633308;

    const distance = getDistance(lat1, lon1, lat2, lon2);
    expect(distance).toBe(0);
  });

  it("should correctly calculate distance for different locations", () => {
    const lat1 = 48.8566;
    const lon1 = 2.3522;
    const lat2 = 40.7128;
    const lon2 = -74.006;

    const distance = getDistance(lat1, lon1, lat2, lon2);
    expect(distance).toBeCloseTo(5837.24, 2);
  });

  const trucks: TruckApiResponse[] = [
    {
      id: "1",
      identifier: "1",
      coordinates: { latitude: -23.55052, longitude: -46.633308 },
      license_plate: "ABC1234",
      tracker_serial_number: "12345ABC",
      image: "",
      start_date: "2023-01-01T00:00:00Z",
    },
    {
      id: "2",
      identifier: "2",
      coordinates: { latitude: -22.9068, longitude: -43.1729 },
      license_plate: "XYZ5678",
      tracker_serial_number: "67890XYZ",
      image: "",
      start_date: "2023-01-01T00:00:00Z",
    },
    {
      id: "3",
      identifier: "3",
      coordinates: { latitude: -25.4275, longitude: -49.2731 },
      license_plate: "DEF9012",
      tracker_serial_number: "11223DEF",
      image: "",
      start_date: "2023-01-01T00:00:00Z",
    },
  ];

  const userLocation = { latitude: -23.55052, longitude: -46.633308 };

  it("should sort trucks by distance in ascending order", () => {
    const result = sortAndFilterTrucks(trucks, {}, false, userLocation);
    expect(result[0].id).toBe("1");
    expect(result[1].id).toBe("3");
    expect(result[2].id).toBe("2");
  });

  it("should sort trucks by distance in descending order", () => {
    const result = sortAndFilterTrucks(trucks, {}, true, userLocation);
    expect(result[0].id).toBe("2");
    expect(result[1].id).toBe("3");
    expect(result[2].id).toBe("1");
  });

  it("should filter trucks by license plate", () => {
    const result = sortAndFilterTrucks(
      trucks,
      { licensePlate: "abc" },
      false,
      userLocation
    );
    expect(result.length).toBe(1);
    expect(result[0].license_plate).toBe("ABC1234");
  });

  it("should filter trucks by tracker serial number", () => {
    const result = sortAndFilterTrucks(
      trucks,
      { trackerSerialNumber: "12345ABC" },
      false,
      userLocation
    );
    expect(result.length).toBe(1);
    expect(result[0].tracker_serial_number).toBe("12345ABC");
  });

  it("should filter trucks by max distance", () => {
    const result = sortAndFilterTrucks(
      trucks,
      { maxDistance: "500" },
      false,
      userLocation
    );
    expect(result.length).toBe(3);
  });

  it("should return all trucks when no filters are applied", () => {
    const result = sortAndFilterTrucks(trucks, {}, false, userLocation);
    expect(result.length).toBe(3);
  });

  it("should return an empty list when no trucks match the filters", () => {
    const result = sortAndFilterTrucks(
      trucks,
      { licensePlate: "ZZZ0000" },
      false,
      userLocation
    );
    expect(result.length).toBe(0);
  });
});
