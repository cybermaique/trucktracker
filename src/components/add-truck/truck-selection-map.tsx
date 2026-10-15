import "leaflet/dist/leaflet.css";
import { LatLngLiteral } from "leaflet";
import { useEffect } from "react";
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import { DEFAULT_LOCATION, TILE_LAYER } from "../../constants/map";
import truckIcon from "../../utils/map/truck-icon";

interface TruckSelectionMapProps {
  position: LatLngLiteral | null;
  onSelect: (position: LatLngLiteral) => void;
}

const LocationMarker = ({ position, onSelect }: TruckSelectionMapProps) => {
  const map = useMap();

  useEffect(() => {
    if (position) map.setView(position, map.getZoom());
  }, [position, map]);

  useMapEvents({
    click: (event) => onSelect(event.latlng),
  });

  return position ? <Marker position={position} icon={truckIcon} /> : null;
};

const TruckSelectionMap = ({ position, onSelect }: TruckSelectionMapProps) => (
  <MapContainer
    center={
      position ?? {
        lat: DEFAULT_LOCATION.latitude,
        lng: DEFAULT_LOCATION.longitude,
      }
    }
    zoom={13}
    style={{ height: 320, width: "100%", borderRadius: 8 }}
  >
    <TileLayer url={TILE_LAYER.url} attribution={TILE_LAYER.attribution} />
    <LocationMarker position={position} onSelect={onSelect} />
  </MapContainer>
);

export default TruckSelectionMap;
