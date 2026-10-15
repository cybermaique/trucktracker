import useSWR from "swr";
import { fetcher } from "../api/fetcher";
import { API_ROUTES } from "../constants/api";
import { TruckApiResponse } from "../interfaces/truck";

export const useGetTrucks = () =>
  useSWR<TruckApiResponse[]>(API_ROUTES.trucks, fetcher);
