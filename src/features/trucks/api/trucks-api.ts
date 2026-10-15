import { z } from "zod";
import { http } from "@/lib/http";
import { fromDto, toInputDto, truckDtoSchema } from "../schemas";
import type { Truck, TruckInput } from "../types";

const truckListSchema = z.array(truckDtoSchema);

/** HTTP calls for the trucks resource. Responses are validated with Zod. */
export const trucksApi = {
  async list(): Promise<Truck[]> {
    return truckListSchema.parse(await http("trucks")).map(fromDto);
  },

  async create(input: TruckInput): Promise<Truck> {
    const body = toInputDto(input);
    return fromDto(
      truckDtoSchema.parse(await http("trucks", { method: "POST", body }))
    );
  },

  async update({ id, ...input }: Truck): Promise<Truck> {
    const body = toInputDto(input);
    return fromDto(
      truckDtoSchema.parse(await http(`trucks/${id}`, { method: "PUT", body }))
    );
  },

  async remove(id: string): Promise<void> {
    await http(`trucks/${id}`, { method: "DELETE" });
  },

  /** Restores the demo dataset (endpoint provided by the mock API). */
  async resetDemo(): Promise<void> {
    await http("demo/reset", { method: "POST" });
  },
};
