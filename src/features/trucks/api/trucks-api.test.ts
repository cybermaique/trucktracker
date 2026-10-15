import { describe, expect, it } from "vitest";
import { ApiError } from "@/lib/http";
import { SEED_TRUCKS } from "@/mocks/data/seed-trucks";
import { testDb } from "@/test/server";
import type { TruckInput } from "../types";
import { trucksApi } from "./trucks-api";

const input: TruckInput = {
  identifier: "Volvo FH 540 · Teste",
  licensePlate: "TST1A23",
  trackerSerialNumber: "TEST12345",
  coordinates: { latitude: -23.5, longitude: -46.6 },
  imageUrl: null,
  startDate: "2025-01-10",
};

/** Exercises the API client against the mock server's REST contract. */
describe("trucksApi", () => {
  it("lists the trucks as domain objects", async () => {
    const trucks = await trucksApi.list();

    expect(trucks).toHaveLength(SEED_TRUCKS.length);
    expect(trucks[0]).toMatchObject({
      id: "1",
      licensePlate: "FRT-2A41",
      trackerSerialNumber: "VT540SP01",
    });
  });

  it("creates a truck", async () => {
    const created = await trucksApi.create(input);

    expect(created).toEqual({ ...input, id: expect.any(String) });
    expect(testDb.find(created.id)).toMatchObject({ license_plate: "TST1A23" });
  });

  it("updates a truck", async () => {
    const [first] = await trucksApi.list();
    const updated = await trucksApi.update({
      ...first!,
      identifier: "Renomeado",
    });

    expect(updated.identifier).toBe("Renomeado");
    expect(testDb.find("1")?.identifier).toBe("Renomeado");
  });

  it("deletes a truck", async () => {
    await trucksApi.remove("1");

    expect(testDb.find("1")).toBeUndefined();
  });

  it("restores the demo dataset", async () => {
    testDb.reset([]);

    await trucksApi.resetDemo();

    expect(testDb.list()).toHaveLength(SEED_TRUCKS.length);
  });

  it.each([
    [
      "a duplicated plate",
      () => trucksApi.create({ ...input, licensePlate: "FRT-2A41" }),
      409,
    ],
    ["an unknown truck", () => trucksApi.remove("999"), 404],
    [
      "an update of an unknown truck",
      () => trucksApi.update({ ...input, id: "999" }),
      404,
    ],
    [
      "an invalid body",
      () => trucksApi.create({ ...input, startDate: "ontem" }),
      400,
    ],
    [
      "an update to a plate owned by another truck",
      () => trucksApi.update({ ...input, id: "2", licensePlate: "FRT-2A41" }),
      409,
    ],
    [
      "an invalid update",
      () => trucksApi.update({ ...input, id: "2", startDate: "ontem" }),
      400,
    ],
  ])("rejects %s with an ApiError", async (_case, request, status) => {
    const error = await request().catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ status });
  });
});
