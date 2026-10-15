const LOCALE = "pt-BR";

const integerFormatter = new Intl.NumberFormat(LOCALE, {
  maximumFractionDigits: 0,
});
const decimalFormatter = new Intl.NumberFormat(LOCALE, {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});
const coordinateFormatter = new Intl.NumberFormat(LOCALE, {
  minimumFractionDigits: 5,
  maximumFractionDigits: 5,
});
const dateFormatter = new Intl.DateTimeFormat(LOCALE, {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: "UTC",
});
const dateTimeFormatter = new Intl.DateTimeFormat(LOCALE, {
  dateStyle: "short",
  timeStyle: "short",
});

export const formatNumber = (value: number) => integerFormatter.format(value);

/** `850 m`, `3,2 km` or `1.245 km`. */
export const formatDistance = (km: number) => {
  if (km < 1) return `${integerFormatter.format(km * 1000)} m`;
  if (km < 10) return `${decimalFormatter.format(km)} km`;
  return `${integerFormatter.format(km)} km`;
};

export const formatCoordinate = (value: number) =>
  coordinateFormatter.format(value);

/** Formats a date-only ISO string (`YYYY-MM-DD`) without timezone shifts. */
export const formatDate = (isoDate: string) =>
  dateFormatter.format(new Date(`${isoDate.slice(0, 10)}T00:00:00Z`));

export const formatDateTime = (date: Date) => dateTimeFormatter.format(date);

/** Today's date as `YYYY-MM-DD` in the user's timezone. */
export const todayIsoDate = () => {
  const now = new Date();
  const offsetMs = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - offsetMs).toISOString().slice(0, 10);
};
