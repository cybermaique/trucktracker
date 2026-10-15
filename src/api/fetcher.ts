import { TruckApiResponse } from "../interfaces/truck";

export const fetcher = async (url: string): Promise<TruckApiResponse[]> => {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Request to ${url} failed with status ${response.status}`);
  }

  const data = await response.json();
  return data.trucks;
};
