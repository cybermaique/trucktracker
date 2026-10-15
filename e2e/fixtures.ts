import { test as base } from "@playwright/test";

/** Encodes `[longitude, latitude]` pairs as an OSRM polyline6 string. */
function encodePolyline6(positions: [number, number][]) {
  let previous = [0, 0];
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
    const point = [Math.round(latitude * 1e6), Math.round(longitude * 1e6)];
    encodeValue(point[0]! - previous[0]!);
    encodeValue(point[1]! - previous[1]!);
    previous = point;
  }
  return encoded;
}

/**
 * Keeps the suite hermetic: the external routing service (OSRM) is answered
 * with a deterministic straight-segment route of 105 km / 90 min.
 *
 * Routed on the browser context, not the page: with the MSW Service Worker
 * active, unhandled requests are re-issued by the worker, which page-level
 * routes don't see.
 */
export const test = base.extend({
  context: async ({ context }, use) => {
    await context.route("https://routing.openstreetmap.de/**", (route) => {
      const [, coordinates = ""] =
        new URL(route.request().url()).pathname.match(/driving\/(.+)$/) ?? [];
      const points = decodeURIComponent(coordinates)
        .split(";")
        .map((pair) => pair.split(",").map(Number) as [number, number]);

      return route.fulfill({
        json: {
          code: "Ok",
          routes: [
            {
              distance: 105_000,
              duration: 90 * 60,
              geometry: encodePolyline6(points),
            },
          ],
        },
      });
    });
    await use(context);
  },
});

export { expect } from "@playwright/test";
