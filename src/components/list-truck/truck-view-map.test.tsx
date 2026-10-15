import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TruckApiResponse } from "../../interfaces/truck";
import { TruckViewMap } from "./truck-view-map";

const flyTo = vi.fn();

vi.mock("react-leaflet", () => ({
  MapContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="map">{children}</div>
  ),
  TileLayer: () => <div data-testid="tile-layer" />,
  Marker: ({
    position,
    children,
  }: {
    position: [number, number];
    children: React.ReactNode;
  }) => (
    <div data-testid="marker" data-lat={position[0]} data-lng={position[1]}>
      {children}
    </div>
  ),
  Popup: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="popup">{children}</div>
  ),
  useMap: () => ({ flyTo }),
}));

const mockTrucks: TruckApiResponse[] = [
  {
    id: "1",
    identifier: "Truck A",
    license_plate: "ABC-1234",
    tracker_serial_number: "123456",
    coordinates: { latitude: -23.55, longitude: -46.63 },
    image: "",
    start_date: "2023-01-15T12:00:00Z",
  },
  {
    id: "2",
    identifier: "Truck B",
    license_plate: "DEF5G67",
    tracker_serial_number: "654321",
    coordinates: { latitude: -25.43, longitude: -49.27 },
    image: "",
    start_date: "2023-02-20T12:00:00Z",
  },
];

describe("TruckViewMap", () => {
  beforeEach(() => {
    flyTo.mockClear();
  });

  it("should render one marker per truck at its coordinates", () => {
    render(<TruckViewMap trucks={mockTrucks} selectedTruck={null} />);

    const markers = screen.getAllByTestId("marker");
    expect(markers).toHaveLength(2);
    expect(markers[0]).toHaveAttribute("data-lat", "-23.55");
    expect(markers[0]).toHaveAttribute("data-lng", "-46.63");
  });

  it("should show the truck details in the popup", () => {
    render(<TruckViewMap trucks={mockTrucks} selectedTruck={null} />);

    const [popup] = screen.getAllByTestId("popup");
    expect(popup).toHaveTextContent("Truck A");
    expect(popup).toHaveTextContent("Placa: ABC-1234");
    expect(popup).toHaveTextContent("Início: 15/01/2023");
  });

  it("should not move the map when no truck is selected", () => {
    render(<TruckViewMap trucks={mockTrucks} selectedTruck={null} />);

    expect(flyTo).not.toHaveBeenCalled();
  });

  it("should fly to the selected truck", () => {
    render(<TruckViewMap trucks={mockTrucks} selectedTruck={mockTrucks[1]} />);

    expect(flyTo).toHaveBeenCalledWith([-25.43, -49.27], 10, {
      animate: true,
    });
  });
});
