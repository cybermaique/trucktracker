import {
  createColumnHelper,
  createPaginatedRowModel,
  createSortedRowModel,
  rowPaginationFeature,
  rowSortingFeature,
  sortFn_alphanumeric,
  sortFn_text,
  tableFeatures,
  useTable,
  type PaginationState,
  type SortingState,
} from "@tanstack/react-table";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  FileText,
  MapPinned,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate, formatDistance } from "@/lib/format";
import { truckDetailsPath } from "@/lib/site";
import type { TruckWithDistance } from "../types";
import { TruckAvatar } from "./truck-avatar";

const features = tableFeatures({
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
  sortFns: { alphanumeric: sortFn_alphanumeric, text: sortFn_text },
  rowPaginationFeature,
  paginatedRowModel: createPaginatedRowModel(),
});

const PAGE_SIZES = [10, 20, 50] as const;

interface TruckActions {
  onSelect: (truck: TruckWithDistance) => void;
  onEdit: (truck: TruckWithDistance) => void;
  onDelete: (truck: TruckWithDistance) => void;
}

const helper = createColumnHelper<typeof features, TruckWithDistance>();

const createColumns = ({ onSelect, onEdit, onDelete }: TruckActions) =>
  helper.columns([
    helper.accessor("identifier", {
      header: "Caminhão",
      sortFn: "text",
      cell: ({ row }) => (
        <div className="flex min-w-48 items-center gap-3">
          <TruckAvatar truck={row.original} />
          <span className="font-medium">{row.original.identifier}</span>
        </div>
      ),
    }),
    helper.accessor("licensePlate", {
      header: "Placa",
      sortFn: "alphanumeric",
      cell: ({ getValue }) => (
        <Badge variant="outline" className="font-mono tracking-wider">
          {getValue()}
        </Badge>
      ),
    }),
    helper.accessor("trackerSerialNumber", {
      header: "Rastreador",
      enableSorting: false,
      cell: ({ getValue }) => (
        <span className="font-mono text-xs text-muted-foreground">
          {getValue()}
        </span>
      ),
    }),
    helper.accessor("distanceKm", {
      header: "Distância (linha reta)",
      cell: ({ getValue }) => (
        <span className="tabular-nums">{formatDistance(getValue())}</span>
      ),
    }),
    helper.accessor("startDate", {
      header: "Em operação desde",
      sortFn: "alphanumeric",
      cell: ({ getValue }) => (
        <span className="tabular-nums">{formatDate(getValue())}</span>
      ),
    }),
    helper.display({
      id: "actions",
      header: () => <span className="sr-only">Ações</span>,
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label={`Ações para ${row.original.identifier}`}
              onClick={(event) => event.stopPropagation()}
            >
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            onClick={(event) => event.stopPropagation()}
          >
            <DropdownMenuItem onSelect={() => onSelect(row.original)}>
              <MapPinned />
              Ver no mapa
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to={truckDetailsPath(row.original.id)}>
                <FileText />
                Ver detalhes
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => onEdit(row.original)}>
              <Pencil />
              Editar
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onSelect={() => onDelete(row.original)}
            >
              <Trash2 />
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    }),
  ]);

/** Columns hidden on small screens to keep the table readable. */
const RESPONSIVE_COLUMNS: Record<string, string> = {
  trackerSerialNumber: "hidden lg:table-cell",
  startDate: "hidden md:table-cell",
};

const SortIcon = ({ direction }: { direction: false | "asc" | "desc" }) => {
  if (direction === "asc") return <ArrowUp />;
  if (direction === "desc") return <ArrowDown />;
  return <ArrowUpDown className="opacity-50" />;
};

const ARIA_SORT = { asc: "ascending", desc: "descending" } as const;

interface TrucksTableProps extends TruckActions {
  trucks: TruckWithDistance[];
  selectedTruckId: string | null;
}

