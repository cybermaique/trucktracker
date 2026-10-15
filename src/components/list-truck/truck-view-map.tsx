import "leaflet/dist/leaflet.css";
import { useEffect } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import { DEFAULT_LOCATION, TILE_LAYER } from "../../constants/map";
import { TruckApiResponse } from "../../interfaces/truck";
import { formatDate } from "../../utils/date";
import truckIcon from "../../utils/map/truck-icon";

interface MapProps {
  readonly trucks: readonly TruckApiResponse[];
  readonly selectedTruck: TruckApiResponse | null;
}

const SELECTED_TRUCK_ZOOM = 10;

const FlyToTruck = ({
  selectedTruck,
}: {
  selectedTruck: TruckApiResponse | null;
}) => {
  const map = useMap();

  useEffect(() => {
    if (!selectedTruck) return;

    const { latitude, longitude } = selectedTruck.coordinates;
    map.flyTo([latitude, longitude], SELECTED_TRUCK_ZOOM, { animate: true });
  }, [map, selectedTruck]);

  return null;
};

export const TruckViewMap = ({ trucks, selectedTruck }: MapProps) => (
  <MapContainer
    center={[DEFAULT_LOCATION.latitude, DEFAULT_LOCATION.longitude]}
    zoom={4}
    style={{ height: 400, width: "100%", borderRadius: 8 }}
  >
    <TileLayer url={TILE_LAYER.url} attribution={TILE_LAYER.attribution} />

    <FlyToTruck selectedTruck={selectedTruck} />

    {trucks.map((truck) => (
      <Marker
        key={truck.id}
        position={[truck.coordinates.latitude, truck.coordinates.longitude]}
        icon={truckIcon}
        alt={truck.identifier}
      >
        <Popup>
          <strong>{truck.identifier}</strong>
          <br />
          Placa: {truck.license_plate}
          <br />
          Rastreador: {truck.tracker_serial_number}
          <br />
          Início: {formatDate(truck.start_date)}
        </Popup>
      </Marker>
    ))}
  </MapContainer>
);
