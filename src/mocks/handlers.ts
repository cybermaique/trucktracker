import { delay, http, HttpResponse } from "msw";
import { truckInputDtoSchema } from "@/features/trucks/schemas";
import { DuplicatePlateError, type TruckRepository } from "./db";

// `*` matches any origin and base path (localhost, GitHub Pages, tests).
const TRUCKS_URL = "*/api/trucks";
const TRUCK_URL = "*/api/trucks/:id";
const DEMO_RESET_URL = "*/api/demo/reset";

const notFound = () =>
  HttpResponse.json({ message: "Caminhão não encontrado" }, { status: 404 });

const duplicatePlate = () =>
  HttpResponse.json(
    { message: "Já existe um caminhão com essa placa", field: "license_plate" },
    { status: 409 }
  );

const invalidBody = (issues: unknown) =>
  HttpResponse.json({ message: "Dados inválidos", issues }, { status: 400 });

async function parseBody(request: Request) {
  const result = truckInputDtoSchema.safeParse(
    await request.json().catch(() => null)
  );
  return result.success
    ? { data: result.data, error: null }
    : { data: null, error: result.error.issues };
}

/**
 * REST contract of the fake API. `delay()` adds realistic latency in the
 * browser and resolves immediately in Node, so tests stay fast.
 */
export const createHandlers = (db: TruckRepository) => [
  http.get(TRUCKS_URL, async () => {
    await delay();
    return HttpResponse.json(db.list());
  }),

  http.post(TRUCKS_URL, async ({ request }) => {
    await delay();
    const { data, error } = await parseBody(request);
    if (!data) return invalidBody(error);

    try {
      return HttpResponse.json(db.create(data), { status: 201 });
    } catch (cause) {
      if (cause instanceof DuplicatePlateError) return duplicatePlate();
      throw cause;
    }
  }),

  http.put<{ id: string }>(TRUCK_URL, async ({ request, params }) => {
    await delay();
    const { data, error } = await parseBody(request);
    if (!data) return invalidBody(error);

    try {
      const truck = db.update(params.id, data);
      return truck ? HttpResponse.json(truck) : notFound();
    } catch (cause) {
      if (cause instanceof DuplicatePlateError) return duplicatePlate();
      throw cause;
    }
  }),

  http.delete<{ id: string }>(TRUCK_URL, async ({ params }) => {
    await delay();
    return db.remove(params.id)
      ? new HttpResponse(null, { status: 204 })
      : notFound();
  }),

  http.post(DEMO_RESET_URL, async () => {
    await delay();
    db.reset();
    return new HttpResponse(null, { status: 204 });
  }),
];
