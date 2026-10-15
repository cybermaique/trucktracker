import { describe, expect, it } from "vitest";
import {
  emptyTruckForm,
  fromDto,
  toInputDto,
  truckDtoSchema,
  truckFormSchema,
  type TruckDto,
} from "./schemas";

const dto: TruckDto = {
  id: "1",
  identifier: "Volvo FH 540",
  license_plate: "ABC-1234",
  tracker_serial_number: "VT540SP01",
  coordinates: { latitude: -23.5, longitude: -46.6 },
  image: null,
  start_date: "2024-02-17",
};

describe("API mapping", () => {
  it("maps the snake_case contract to the domain model and back", () => {
    const truck = fromDto(dto);

    expect(truck).toEqual({
      id: "1",
      identifier: "Volvo FH 540",
      licensePlate: "ABC-1234",
      trackerSerialNumber: "VT540SP01",
      coordinates: { latitude: -23.5, longitude: -46.6 },
      imageUrl: null,
      startDate: "2024-02-17",
    });
    const { id: _id, ...input } = truck;
    const { id: _dtoId, ...inputDto } = dto;
    expect(toInputDto(input)).toEqual(inputDto);
  });

  it("rejects malformed responses", () => {
    expect(
      truckDtoSchema.safeParse({ ...dto, start_date: "17/02/2024" }).success
    ).toBe(false);
    expect(
      truckDtoSchema.safeParse({ ...dto, coordinates: { latitude: 120 } })
        .success
    ).toBe(false);
  });
});

describe("truckFormSchema", () => {
  const valid = {
    ...emptyTruckForm(),
    identifier: "  Volvo FH 540  ",
    licensePlate: "ABC1D23",
    trackerSerialNumber: "VT540SP01",
    startDate: "2024-02-17",
    coordinates: { latitude: -23.5, longitude: -46.6 },
  };

  it("accepts valid input and trims text", () => {
    const result = truckFormSchema.parse(valid);
    expect(result.identifier).toBe("Volvo FH 540");
  });

  it.each([
    ["identifier", "ab", "Informe pelo menos 3 caracteres"],
    ["licensePlate", "AB-12", "Placa inválida. Use ABC-1234 ou ABC1D23"],
    ["trackerSerialNumber", "X1", "Use de 5 a 20 letras ou números"],
    ["startDate", "2024-13-45", "Informe uma data válida"],
    ["coordinates", null, "Selecione a localização no mapa"],
  ])("rejects an invalid %s", (field, value, message) => {
    const result = truckFormSchema.safeParse({ ...valid, [field]: value });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]).toMatchObject({ path: [field], message });
  });

  it("starts the form empty, dated today", () => {
    expect(emptyTruckForm()).toMatchObject({
      identifier: "",
      coordinates: null,
      startDate: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
    });
  });
});
