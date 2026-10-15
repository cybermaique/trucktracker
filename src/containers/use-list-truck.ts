import { useEffect, useMemo, useState } from "react";
import useUserLocation from "../hooks/use-user-location";
import { TruckFilters } from "../interfaces/truck";
import { useGetTrucks } from "../services/get-trucks";
import { useSnackbarStore } from "../stores/snackbar";
import { sortAndFilterTrucks } from "../utils/list-truck";

export const useListTruck = (appliedFilters: TruckFilters) => {
  const { data: trucks, error, isLoading: isFetching } = useGetTrucks();
  const { location: userLocation } = useUserLocation();
  const showSnackbar = useSnackbarStore((state) => state.showSnackbar);
  const [isDistanceDescending, setIsDistanceDescending] = useState(false);

  // Distances depend on the user's position, so the list is only ready once
  // both the API response and the location (real or fallback) are available.
  const isLoading = isFetching || !userLocation;

  const filteredTrucks = useMemo(
    () =>
      userLocation
        ? sortAndFilterTrucks(
            trucks ?? [],
            appliedFilters,
            isDistanceDescending,
            userLocation
          )
        : [],
    [trucks, appliedFilters, isDistanceDescending, userLocation]
  );

  useEffect(() => {
    if (error) showSnackbar("Erro ao carregar os veículos.", "error");
  }, [error, showSnackbar]);

  return {
    trucks: filteredTrucks,
    isLoading,
    hasError: Boolean(error),
    hasData: !isLoading && filteredTrucks.length > 0,
    isDistanceDescending,
    setIsDistanceDescending,
  };
};
