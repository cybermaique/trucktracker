import { describe, expect, it } from "vitest";
import { SEED_TRUCKS } from "./data/seed-trucks";
import { createTruckRepository, DuplicatePlateError } from "./db";

const { id: _id, ...newTruck } = {
  ...SEED_TRUCKS[0]!,
  license_plate: "NEW1A23",
};

describe("truck repository", () => {
  it("starts from the seed and persists writes to the given storage", () => {
    const db = createTruckRepository(localStorage);
    expect(db.list()).toHaveLength(SEED_TRUCKS.length);

    const created = db.create(newTruck);

    const reloaded = createTruckRepository(localStorage);
    expect(reloaded.find(created.id)).toEqual(created);
  });

  it("falls back to the seed when the stored data is corrupted", () => {
    localStorage.setItem("trucktracker:db:v2", "{not json");

    expect(createTruckRepository(localStorage).list()).toHaveLength(
      SEED_TRUCKS.length
    );
  });

  it("treats plates with and without hyphen as the same plate", () => {
    const db = createTruckRepository();

    expect(() => db.create({ ...newTruck, license_plate: "FRT2A41" })).toThrow(
      DuplicatePlateError
    );
    expect(() =>
      db.update("2", { ...newTruck, license_plate: "frt-2a41" })
    ).toThrow(DuplicatePlateError);
  });

  it("allows a truck to keep its own plate on update", () => {
    const db = createTruckRepository();
    const { id: _ownId, ...first } = SEED_TRUCKS[0]!;

    expect(db.update("1", { ...first, identifier: "Renomeado" })).toMatchObject(
      {
        id: "1",
        identifier: "Renomeado",
      }
    );
  });

  it("reports missing trucks on update and removal", () => {
    const db = createTruckRepository();

    expect(db.update("999", newTruck)).toBeUndefined();
    expect(db.remove("999")).toBe(false);
    expect(db.remove("1")).toBe(true);
    expect(db.list()).toHaveLength(SEED_TRUCKS.length - 1);
  });
});
