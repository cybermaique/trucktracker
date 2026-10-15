import { describe, expect, it } from "vitest";
import type { TruckWithDistance } from "../types";
import { buildTruck as truck } from "@/test/factories";
import { filterTrucks } from "./filter-trucks";

describe("filterTrucks", () => {
  const trucks = [
    truck({
      id: "1",
      identifier: "Volvo · São Paulo",
      licensePlate: "FRT-2A41",
      distanceKm: 3,
    }),
    truck({
      id: "2",
      identifier: "Scania · Campinas",
      licensePlate: "CMP4E21",
      trackerSerialNumber: "SC450CP02",
      distanceKm: 84,
    }),
    truck({
      id: "3",
      identifier: "DAF · Recife",
      licensePlate: "REC9J81",
      distanceKm: 2100,
    }),
  ];
  const ids = (list: TruckWithDistance[]) => list.map(({ id }) => id);

  it("returns everything without filters", () => {
    expect(ids(filterTrucks(trucks, { search: "", radiusKm: null }))).toEqual([
      "1",
      "2",
      "3",
    ]);
  });

  it("matches name, plate or tracker ignoring case, accents and punctuation", () => {
    expect(
      ids(filterTrucks(trucks, { search: "sao paulo", radiusKm: null }))
    ).toEqual(["1"]);
    expect(
      ids(filterTrucks(trucks, { search: "frt2a41", radiusKm: null }))
    ).toEqual(["1"]);
    expect(
      ids(filterTrucks(trucks, { search: "sc450", radiusKm: null }))
    ).toEqual(["2"]);
  });

  it("limits by distance and combines with the search", () => {
    expect(ids(filterTrucks(trucks, { search: "", radiusKm: 100 }))).toEqual([
      "1",
      "2",
    ]);
    expect(
      ids(filterTrucks(trucks, { search: "recife", radiusKm: 100 }))
    ).toEqual([]);
  });
});
