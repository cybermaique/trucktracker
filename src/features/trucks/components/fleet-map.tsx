import "maplibre-gl/dist/maplibre-gl.css";
import "@/lib/maplibre";
import {
  Layer,
  Map,
  Marker,
  NavigationControl,
  Popup,
  Source,
  type LayerProps,
  type MapLayerMouseEvent,
  type MapRef,
} from "@vis.gl/react-maplibre";
import type { GeoJSONSource } from "maplibre-gl";
import { Maximize2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTheme } from "@/components/theme/theme-provider";
import { Button } from "@/components/ui/button";
import type { UserLocation } from "@/features/location/use-user-location";
import { formatDistance } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  boundsOf,
  connectionLine,
  radiusPolygon,
  trucksToFeatureCollection,
} from "../lib/geo";
import { MAP_STYLES } from "../lib/map-style";
import type { TruckWithDistance } from "../types";
import { TruckAvatar } from "./truck-avatar";

const BRAND = "#2563eb";
const HIGHLIGHT = "#f97316";
const FIT_PADDING = 56;
const SELECTED_ZOOM = 9;

const clusterLayer: LayerProps = {
  id: "clusters",
  type: "circle",
  source: "trucks",
  filter: ["has", "point_count"],
  paint: {
    "circle-color": BRAND,
    "circle-opacity": 0.85,
    "circle-stroke-color": "#ffffff",
    "circle-stroke-width": 2,
    "circle-radius": ["step", ["get", "point_count"], 16, 5, 20, 10, 26],
  },
};

const clusterCountLayer: LayerProps = {
  id: "cluster-count",
  type: "symbol",
  source: "trucks",
  filter: ["has", "point_count"],
  layout: {
    "text-field": "{point_count_abbreviated}",
    "text-font": ["Noto Sans Bold"],
    "text-size": 13,
  },
  paint: { "text-color": "#ffffff" },
};

const truckLayer: LayerProps = {
  id: "truck-points",
  type: "circle",
  source: "trucks",
  filter: ["!", ["has", "point_count"]],
  paint: {
    "circle-color": BRAND,
    "circle-radius": 7,
    "circle-stroke-color": "#ffffff",
    "circle-stroke-width": 2,
  },
};

const INTERACTIVE_LAYERS = ["clusters", "truck-points"];

interface FleetMapProps {
  trucks: TruckWithDistance[];
  origin?: UserLocation;
  selectedTruckId?: string | null;
  onSelectTruck?: (id: string | null) => void;
  /** Draws the search radius around the user when set. */
  radiusKm?: number | null;
  className?: string;
}

