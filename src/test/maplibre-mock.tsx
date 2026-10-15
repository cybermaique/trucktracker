import { useImperativeHandle, type ReactNode, type Ref } from "react";
import { vi } from "vitest";

/**
 * Test double for `@vis.gl/react-maplibre`: jsdom has no WebGL, so the map
 * renders its children (markers, popups) as plain DOM and exposes the map
 * instance methods as spies. Sources expose their GeoJSON for assertions.
 */

export const mapInstance = {
  flyTo: vi.fn(),
  fitBounds: vi.fn(),
  easeTo: vi.fn(),
  getZoom: () => 5,
  getSource: vi.fn(),
};

/** Coordinates delivered by the "map click" button below. */
export const MAP_CLICK_POSITION = { lat: -22.90685, lng: -43.1729 };

interface MapProps {
  children?: ReactNode;
  ref?: Ref<unknown>;
  onClick?: (event: unknown) => void;
  [prop: string]: unknown;
}

/** Props of the last rendered map, to trigger events with custom payloads. */
export const lastMapProps: { current: MapProps | null } = { current: null };

export function Map(props: MapProps) {
  const { children, ref, onClick } = props;
  // Test-only side channel, intentionally written during render.
  // eslint-disable-next-line react-hooks/immutability
  lastMapProps.current = props;
  useImperativeHandle(ref, () => mapInstance);
  return (
    <div data-testid="map">
      {children}
      <button
        type="button"
        onClick={() => onClick?.({ lngLat: MAP_CLICK_POSITION, features: [] })}
      >
        Simular clique no mapa
      </button>
    </div>
  );
}

export function Source({
  id,
  data,
  children,
}: {
  id: string;
  data: unknown;
  children?: ReactNode;
}) {
  return (
    <div data-testid={`source-${id}`} data-geojson={JSON.stringify(data)}>
      {children}
    </div>
  );
}

export const Layer = () => null;
export const NavigationControl = () => null;

export function Marker({ children }: { children?: ReactNode }) {
  return <div data-testid="marker">{children}</div>;
}

export function Popup({
  children,
  onClose,
}: {
  children?: ReactNode;
  onClose?: () => void;
}) {
  return (
    <div role="dialog" aria-label="Detalhes do caminhão">
      {children}
      <button type="button" onClick={onClose}>
        Fechar popup
      </button>
    </div>
  );
}
