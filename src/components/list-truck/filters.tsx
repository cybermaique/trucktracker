import { Box, Button, TextField } from "@mui/material";
import { TruckFilters as Filters } from "../../interfaces/truck";
import { formatLicensePlate } from "../../utils/list-truck";

interface TruckFiltersProps {
  filters: Filters;
  setFilters: (filters: Filters) => void;
  onSearch: () => void;
  onKeyDown: (event: React.KeyboardEvent) => void;
  onClear: () => void;
}

const normalizers: Partial<Record<keyof Filters, (value: string) => string>> = {
  licensePlate: formatLicensePlate,
  trackerSerialNumber: (value) => value.toUpperCase().slice(0, 10),
};

export const TruckFilters = ({
  filters,
  setFilters,
  onSearch,
  onKeyDown,
  onClear,
}: TruckFiltersProps) => {
  const handleFilterChange =
    (field: keyof Filters) => (event: React.ChangeEvent<HTMLInputElement>) => {
      const normalize = normalizers[field];
      const { value } = event.target;
      setFilters({ ...filters, [field]: normalize ? normalize(value) : value });
    };

  const isFilterEmpty = Object.values(filters).every((value) => !value.trim());

  return (
    <Box
      role="search"
      display="flex"
      flexDirection={{ xs: "column", md: "row" }}
      justifyContent="space-between"
      gap={2}
      data-testid="truck-filters"
    >
      <Box
        display="flex"
        flexDirection={{ xs: "column", sm: "row" }}
        gap={2}
        flexWrap="wrap"
      >
        <TextField
          label="Placa"
          value={filters.licensePlate}
          onChange={handleFilterChange("licensePlate")}
          onKeyDown={onKeyDown}
        />
        <TextField
          label="Rastreador"
          value={filters.trackerSerialNumber}
          onChange={handleFilterChange("trackerSerialNumber")}
          onKeyDown={onKeyDown}
        />
        <TextField
          label="Distância Máxima (km)"
          type="number"
          value={filters.maxDistance}
          onChange={handleFilterChange("maxDistance")}
          onKeyDown={onKeyDown}
          slotProps={{ htmlInput: { min: 0 } }}
        />
      </Box>
      <Box display="flex" gap={2} alignItems="center">
        <Button
          variant="outlined"
          onClick={onClear}
          size="large"
          disabled={isFilterEmpty}
          sx={{ flex: { xs: 1, md: "initial" } }}
        >
          Limpar
        </Button>
        <Button
          variant="contained"
          onClick={onSearch}
          size="large"
          disabled={isFilterEmpty}
          sx={{ flex: { xs: 1, md: "initial" } }}
        >
          Buscar
        </Button>
      </Box>
    </Box>
  );
};
