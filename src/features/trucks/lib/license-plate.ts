/**
 * Normalizes a Brazilian license plate while the user types.
 * Old format: `ABC-1234` · Mercosul format: `ABC1D23`.
 */
export function formatLicensePlate(value: string): string {
  const normalized = value
    .toUpperCase()
    .replace(/[^A-Z\d]/g, "")
    .slice(0, 7);

  return /^[A-Z]{3}\d{4}$/.test(normalized)
    ? `${normalized.slice(0, 3)}-${normalized.slice(3)}`
    : normalized;
}

/** Uppercase alphanumeric serial numbers, as printed on trackers. */
export const formatTrackerSerial = (value: string) =>
  value
    .toUpperCase()
    .replace(/[^A-Z\d]/g, "")
    .slice(0, 20);