export function TrucksTable({
  trucks,
  selectedTruckId,
  onSelect,
  onEdit,
  onDelete,
}: TrucksTableProps) {
  // TanStack Table keeps mutable state inside a stable `table` instance, so
  // reads like `table.getRowModel()` are invisible to the React Compiler's
  // memoization. This component opts out of the compiler; the rest of the
  // app is compiled.
  "use no memo";

  const [sorting, setSorting] = useState<SortingState>([
    { id: "distanceKm", desc: false },
  ]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: PAGE_SIZES[0],
  });
  // Columns must be referentially stable; the callbacks come from a compiled
  // (auto-memoized) parent, so they only change when their inputs do.
  const columns = useMemo(
    () => createColumns({ onSelect, onEdit, onDelete }),
    [onSelect, onEdit, onDelete]
  );

  const table = useTable({
    features,
    columns,
    data: trucks,
    getRowId: (truck) => truck.id,
    state: { sorting, pagination },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    enableSortingRemoval: false,
  });

  // When a truck is selected (on the map or via a shared URL), jump to the page
  // holding its row. Starting from `null` also covers the initial selection.
  // Adjusting state during render (instead of in an effect) avoids an extra
  // commit: https://react.dev/learn/you-might-not-need-an-effect
  const [syncedSelection, setSyncedSelection] = useState<string | null>(null);
  if (selectedTruckId !== syncedSelection) {
    setSyncedSelection(selectedTruckId);
    const index = table
      .getPrePaginatedRowModel()
      .rows.findIndex((row) => row.id === selectedTruckId);
    if (index >= 0) {
      setPagination({
        ...pagination,
        pageIndex: Math.floor(index / pagination.pageSize),
      });
    }
  }

  const rows = table.getRowModel().rows;
  const firstRow = pagination.pageIndex * pagination.pageSize + 1;
  const lastRow = firstRow + rows.length - 1;

  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-xl border bg-card">
        <Table>
          <TableHeader className="bg-muted/50">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => {
                  const sorted = header.column.getIsSorted();
                  return (
                    <TableHead
                      key={header.id}
                      aria-sort={sorted ? ARIA_SORT[sorted] : undefined}
                      className={RESPONSIVE_COLUMNS[header.column.id]}
                    >
                      {header.column.getCanSort() ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="-ml-3"
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          <table.FlexRender header={header} />
                          <SortIcon direction={sorted} />
                        </Button>
                      ) : (
                        <table.FlexRender header={header} />
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {rows.map((row) => {
              const isSelected = row.id === selectedTruckId;
              return (
                <TableRow
                  key={row.id}
                  tabIndex={0}
                  aria-selected={isSelected}
                  data-state={isSelected ? "selected" : undefined}
                  className="cursor-pointer focus-visible:bg-muted/60 focus-visible:outline-none"
                  onClick={() => onSelect(row.original)}
                  onKeyDown={(event) => {
                    if (event.target !== event.currentTarget) return;
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      onSelect(row.original);
                    }
                  }}
                >
                  {row.getAllCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={RESPONSIVE_COLUMNS[cell.column.id]}
                    >
                      <table.FlexRender cell={cell} />
                    </TableCell>
                  ))}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col-reverse items-center justify-between gap-3 text-sm sm:flex-row">
        <p className="text-muted-foreground" aria-live="polite">
          {trucks.length === 0
            ? "Nenhum caminhão"
            : `Mostrando ${firstRow}–${lastRow} de ${trucks.length}`}
        </p>
        <div className="flex items-center gap-2">
          <Select
            value={String(pagination.pageSize)}
            onValueChange={(value) => table.setPageSize(Number(value))}
          >
            <SelectTrigger size="sm" aria-label="Itens por página">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZES.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size} por página
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            aria-label="Página anterior"
            disabled={!table.getCanPreviousPage()}
            onClick={() => table.previousPage()}
          >
            <ChevronLeft />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            aria-label="Próxima página"
            disabled={!table.getCanNextPage()}
            onClick={() => table.nextPage()}
          >
            <ChevronRight />
          </Button>
        </div>
      </div>
    </div>
  );
}
