import autoTable from "jspdf-autotable";
import { describe, expect, it, vi } from "vitest";
import { TruckWithDistance } from "../interfaces/truck";
import { downloadTruckReport } from "./truck-report";

const save = vi.fn();
const text = vi.fn();

vi.mock("jspdf", () => ({
  jsPDF: vi.fn(function () {
    return { save, text, setFontSize: vi.fn() };
  }),
}));

vi.mock("jspdf-autotable", () => ({ default: vi.fn() }));

const TRUCK: TruckWithDistance = {
  id: "1",
  identifier: "Caminhão 1",
  license_plate: "ABC-1234",
  tracker_serial_number: "T12345",
  coordinates: { latitude: 0, longitude: 0 },
  image: "",
  start_date: "2024-02-17T12:00:00Z",
  distance: 12.3456,
};

describe("downloadTruckReport", () => {
  it("should build a table with the trucks and download the PDF", async () => {
    await downloadTruckReport([TRUCK]);

    expect(autoTable).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        head: [
          [
            "Identificador",
            "Placa",
            "Rastreador",
            "Distância (km)",
            "Data de início",
          ],
        ],
        body: [["Caminhão 1", "ABC-1234", "T12345", "12.35", "17/02/2024"]],
      })
    );
    expect(text).toHaveBeenCalledWith(
      "TruckTracker — Relatório de caminhões",
      expect.any(Number),
      expect.any(Number)
    );
    expect(save).toHaveBeenCalledWith("relatorio-caminhoes.pdf");
  });
});
