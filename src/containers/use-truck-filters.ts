import { useState } from "react";
import { TruckFilters } from "../interfaces/truck";

export const EMPTY_FILTERS: TruckFilters = {
  licensePlate: "",
  trackerSerialNumber: "",
  maxDistance: "",
};

export const useTruckFilters = () => {
  const [filters, setFilters] = useState<TruckFilters>(EMPTY_FILTERS);
  const [appliedFilters, setAppliedFilters] =
    useState<TruckFilters>(EMPTY_FILTERS);

  const handleSearch = () => setAppliedFilters(filters);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") handleSearch();
  };

  const handleClear = () => {
    setFilters(EMPTY_FILTERS);
    setAppliedFilters(EMPTY_FILTERS);
  };

  return {
    filters,
    setFilters,
    appliedFilters,
    handleSearch,
    handleKeyDown,
    handleClear,
  };
};
