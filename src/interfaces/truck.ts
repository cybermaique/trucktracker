export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface TruckApiResponse {
  id: string;
  identifier: string;
  license_plate: string;
  tracker_serial_number: string;
  coordinates: Coordinates;
  image: string;
  start_date: string;
}

export interface TruckWithDistance extends TruckApiResponse {
  distance: number;
}

export type NewTruck = Omit<TruckApiResponse, "id">;

export interface TruckFilters {
  licensePlate: string;
  trackerSerialNumber: string;
  maxDistance: string;
}
