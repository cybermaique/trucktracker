import {
  useMutation,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";
import type { Truck } from "../types";
import { truckKeys } from "./queries";
import { trucksApi } from "./trucks-api";

type TruckList = Truck[] | undefined;

/**
 * Applies `update` to the cached list right away and returns a rollback
 * function, so the UI responds instantly and recovers if the request fails.
 */
async function optimisticallyUpdateList(
  queryClient: QueryClient,
  update: (trucks: Truck[]) => Truck[]
) {
  await queryClient.cancelQueries({ queryKey: truckKeys.list() });
  const previous = queryClient.getQueryData<Truck[]>(truckKeys.list());

  queryClient.setQueryData<TruckList>(truckKeys.list(), (trucks) =>
    trucks ? update(trucks) : trucks
  );

  return () => queryClient.setQueryData(truckKeys.list(), previous);
}

export function useCreateTruck() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: trucksApi.create,
    onSuccess: (created) => {
      queryClient.setQueryData<TruckList>(truckKeys.list(), (trucks) =>
        trucks ? [...trucks, created] : trucks
      );
    },
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: truckKeys.list() }),
  });
}

export function useUpdateTruck() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: trucksApi.update,
    onMutate: (updated) =>
      optimisticallyUpdateList(queryClient, (trucks) =>
        trucks.map((truck) => (truck.id === updated.id ? updated : truck))
      ),
    onError: (_error, _truck, rollback) => rollback?.(),
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: truckKeys.list() }),
  });
}

export function useDeleteTruck() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: trucksApi.remove,
    onMutate: (id) =>
      optimisticallyUpdateList(queryClient, (trucks) =>
        trucks.filter((truck) => truck.id !== id)
      ),
    onError: (_error, _id, rollback) => rollback?.(),
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: truckKeys.list() }),
  });
}

export function useResetDemoData() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: trucksApi.resetDemo,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: truckKeys.all }),
  });
}
