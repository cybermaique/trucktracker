import { z } from "zod";
import { todayIsoDate } from "@/lib/format";
import type { Truck, TruckInput } from "./types";

/** Old Brazilian format (`ABC-1234`) or Mercosul format (`ABC1D23`). */
const LICENSE_PLATE_PATTERN = /^[A-Z]{3}-\d{4}$|^[A-Z]{3}\d[A-Z]\d{2}$/;

const coordinatesSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

/**
 * Wire format of the API, as defined by the original challenge (snake_case).
 * Responses are validated at the boundary and mapped to the domain model.
 */
export const truckDtoSchema = z.object({
  id: z.string(),
  identifier: z.string(),
  license_plate: z.string(),
  tracker_serial_number: z.string(),
  coordinates: coordinatesSchema,
  image: z.string().nullish(),
  start_date: z.iso.date(),
});

export const truckInputDtoSchema = truckDtoSchema.omit({ id: true });

export type TruckDto = z.infer<typeof truckDtoSchema>;
export type TruckInputDto = z.infer<typeof truckInputDtoSchema>;

export const fromDto = (dto: TruckDto): Truck => ({
  id: dto.id,
  identifier: dto.identifier,
  licensePlate: dto.license_plate,
  trackerSerialNumber: dto.tracker_serial_number,
  coordinates: dto.coordinates,
  imageUrl: dto.image ?? null,
  startDate: dto.start_date,
});

export const toInputDto = (input: TruckInput): TruckInputDto => ({
  identifier: input.identifier,
  license_plate: input.licensePlate,
  tracker_serial_number: input.trackerSerialNumber,
  coordinates: input.coordinates,
  image: input.imageUrl,
  start_date: input.startDate,
});

/** Validation rules for the create/edit form. */
export const truckFormSchema = z.object({
  identifier: z
    .string()
    .trim()
    .min(3, "Informe pelo menos 3 caracteres")
    .max(40, "Use no máximo 40 caracteres"),
  licensePlate: z
    .string()
    .regex(LICENSE_PLATE_PATTERN, "Placa inválida. Use ABC-1234 ou ABC1D23"),
  trackerSerialNumber: z
    .string()
    .trim()
    .regex(/^[A-Z0-9]{5,20}$/, "Use de 5 a 20 letras ou números"),
  startDate: z.iso.date("Informe uma data válida"),
  // Nullable while editing; the transform rejects null and narrows the
  // output type, so a valid form always produces a `TruckInput`.
  coordinates: coordinatesSchema.nullable().transform((value, ctx) => {
    if (value === null) {
      ctx.addIssue({
        code: "custom",
        message: "Selecione a localização no mapa",
      });
      return z.NEVER;
    }
    return value;
  }),
  imageUrl: z.string().nullable(),
});

export type TruckFormValues = z.input<typeof truckFormSchema>;
export type TruckFormOutput = z.output<typeof truckFormSchema>;

export const emptyTruckForm = (): TruckFormValues => ({
  identifier: "",
  licensePlate: "",
  trackerSerialNumber: "",
  startDate: todayIsoDate(),
  coordinates: null,
  imageUrl: null,
});
