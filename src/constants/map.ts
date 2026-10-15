import { UserLocation } from "../interfaces/user-location";

/** São Paulo (SP) — used when the user's location is unavailable. */
export const DEFAULT_LOCATION: UserLocation = {
  latitude: -23.55052,
  longitude: -46.63331,
};

export const DEFAULT_LOCATION_LABEL = "São Paulo (SP)";

export const TILE_LAYER = {
  url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
} as const;
