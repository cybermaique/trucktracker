import { formatDate, formatDateTime } from "@/lib/format";
import type { TruckWithDistance } from "../types";

const COLUMNS = [
  "Identificador",
  "Placa",
  "Rastreador",
  "Distância (km)",
  "Latitude",
  "Longitude",
  "Início",
];

const toRow = (truck: TruckWithDistance) => [
  truck.identifier,
  truck.licensePlate,
  truck.trackerSerialNumber,
  truck.distanceKm.toFixed(1),
  truck.coordinates.latitude.toFixed(5),
  truck.coordinates.longitude.toFixed(5),
  formatDate(truck.startDate),
];

const download = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const link = Object.assign(document.createElement("a"), {
    href: url,
    download: filename,
  });
  link.click();
  URL.revokeObjectURL(url);
};

const QUOTE = '"';

const escapeCsv = (value: string) =>
  /[";\n]/.test(value)
    ? QUOTE + value.replaceAll(QUOTE, QUOTE + QUOTE) + QUOTE
    : value;

/** Semicolon-separated, which is what Excel expects in pt-BR locales. */
export function toCsv(trucks: readonly TruckWithDistance[]): string {
  return [COLUMNS, ...trucks.map(toRow)]
    .map((row) => row.map(escapeCsv).join(";"))
    .join("\n");
}

export function exportTrucksToCsv(trucks: readonly TruckWithDistance[]) {
  // The BOM makes Excel detect UTF-8 (accents in "Distância", "Início").
  download(
    new Blob(["﻿", toCsv(trucks)], { type: "text/csv;charset=utf-8" }),
    "caminhoes.csv"
  );
}

/** jsPDF (~400 kB) is loaded on demand, only when a report is requested. */
export async function exportTrucksToPdf(trucks: readonly TruckWithDistance[]) {
  const [{ jsPDF }, { default: autoTable }] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
  ]);

  const doc = new jsPDF({ orientation: "landscape" });
  doc.setFontSize(14);
  doc.text("TruckTracker — Relatório da frota", 14, 16);
  doc.setFontSize(9);
  doc.text(
    `${trucks.length} caminhões · gerado em ${formatDateTime(new Date())}`,
    14,
    22
  );

  autoTable(doc, {
    startY: 28,
    head: [COLUMNS],
    body: trucks.map(toRow),
    headStyles: { fillColor: [37, 99, 235] },
    styles: { fontSize: 9 },
  });

  doc.save("caminhoes.pdf");
}
