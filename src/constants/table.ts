export const TRUCK_TABLE_COLUMNS = [
  { key: "image", label: "Imagem", sortable: false },
  { key: "identifier", label: "Identificador", sortable: false },
  { key: "license_plate", label: "Placa", sortable: false },
  { key: "tracker_serial_number", label: "Rastreador", sortable: false },
  { key: "distance", label: "Distância (km)", sortable: true },
  { key: "coordinates.latitude", label: "Latitude", sortable: false },
  { key: "coordinates.longitude", label: "Longitude", sortable: false },
  { key: "start_date", label: "Data de início", sortable: false },
  { key: "actions", label: "Ações", sortable: false },
] as const;

export const PAGE_SIZE_OPTIONS = [5, 10, 25, 50];

export const DEFAULT_PAGE_SIZE = PAGE_SIZE_OPTIONS[0];
