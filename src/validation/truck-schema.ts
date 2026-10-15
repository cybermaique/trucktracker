import * as z from "zod";

const errorMap: z.ZodErrorMap = () => ({ message: "Campo obrigatório" });
z.setErrorMap(errorMap);

/** Old format (ABC-1234) or Mercosul format (ABC1D23). */
const LICENSE_PLATE_REGEX = /^[A-Z]{3}-\d{4}$|^[A-Z]{3}\d[A-Z]\d{2}$/i;

const truckSchema = z.object({
  identifier: z
    .string()
    .trim()
    .min(3, "O identificador deve ter pelo menos 3 caracteres"),
  license_plate: z.string().regex(LICENSE_PLATE_REGEX, "Placa inválida"),
  tracker_serial_number: z.string().trim().min(5, "Número de série inválido"),
  latitude: z
    .number()
    .min(-90, "Latitude inválida")
    .max(90, "Latitude inválida"),
  longitude: z
    .number()
    .min(-180, "Longitude inválida")
    .max(180, "Longitude inválida"),
});

export const truckEditSchema = truckSchema.pick({
  identifier: true,
  license_plate: true,
  tracker_serial_number: true,
});

export type TruckFormValues = z.infer<typeof truckSchema>;
export type TruckEditValues = z.infer<typeof truckEditSchema>;

export default truckSchema;
