import { Server } from "miragejs";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { TRUCKS } from "../__mocks__/trucks-server.mock";
import { makeServer } from "./server";

let server: Server;

const NEW_TRUCK = {
  identifier: "Caminhão 18 - São Paulo (SP)",
  license_plate: "XYZ-5678",
  tracker_serial_number: "T18181",
  coordinates: { latitude: -23.55052, longitude: -46.633308 },
};

const request = (url: string, method: string, body?: unknown) =>
  fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });

describe("Mirage server", () => {
  describe("development environment", () => {
    beforeEach(() => {
      server = makeServer({ environment: "development" });
      server.timing = 0;
    });

    afterEach(() => server.shutdown());

    it("should seed the database with the mocked trucks", async () => {
      const response = await fetch("/api/caminhoes");
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.trucks).toHaveLength(TRUCKS.length);
    });
  });

  describe("test environment", () => {
    beforeEach(() => {
      server = makeServer({ environment: "test" });
    });

    afterEach(() => server.shutdown());

    it("should start without data", async () => {
      const data = await (await fetch("/api/caminhoes")).json();

      expect(data.trucks).toEqual([]);
    });

    it("should register a new truck", async () => {
      const response = await request("/api/caminhao", "POST", NEW_TRUCK);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.truck).toMatchObject({
        id: expect.any(String),
        ...NEW_TRUCK,
      });
    });

    it("should reject a truck with missing required fields", async () => {
      const { identifier: _identifier, ...invalidTruck } = NEW_TRUCK;

      const response = await request("/api/caminhao", "POST", invalidTruck);

      expect(response.status).toBe(400);
    });

    it("should update an existing truck", async () => {
      const truck = server.create("truck", { id: "1", ...NEW_TRUCK });

      const response = await request(`/api/caminhao/${truck.id}`, "PUT", {
        ...NEW_TRUCK,
        license_plate: "ABC1D23",
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.truck.license_plate).toBe("ABC1D23");
    });

    it("should reject an update with invalid data", async () => {
      const truck = server.create("truck", { id: "1", ...NEW_TRUCK });

      const response = await request(`/api/caminhao/${truck.id}`, "PUT", {
        ...NEW_TRUCK,
        license_plate: "",
      });

      expect(response.status).toBe(400);
    });

    it("should delete an existing truck", async () => {
      const truck = server.create("truck", { id: "1", ...NEW_TRUCK });

      const response = await request(`/api/caminhao/${truck.id}`, "DELETE");

      expect(response.status).toBe(200);
      expect(server.schema.find("truck", truck.id)).toBeNull();
    });

    it.each(["PUT", "DELETE"])(
      "should return 404 on %s for an unknown truck",
      async (method) => {
        const response = await request("/api/caminhao/999", method, NEW_TRUCK);

        expect(response.status).toBe(404);
      }
    );
  });
});
