import { queryOptions, useQuery } from "@tanstack/react-query";
import { trucksApi } from "./trucks-api";

/** Query key factory: every cache entry of this feature starts with `trucks`. */
export const truckKeys = {
  all: ["trucks"] as const,
  list: () => [...truckKeys.all, "list"] as const,
};

export const trucksQueryOptions = () =>
  queryOptions({
    queryKey: truckKeys.list(),
    queryFn: trucksApi.list,
  });

export const useTrucks = () => useQuery(trucksQueryOptions());
