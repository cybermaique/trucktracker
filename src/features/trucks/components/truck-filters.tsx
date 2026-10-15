import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatNumber } from "@/lib/format";
import { RADIUS_OPTIONS_KM } from "../hooks/use-truck-filters";
import type { TruckFilters as Filters } from "../lib/filter-trucks";

const ANY_DISTANCE = "any";

interface TruckFiltersProps {
  filters: Filters;
  onSearchChange: (search: string) => void;
  onRadiusChange: (radiusKm: number | null) => void;
  onClear: () => void;
}

export function TruckFilters({
  filters,
  onSearchChange,
  onRadiusChange,
  onClear,
}: TruckFiltersProps) {
  const hasFilters = filters.search !== "" || filters.radiusKm !== null;

  return (
    <div role="search" className="flex flex-col gap-2 sm:flex-row">
      <div className="relative flex-1">
        <Search
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          type="search"
          value={filters.search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Buscar por nome, placa ou rastreador"
          aria-label="Buscar caminhões"
          className="pl-9"
        />
      </div>
      <Select
        value={filters.radiusKm ? String(filters.radiusKm) : ANY_DISTANCE}
        onValueChange={(value) =>
          onRadiusChange(value === ANY_DISTANCE ? null : Number(value))
        }
      >
        <SelectTrigger className="w-full sm:w-52" aria-label="Distância máxima">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ANY_DISTANCE}>Qualquer distância</SelectItem>
          {RADIUS_OPTIONS_KM.map((radius) => (
            <SelectItem key={radius} value={String(radius)}>
              Até {formatNumber(radius)} km
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {hasFilters && (
        <Button variant="ghost" onClick={onClear}>
          <X />
          Limpar filtros
        </Button>
      )}
    </div>
  );
}
