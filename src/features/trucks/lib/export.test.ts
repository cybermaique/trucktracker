import autoTable from "jspdf-autotable";
import { describe, expect, it, vi } from "vitest";
import type { TruckWithDistance } from "../types";
import { exportTrucksToPdf, toCsv } from "./export";

const pdf = { save: vi.fn(), text: vi.fn(), setFontSize: vi.fn() };

vi.mock("jspdf", () => ({
  jsPDF: vi.fn(function () {
    return pdf;
  }),
}));
vi.mock("jspdf-autotable", () => ({ default: vi.fn() }));

const truck: TruckWithDistance = {
  id: "1",
  identifier: 'Volvo "FH"; São Paulo',
  licensePlate: "ABC-1234",
  trackerSerialNumber: "VT540SP01",
  coordinates: { latitude: -23.5617, longitude: -46.6559 },
  imageUrl: null,
  startDate: "2024-02-17",
  distanceKm: 2.6449,
};

describe("toCsv", () => {
  it("writes a header and one escaped row per truck", () => {
    expect(toCsv([truck]).split("\n")).toEqual([
      "Identificador;Placa;Rastreador;Distância (km);Latitude;Longitude;Início",
      '"Volvo ""FH""; São Paulo";ABC-1234;VT540SP01;2.6;-23.56170;-46.65590;17/02/2024',
    ]);
  });
});

describe("exportTrucksToPdf", () => {
  it("renders a table with the trucks and downloads it", async () => {
    await exportTrucksToPdf([truck]);

    expect(autoTable).toHaveBeenCalledWith(
      pdf,
      expect.objectContaining({
        body: [
          [
            truck.identifier,
            "ABC-1234",
            "VT540SP01",
            "2.6",
            "-23.56170",
            "-46.65590",
            "17/02/2024",
          ],
        ],
      })
    );
    expect(pdf.save).toHaveBeenCalledWith("caminhoes.pdf");
  });
});
