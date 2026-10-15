import type { TruckDto, TruckInputDto } from "@/features/trucks/schemas";
import { SEED_TRUCKS } from "./data/seed-trucks";

const STORAGE_KEY = "trucktracker:db:v2";

export class DuplicatePlateError extends Error {}

const samePlate = (a: string, b: string) =>
  a.replace("-", "").toUpperCase() === b.replace("-", "").toUpperCase();

/**
 * In-memory "database" behind the mock API. When a `Storage` is given (the
 * browser demo) every write is persisted, so data survives page reloads.
 */
export function createTruckRepository(storage: Storage | null = null) {
  const load = (): TruckDto[] => {
    try {
      const saved = storage?.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved) as TruckDto[];
    } catch {
      // Corrupted or unavailable storage: start from the seed.
    }
    return structuredClone(SEED_TRUCKS);
  };

  let trucks = load();

  const persist = () => {
    try {
      storage?.setItem(STORAGE_KEY, JSON.stringify(trucks));
    } catch {
      // Quota exceeded: keep working in memory only.
    }
  };

  const assertUniquePlate = (plate: string, ignoreId?: string) => {
    if (
      trucks.some(
        (truck) =>
          truck.id !== ignoreId && samePlate(truck.license_plate, plate)
      )
    ) {
      throw new DuplicatePlateError(`Plate ${plate} is already registered`);
    }
  };

  return {
    list: () => trucks,

    find: (id: string) => trucks.find((truck) => truck.id === id),

    create(input: TruckInputDto): TruckDto {
      assertUniquePlate(input.license_plate);
      const truck = { ...input, id: crypto.randomUUID() };
      trucks = [...trucks, truck];
      persist();
      return truck;
    },

    update(id: string, input: TruckInputDto): TruckDto | undefined {
      if (!trucks.some((truck) => truck.id === id)) return undefined;
      assertUniquePlate(input.license_plate, id);
      const updated = { ...input, id };
      trucks = trucks.map((truck) => (truck.id === id ? updated : truck));
      persist();
      return updated;
    },

    remove(id: string): boolean {
      const exists = trucks.some((truck) => truck.id === id);
      trucks = trucks.filter((truck) => truck.id !== id);
      persist();
      return exists;
    },

    /** Restores the seed data (used by tests and the "reset demo" action). */
    reset(seed: TruckDto[] = SEED_TRUCKS) {
      trucks = structuredClone(seed);
      persist();
    },
  };
}

export type TruckRepository = ReturnType<typeof createTruckRepository>;
