import { TruckWithDistance } from "../interfaces/truck";
import { formatDate } from "./date";

const REPORT_COLUMNS = [
  "Identificador",
  "Placa",
  "Rastreador",
  "Distância (km)",
  "Data de início",
];

/**
 * Generates and downloads a PDF with the given trucks.
 * jsPDF is loaded on demand so it doesn't weigh on the initial bundle.
 */
export const downloadTruckReport = async (trucks: TruckWithDistance[]) => {
  const [{ jsPDF }, { default: autoTable }] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
  ]);

  const doc = new jsPDF();

  doc.setFontSize(14);
  doc.text("TruckTracker — Relatório de caminhões", 14, 16);
  doc.setFontSize(9);
  doc.text(`Gerado em ${formatDate(new Date(), "DD/MM/YYYY HH:mm")}`, 14, 22);

  autoTable(doc, {
    startY: 28,
    head: [REPORT_COLUMNS],
    body: trucks.map((truck) => [
      truck.identifier,
      truck.license_plate,
      truck.tracker_serial_number,
      truck.distance.toFixed(2),
      formatDate(truck.start_date),
    ]),
    headStyles: { fillColor: [15, 15, 15] },
  });

  doc.save("relatorio-caminhoes.pdf");
};
