import { Coordinates } from "./truck";

export type UserLocation = Coordinates;

/**
 * - `pending`: waiting for the browser to answer the geolocation request.
 * - `granted`: the user's real position is available.
 * - `fallback`: geolocation was denied/unavailable, a default position is used.
 */
export type UserLocationStatus = "pending" | "granted" | "fallback";
