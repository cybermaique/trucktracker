import { setupServer } from "msw/node";
import { createTruckRepository } from "@/mocks/db";
import { createHandlers } from "@/mocks/handlers";

/** In-memory database behind the test API; reset to the seed after each test. */
export const testDb = createTruckRepository(null);

/** Same request handlers as the browser demo, running in Node. */
export const server = setupServer(...createHandlers(testDb));
