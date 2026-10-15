export const API_ROUTES = {
  trucks: "/api/caminhoes",
  truck: "/api/caminhao",
  truckById: (id: string) => `/api/caminhao/${id}`,
} as const;
