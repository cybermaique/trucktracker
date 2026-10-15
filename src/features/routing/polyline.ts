import type { Position } from "geojson";

/**
 * Decodes an encoded polyline (Google's algorithm, used by OSRM) into GeoJSON
 * positions (`[longitude, latitude]`). OSRM's `polyline6` uses precision 6.
 * It is ~5x smaller than GeoJSON, which matters for long, detailed routes.
 */
export function decodePolyline(encoded: string, precision = 6): Position[] {
  const factor = 10 ** precision;
  const positions: Position[] = [];
  let index = 0;
  let latitude = 0;
  let longitude = 0;

  const nextDelta = () => {
    let result = 0;
    let shift = 0;
    let byte: number;
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    return result & 1 ? ~(result >> 1) : result >> 1;
  };

  while (index < encoded.length) {
    latitude += nextDelta();
    longitude += nextDelta();
    positions.push([longitude / factor, latitude / factor]);
  }

  return positions;
}
