import { useEffect, useEffectEvent, useState } from "react";
import { useSearchParams } from "react-router";
import type { TruckFilters } from "../lib/filter-trucks";

export const RADIUS_OPTIONS_KM = [100, 500, 1000, 2000] as const;

const PARAMS = { search: "q", radius: "raio", selected: "caminhao" } as const;

/** Typing pause before the search is written to the URL. */
const SEARCH_URL_DEBOUNCE_MS = 300;

interface FleetViewState {
  search: string;
  radiusKm: number | null;
  selectedTruckId: string | null;
}

const parseRadius = (value: string | null): number | null => {
  const radius = Number(value);
  return value && Number.isFinite(radius) && radius > 0 ? radius : null;
};

const fromSearchParams = (params: URLSearchParams): FleetViewState => ({
  search: params.get(PARAMS.search) ?? "",
  radiusKm: parseRadius(params.get(PARAMS.radius)),
  selectedTruckId: params.get(PARAMS.selected),
});

const toSearchParams = ({
  search,
  radiusKm,
  selectedTruckId,
}: FleetViewState) => {
  const params = new URLSearchParams();
  if (search) params.set(PARAMS.search, search);
  if (radiusKm) params.set(PARAMS.radius, String(radiusKm));
  if (selectedTruckId) params.set(PARAMS.selected, selectedTruckId);
  return params;
};

/**
 * Filters and the selected truck are mirrored in the URL, so any view of the
 * fleet can be bookmarked, shared or restored.
 *
 * URL updates are (async) navigations, so local state is the source of truth:
 * the UI reacts in the same frame and the URL follows (search after a typing
 * pause, everything else immediately). Writes always serialize the complete
 * state, so quick successive changes never overwrite each other. The URL only
 * replaces local state when it changes from elsewhere (e.g. a sidebar link).
 */
export function useTruckFilters() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlKey = searchParams.toString();

  const [view, setView] = useState(() => fromSearchParams(searchParams));
  const [lastWrittenKey, setLastWrittenKey] = useState(urlKey);
  const [observedUrlKey, setObservedUrlKey] = useState(urlKey);
  if (urlKey !== observedUrlKey) {
    setObservedUrlKey(urlKey);
    if (urlKey !== lastWrittenKey) setView(fromSearchParams(searchParams));
  }

  const writeToUrl = (next: FleetViewState) => {
    const params = toSearchParams(next);
    setLastWrittenKey(params.toString());
    setSearchParams(params, { replace: true });
  };

  const change = (changes: Partial<FleetViewState>) => {
    const next = { ...view, ...changes };
    setView(next);
    writeToUrl(next);
  };

  // An Effect Event reads the latest state without re-running the effect.
  const flushSearch = useEffectEvent(() => writeToUrl(view));
  const pendingKey = toSearchParams(view).toString();

  useEffect(() => {
    if (pendingKey === lastWrittenKey) return;
    const timeout = setTimeout(flushSearch, SEARCH_URL_DEBOUNCE_MS);
    return () => clearTimeout(timeout);
  }, [pendingKey, lastWrittenKey]);

  const filters: TruckFilters = {
    search: view.search,
    radiusKm: view.radiusKm,
  };

  return {
    filters,
    selectedTruckId: view.selectedTruckId,
    setSearch: (search: string) => setView({ ...view, search }),
    setRadius: (radiusKm: number | null) => change({ radiusKm }),
    selectTruck: (selectedTruckId: string | null) =>
      change({ selectedTruckId }),
    clearFilters: () => change({ search: "", radiusKm: null }),
  };
}
