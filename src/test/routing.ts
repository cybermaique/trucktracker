import { http, HttpResponse } from "msw";
import { distanceInKm } from "@/features/trucks/lib/distance";
import { ROUTING_BASE_URL } from "@/features/routing/routing-api";
import type { Coordinates } from "@/lib/coordinates";

/** Inverse of `decodePolyline`, used to build OSRM-like test responses. */
export function encodePolyline(
  positions: [longitude: number, latitude: number][],
  precision = 6
): string {
  const factor = 10 ** precision;
  let previousLatitude = 0;
  let previousLongitude = 0;
  let encoded = "";

  const encodeValue = (value: number) => {
    let current = value < 0 ? ~(value << 1) : value << 1;
    while (current >= 0x20) {
      encoded += String.fromCharCode((0x20 | (current & 0x1f)) + 63);
      current >>= 5;
    }
    encoded += String.fromCharCode(current + 63);
  };

  for (const [longitude, latitude] of positions) {
    const lat = Math.round(latitude * factor);
    const lng = Math.round(longitude * factor);
    encodeValue(lat - previousLatitude);
    encodeValue(lng - previousLongitude);
    previousLatitude = lat;
    previousLongitude = lng;
  }

  return encoded;
}

/** Road distance in tests: 25% longer than the straight line, at 70 km/h. */
export const ROAD_FACTOR = 1.25;
export const ROAD_SPEED_KMH = 70;

const parsePoint = (pair = ""): Coordinates => {
  const [longitude = 0, latitude = 0] = pair.split(",").map(Number);
  return { latitude, longitude };
};

/** OSRM stand-in: a two-point route with predictable distance and time. */
export const routingHandlers = [
  http.get(`${ROUTING_BASE_URL}/:coordinates`, ({ params }) => {
    const [from, to] = String(params.coordinates).split(";").map(parsePoint);
    if (!from || !to) return HttpResponse.json({ code: "InvalidQuery" });

    const km = distanceInKm(from, to) * ROAD_FACTOR;
    return HttpResponse.json({
      code: "Ok",
      routes: [
        {
          distance: km * 1000,
          duration: (km / ROAD_SPEED_KMH) * 3600,
          geometry: encodePolyline([
            [from.longitude, from.latitude],
            [to.longitude, to.latitude],
          ]),
        },
      ],
    });
  }),
];
