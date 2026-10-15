import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LeafletMouseEvent } from "leaflet";
import { Response } from "miragejs";
import { SWRConfig } from "swr";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import AddTruck from ".";
import { useSnackbarStore } from "../../stores/snackbar";
import { mockGeolocationSuccess } from "../../tests/geolocation";
import { server } from "../../tests/mock-server";

let mapClickHandler: ((event: LeafletMouseEvent) => void) | undefined;

vi.mock("react-leaflet", () => ({
  MapContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="map">{children}</div>
  ),
  TileLayer: () => null,
  Marker: ({ position }: { position: { lat: number; lng: number } }) => (
    <div data-testid="marker" data-lat={position.lat} data-lng={position.lng} />
  ),
  useMap: () => ({ setView: vi.fn(), getZoom: () => 13 }),
  useMapEvents: (handlers: { click: (event: LeafletMouseEvent) => void }) => {
    mapClickHandler = handlers.click;
  },
}));

const USER_LOCATION = { latitude: -25.43247, longitude: -49.27845 };

const renderPage = () =>
  render(
    <SWRConfig value={{ provider: () => new Map() }}>
      <AddTruck />
    </SWRConfig>
  );

const fillForm = async () => {
  await userEvent.type(screen.getByLabelText(/identificador/i), "Caminhão 1");
  await userEvent.type(screen.getByLabelText(/placa/i), "abc1234");
  await userEvent.type(
    screen.getByLabelText(/número de série do rastreador/i),
    "T12345"
  );
};

describe("AddTruck page", () => {
  beforeEach(() => {
    mockGeolocationSuccess(USER_LOCATION);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    useSnackbarStore.getState().closeSnackbar();
  });

  it("should render the form", () => {
    renderPage();

    expect(screen.getByLabelText(/identificador/i)).toBeRequired();
    expect(screen.getByLabelText(/placa/i)).toBeRequired();
    expect(
      screen.getByLabelText(/número de série do rastreador/i)
    ).toBeRequired();
    expect(
      screen.getByRole("button", { name: /salvar caminhão/i })
    ).toBeEnabled();
  });

  it("should pre-select the user's current location", async () => {
    renderPage();

    expect(
      await screen.findByText("Latitude: -25.43247 | Longitude: -49.27845")
    ).toBeInTheDocument();
    expect(screen.getByTestId("marker")).toHaveAttribute(
      "data-lat",
      String(USER_LOCATION.latitude)
    );
  });

  it("should format the license plate while typing", async () => {
    renderPage();

    await userEvent.type(screen.getByLabelText(/placa/i), "abc1234");

    expect(screen.getByLabelText(/placa/i)).toHaveValue("ABC-1234");
  });

  it("should show validation errors when submitting an empty form", async () => {
    renderPage();

    await userEvent.click(
      screen.getByRole("button", { name: /salvar caminhão/i })
    );

    expect(
      await screen.findByText(
        "O identificador deve ter pelo menos 3 caracteres"
      )
    ).toBeInTheDocument();
    expect(screen.getByText("Placa inválida")).toBeInTheDocument();
    expect(screen.getByText("Número de série inválido")).toBeInTheDocument();
  });

  it("should select a location by clicking on the map", async () => {
    renderPage();

    act(() =>
      mapClickHandler?.({
        latlng: { lat: -23.5, lng: -46.6 },
      } as LeafletMouseEvent)
    );

    expect(
      await screen.findByText("Latitude: -23.50000 | Longitude: -46.60000")
    ).toBeInTheDocument();
  });

  it("should register the truck and reset the form", async () => {
    renderPage();
    await screen.findByText(/Latitude: -25.43247/);

    await fillForm();
    await userEvent.click(
      screen.getByRole("button", { name: /salvar caminhão/i })
    );

    await waitFor(() =>
      expect(useSnackbarStore.getState()).toMatchObject({
        message: "Caminhão cadastrado com sucesso!",
        severity: "success",
      })
    );
    expect(server.db.trucks).toHaveLength(1);
    expect(server.db.trucks[0]).toMatchObject({
      identifier: "Caminhão 1",
      license_plate: "ABC-1234",
      tracker_serial_number: "T12345",
      coordinates: USER_LOCATION,
    });
    expect(screen.getByLabelText(/identificador/i)).toHaveValue("");
  });

  it("should reject images larger than 2MB", async () => {
    renderPage();
    const largeImage = new File(["x"], "truck.png", { type: "image/png" });
    Object.defineProperty(largeImage, "size", { value: 3 * 1024 * 1024 });

    await userEvent.upload(
      screen.getByLabelText(/selecionar imagem/i),
      largeImage
    );

    expect(useSnackbarStore.getState()).toMatchObject({
      message: "A imagem deve ter no máximo 2MB.",
      severity: "error",
    });
  });

  it("should notify when the API rejects the truck", async () => {
    // Overrides the route for the rest of this file, so this test runs last.
    server.post("/caminhao", () => new Response(500));
    renderPage();
    await screen.findByText(/Latitude: -25.43247/);

    await fillForm();
    await userEvent.click(
      screen.getByRole("button", { name: /salvar caminhão/i })
    );

    await waitFor(() =>
      expect(useSnackbarStore.getState()).toMatchObject({
        message: "Erro ao cadastrar caminhão.",
        severity: "error",
      })
    );
  });
});
