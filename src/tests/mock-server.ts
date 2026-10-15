import { Server } from "miragejs";
import { afterAll, afterEach, beforeAll } from "vitest";
import { makeServer } from "../mirage/server";

export let server: Server;

beforeAll(() => {
  server = makeServer({ environment: "test" });
});

afterEach(() => {
  server.db.emptyData();
});

afterAll(() => {
  server.shutdown();
});