export function FleetMap({
  trucks,
  origin,
  selectedTruckId = null,
  onSelectTruck,
  radiusKm = null,
  className,
}: FleetMapProps) {
  const mapRef = useRef<MapRef>(null);
  const { resolvedTheme } = useTheme();
  const [cursor, setCursor] = useState("");

  const selectedTruck = trucks.find((truck) => truck.id === selectedTruckId);
  const fleetBounds = boundsOf([
    ...trucks.map((truck) => truck.coordinates),
    ...(origin ? [origin.coordinates] : []),
  ]);

  // A truck selected on arrival (shared URL) starts centered; otherwise the
  // whole fleet is framed. Later selections fly there (effect below).
  const initialView = selectedTruck
    ? { ...selectedTruck.coordinates, zoom: SELECTED_ZOOM }
    : fleetBounds
      ? { bounds: fleetBounds, fitBoundsOptions: { padding: FIT_PADDING } }
      : { latitude: -15, longitude: -50, zoom: 3.2 };

  useEffect(() => {
    if (!selectedTruck) return;
    const { longitude, latitude } = selectedTruck.coordinates;
    const map = mapRef.current;
    map?.flyTo({
      center: [longitude, latitude],
      zoom: Math.max(map.getZoom(), SELECTED_ZOOM),
      duration: 1200,
    });
  }, [selectedTruck]);

  const fitFleet = () => {
    if (fleetBounds) {
      mapRef.current?.fitBounds(fleetBounds, {
        padding: FIT_PADDING,
        duration: 800,
      });
    }
  };

  const handleClick = async (event: MapLayerMouseEvent) => {
    const feature = event.features?.[0];
    if (!feature) return;

    if (feature.layer.id === "clusters") {
      const source = mapRef.current?.getSource<GeoJSONSource>("trucks");
      const zoom = await source?.getClusterExpansionZoom(
        Number(feature.properties.cluster_id)
      );
      if (feature.geometry.type === "Point" && zoom !== undefined) {
        const [longitude = 0, latitude = 0] = feature.geometry.coordinates;
        mapRef.current?.easeTo({ center: [longitude, latitude], zoom });
      }
      return;
    }

    onSelectTruck?.(String(feature.properties.id));
  };

  return (
    <div
      role="region"
      aria-label="Mapa da frota"
      className={cn(
        "relative isolate overflow-hidden rounded-xl border bg-muted",
        className
      )}
    >
      <p className="sr-only">
        Mapa com {trucks.length} caminhões. A tabela de caminhões oferece as
        mesmas informações com navegação por teclado.
      </p>
      <Map
        ref={mapRef}
        mapStyle={MAP_STYLES[resolvedTheme]}
        initialViewState={initialView}
        interactiveLayerIds={INTERACTIVE_LAYERS}
        onClick={handleClick}
        onMouseEnter={() => setCursor("pointer")}
        onMouseLeave={() => setCursor("")}
        cursor={cursor}
        attributionControl={{ compact: true }}
        style={{ width: "100%", height: "100%" }}
      >
        <NavigationControl position="top-right" showCompass={false} />

        {origin && radiusKm && (
          <Source
            id="radius"
            type="geojson"
            data={radiusPolygon(origin.coordinates, radiusKm)}
          >
            <Layer
              id="radius-fill"
              type="fill"
              paint={{ "fill-color": BRAND, "fill-opacity": 0.08 }}
            />
            <Layer
              id="radius-outline"
              type="line"
              paint={{
                "line-color": BRAND,
                "line-width": 1.5,
                "line-dasharray": [2, 2],
              }}
            />
          </Source>
        )}

        {origin && selectedTruck && (
          <Source
            id="connection"
            type="geojson"
            data={connectionLine(origin.coordinates, selectedTruck.coordinates)}
          >
            <Layer
              id="connection-line"
              type="line"
              paint={{
                "line-color": HIGHLIGHT,
                "line-width": 2,
                "line-dasharray": [1.5, 1.5],
              }}
            />
          </Source>
        )}

        <Source
          id="trucks"
          type="geojson"
          data={trucksToFeatureCollection(trucks)}
          cluster
          clusterRadius={44}
          clusterMaxZoom={8}
        >
          <Layer {...clusterLayer} />
          <Layer {...clusterCountLayer} />
          <Layer {...truckLayer} />
          <Layer
            id="truck-selected"
            type="circle"
            filter={["==", ["get", "id"], selectedTruckId ?? ""]}
            paint={{
              "circle-color": HIGHLIGHT,
              "circle-radius": 10,
              "circle-stroke-color": "#ffffff",
              "circle-stroke-width": 3,
            }}
          />
        </Source>

        {origin && (
          <Marker
            longitude={origin.coordinates.longitude}
            latitude={origin.coordinates.latitude}
          >
            <span
              className="relative flex size-4"
              title={
                origin.source === "device"
                  ? "Sua localização"
                  : "Localização padrão"
              }
            >
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex size-4 rounded-full border-2 border-white bg-emerald-500 shadow" />
            </span>
          </Marker>
        )}

        {selectedTruck && (
          <Popup
            longitude={selectedTruck.coordinates.longitude}
            latitude={selectedTruck.coordinates.latitude}
            offset={14}
            closeOnClick={false}
            // Keep focus where the user acted (e.g. the table row).
            focusAfterOpen={false}
            onClose={() => onSelectTruck?.(null)}
            maxWidth="280px"
          >
            <div className="flex items-center gap-3 pr-4">
              <TruckAvatar truck={selectedTruck} className="size-10" />
              <div className="min-w-0 text-sm">
                <p className="truncate font-semibold">
                  {selectedTruck.identifier}
                </p>
                <p className="text-muted-foreground">
                  {selectedTruck.licensePlate} ·{" "}
                  {formatDistance(selectedTruck.distanceKm)}
                </p>
              </div>
            </div>
          </Popup>
        )}
      </Map>

      {fleetBounds && (
        <Button
          variant="secondary"
          size="sm"
          className="absolute top-2.5 left-2.5 shadow-sm"
          onClick={fitFleet}
        >
          <Maximize2 />
          Enquadrar frota
        </Button>
      )}
    </div>
  );
}
