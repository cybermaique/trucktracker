import { createServer, Model, Response } from "miragejs";
import { TRUCKS } from "../__mocks__/trucks-server.mock";
import { NewTruck } from "../interfaces/truck";

type MirageEnvironment = "development" | "test";

const REQUIRED_FIELDS: (keyof NewTruck)[] = [
  "identifier",
  "license_plate",
  "tracker_serial_number",
  "coordinates",
];

const isValidTruck = (truck: Partial<NewTruck>) =>
  REQUIRED_FIELDS.every((field) => Boolean(truck[field]));

const invalidDataResponse = () =>
  new Response(400, {}, { error: "Dados inválidos" });

const notFoundResponse = () =>
  new Response(404, {}, { error: "Caminhão não encontrado" });

/**
 * Fake REST API used by the app (there is no real backend).
 *
 * In `development` the database is seeded and responses are delayed to
 * simulate network latency. In `test` Mirage starts empty and responds
 * immediately, so each test controls its own data.
 */
export function makeServer({
  environment = "development",
}: { environment?: MirageEnvironment } = {}) {
  return createServer({
    environment,

    timing: 400,

    models: {
      truck: Model,
    },

    seeds(server) {
      TRUCKS.forEach((truck) => server.create("truck", truck));
    },

    routes() {
      this.namespace = "api";

      this.get("/caminhoes", (schema) => schema.all("truck"));

      this.post("/caminhao", (schema, request) => {
        const newTruck = JSON.parse(request.requestBody);

        if (!isValidTruck(newTruck)) return invalidDataResponse();

        return schema.create("truck", newTruck);
      });

      this.put("/caminhao/:id", (schema, request) => {
        const truck = schema.find("truck", request.params.id);
        if (!truck) return notFoundResponse();

        const updatedTruck = JSON.parse(request.requestBody);
        if (!isValidTruck(updatedTruck)) return invalidDataResponse();

        truck.update(updatedTruck);
        return truck;
      });

      this.delete("/caminhao/:id", (schema, request) => {
        const truck = schema.find("truck", request.params.id);
        if (!truck) return notFoundResponse();

        truck.destroy();
        return new Response(
          200,
          {},
          { message: "Caminhão excluído com sucesso" }
        );
      });
    },
  });
}
