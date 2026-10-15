import { act, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { lastMapProps, mapInstance } from "@/test/maplibre-mock";
import { renderWithProviders } from "@/test/render";
import type { TruckWithDistance } from "../types";
import { FleetMap } from "./fleet-map";

const trucks: TruckWithDistance[] = [
  {
    id: "1",
    identifier: "Volvo FH 540 · São Paulo (SP)",
    licensePlate: "FRT-2A41",
    trackerSerialNumber: "VT540SP01",
    coordinates: { latitude: -23.5617, longitude: -46.6559 },
    imageUrl: null,
    startDate: "2023-03-14",
    distanceKm: 2.6,
  },
  {
    id: "2",
    identifier: "Scania R 450 · Campinas (SP)",
    licensePlate: "CMP4E21",
    trackerSerialNumber: "SC450CP02",
    coordinates: { latitude: -22.9056, longitude: -47.0608 },
    imageUrl: null,
    startDate: "2024-07-02",
    distanceKm: 84,
  },
];

const origin = {
  coordinates: { latitude: -23.55, longitude: -46.63 },
  source: "device" as const,
};

const geojsonOf = (testId: string) =>
  JSON.parse(screen.getByTestId(testId).dataset.geojson ?? "null");

const clickFeature = (layerId: string, properties: object) =>
  act(async () =>
    lastMapProps.current?.onClick?.({
      features: [
        {
          layer: { id: layerId },
          properties,
          geometry: { type: "Point", coordinates: [-47, -23] },
        },
      ],
    })
  );

describe("FleetMap", () => {
  it("plots the trucks and the user's position", () => {
    renderWithProviders(<FleetMap trucks={trucks} origin={origin} />);

    expect(geojsonOf("source-trucks").features).toHaveLength(2);
    expect(screen.getByTitle("Sua localização")).toBeInTheDocument();
    expect(screen.queryByTestId("source-radius")).not.toBeInTheDocument();
  });

  it("draws the search radius and the route to the selected truck", () => {
    renderWithProviders(
      <FleetMap
        trucks={trucks}
        origin={origin}
        selectedTruckId="2"
        radiusKm={100}
      />
    );

    expect(geojsonOf("source-radius").geometry.type).toBe("Polygon");
    expect(geojsonOf("source-connection").geometry.coordinates).toEqual([
      [-46.63, -23.55],
      [-47.0608, -22.9056],
    ]);
    expect(
      screen.getByRole("dialog", { name: "Detalhes do caminhão" })
    ).toHaveTextContent("CMP4E21 · 84 km");
    expect(mapInstance.flyTo).toHaveBeenCalledWith(
      expect.objectContaining({ center: [-47.0608, -22.9056] })
    );
  });

  it("selects a truck clicked on the map", async () => {
    const onSelectTruck = vi.fn();
    renderWithProviders(
      <FleetMap trucks={trucks} origin={origin} onSelectTruck={onSelectTruck} />
    );

    await clickFeature("truck-points", { id: "1" });

    expect(onSelectTruck).toHaveBeenCalledWith("1");
  });

  it("clears the selection when the popup is closed", async () => {
    const onSelectTruck = vi.fn();
    const { user } = renderWithProviders(
      <FleetMap
        trucks={trucks}
        origin={origin}
        selectedTruckId="1"
        onSelectTruck={onSelectTruck}
      />
    );

    await user.click(screen.getByRole("button", { name: "Fechar popup" }));

    expect(onSelectTruck).toHaveBeenCalledWith(null);
  });

  it("zooms into a cluster when it is clicked", async () => {
    mapInstance.getSource.mockReturnValue({
      getClusterExpansionZoom: vi.fn().mockResolvedValue(7),
    });
    renderWithProviders(<FleetMap trucks={trucks} origin={origin} />);

    await clickFeature("clusters", { cluster_id: 42 });

    expect(mapInstance.easeTo).toHaveBeenCalledWith({
      center: [-47, -23],
      zoom: 7,
    });
  });

  it("fits the whole fleet in view on demand", async () => {
    const { user } = renderWithProviders(
      <FleetMap trucks={trucks} origin={origin} />
    );

    await user.click(screen.getByRole("button", { name: "Enquadrar frota" }));

    expect(mapInstance.fitBounds).toHaveBeenCalledWith(
      [
        [-47.0608, -23.5617],
        [-46.63, -22.9056],
      ],
      expect.objectContaining({ padding: 56 })
    );
  });
});
