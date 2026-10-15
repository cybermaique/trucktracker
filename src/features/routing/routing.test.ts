import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";
import { distanceInKm } from "@/features/trucks/lib/distance";
import { encodePolyline, ROAD_FACTOR, ROAD_SPEED_KMH } from "@/test/routing";
import { server } from "@/test/server";
import { decodePolyline } from "./polyline";
import {
  fetchDrivingRoute,
  ROUTING_BASE_URL,
  RoutingError,
} from "./routing-api";

const JOAO_PESSOA = { latitude: -7.11509, longitude: -34.8641 };
const RECIFE = { latitude: -8.04756, longitude: -34.877 };

describe("decodePolyline", () => {
  it("decodes the reference example from the algorithm spec", () => {
    // https://developers.google.com/maps/documentation/utilities/polylinealgorithm
    expect(decodePolyline("_p~iF~ps|U_ulLnnqC_mqNvxq`@", 5)).toEqual([
      [-120.2, 38.5],
      [-120.95, 40.7],
      [-126.453, 43.252],
    ]);
  });

  it("round-trips precision 6 coordinates (OSRM polyline6)", () => {
    const route: [number, number][] = [
      [-34.8641, -7.11509],
      [-34.88012, -7.5],
      [-34.877, -8.04756],
    ];

    expect(decodePolyline(encodePolyline(route))).toEqual(route);
  });
});

describe("fetchDrivingRoute", () => {
  it("returns distance, duration and the decoded road geometry", async () => {
    const route = await fetchDrivingRoute(JOAO_PESSOA, RECIFE);
    const expectedKm = distanceInKm(JOAO_PESSOA, RECIFE) * ROAD_FACTOR;

    expect(route.distanceKm).toBeCloseTo(expectedKm, 1);
    expect(route.durationMinutes).toBeCloseTo(
      (expectedKm / ROAD_SPEED_KMH) * 60,
      0
    );
    expect(route.geometry.geometry.coordinates).toEqual([
      [JOAO_PESSOA.longitude, JOAO_PESSOA.latitude],
      [RECIFE.longitude, RECIFE.latitude],
    ]);
  });

  it.each([
    ["no route between the points", HttpResponse.json({ code: "NoRoute" })],
    ["a server error", HttpResponse.json(null, { status: 503 })],
  ])("rejects with a RoutingError on %s", async (_case, response) => {
    server.use(http.get(`${ROUTING_BASE_URL}/:coordinates`, () => response));

    await expect(fetchDrivingRoute(JOAO_PESSOA, RECIFE)).rejects.toBeInstanceOf(
      RoutingError
    );
  });
});
