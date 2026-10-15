import "maplibre-gl/dist/maplibre-gl.css";
import "@/lib/maplibre";
import {
  Map,
  Marker,
  NavigationControl,
  type MapRef,
  type MarkerDragEvent,
} from "@vis.gl/react-maplibre";
import { LocateFixed, MapPin } from "lucide-react";
import { useRef } from "react";
import { useTheme } from "@/components/theme/theme-provider";
import { Button } from "@/components/ui/button";
import { useUserLocation } from "@/features/location/use-user-location";
import { formatCoordinate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Coordinates } from "../types";
import { MAP_STYLES } from "../lib/map-style";

interface LocationPickerProps {
  value: Coordinates | null;
  onChange: (coordinates: Coordinates) => void;
  invalid?: boolean;
  describedBy?: string;
}

const PICKER_ZOOM = 12;

/** Pick a location by clicking the map or dragging the marker. */
export function LocationPicker({
  value,
  onChange,
  invalid,
  describedBy,
}: LocationPickerProps) {
  const mapRef = useRef<MapRef>(null);
  const { resolvedTheme } = useTheme();
  const { data: userLocation } = useUserLocation();
  const initialCenter = value ?? userLocation?.coordinates;

  const moveTo = (coordinates: Coordinates) => {
    onChange(coordinates);
    mapRef.current?.flyTo({
      center: [coordinates.longitude, coordinates.latitude],
      zoom: Math.max(mapRef.current.getZoom(), PICKER_ZOOM),
    });
  };

  return (
    <div className="space-y-2">
      <div
        className={cn(
          "relative h-72 overflow-hidden rounded-lg border bg-muted",
          invalid && "border-destructive ring-3 ring-destructive/20"
        )}
        role="group"
        aria-label="Mapa para selecionar a localização"
        aria-describedby={describedBy}
      >
        <Map
          ref={mapRef}
          mapStyle={MAP_STYLES[resolvedTheme]}
          initialViewState={
            initialCenter
              ? { ...initialCenter, zoom: PICKER_ZOOM }
              : { latitude: -15, longitude: -50, zoom: 3.2 }
          }
          onClick={({ lngLat }) =>
            onChange({ latitude: lngLat.lat, longitude: lngLat.lng })
          }
          cursor="crosshair"
          attributionControl={{ compact: true }}
          style={{ width: "100%", height: "100%" }}
        >
          <NavigationControl position="top-right" showCompass={false} />
          {value && (
            <Marker
              longitude={value.longitude}
              latitude={value.latitude}
              anchor="bottom"
              draggable
              onDragEnd={({ lngLat }: MarkerDragEvent) =>
                onChange({ latitude: lngLat.lat, longitude: lngLat.lng })
              }
            >
              <MapPin
                className="size-9 fill-primary text-primary-foreground drop-shadow-md"
                aria-hidden
              />
            </Marker>
          )}
        </Map>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground" aria-live="polite">
          {value
            ? `Latitude ${formatCoordinate(value.latitude)} · Longitude ${formatCoordinate(value.longitude)}`
            : "Clique no mapa para marcar a posição do caminhão."}
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={userLocation?.source !== "device"}
          onClick={() => userLocation && moveTo(userLocation.coordinates)}
        >
          <LocateFixed />
          Usar minha localização
        </Button>
      </div>
    </div>
  );
}
