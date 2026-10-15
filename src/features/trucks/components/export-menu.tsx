import { Download, FileSpreadsheet, FileText } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Spinner } from "@/components/ui/spinner";
import { exportTrucksToCsv, exportTrucksToPdf } from "../lib/export";
import type { TruckWithDistance } from "../types";

export function ExportMenu({ trucks }: { trucks: TruckWithDistance[] }) {
  const [isExporting, setIsExporting] = useState(false);

  const exportPdf = async () => {
    setIsExporting(true);
    try {
      await exportTrucksToPdf(trucks);
    } catch {
      toast.error("Não foi possível gerar o PDF.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={trucks.length === 0 || isExporting}>
          {isExporting ? <Spinner /> : <Download />}
          Exportar
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>
          {trucks.length} {trucks.length === 1 ? "caminhão" : "caminhões"}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={exportPdf}>
          <FileText />
          Relatório em PDF
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => exportTrucksToCsv(trucks)}>
          <FileSpreadsheet />
          Planilha CSV
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
