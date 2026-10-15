import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SWRConfig } from "swr";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ListTruck from ".";
import { TruckApiResponse } from "../../interfaces/truck";
import { useSnackbarStore } from "../../stores/snackbar";
import {
  mockGeolocationDenied,
  mockGeolocationSuccess,
} from "../../tests/geolocation";
import { server } from "../../tests/mock-server";
import { downloadTruckReport } from "../../utils/truck-report";

vi.mock("react-leaflet", () => ({
  MapContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="map">{children}</div>
  ),
  TileLayer: () => null,
  Marker: () => <div data-testid="marker" />,
  Popup: () => null,
  useMap: () => ({ flyTo: vi.fn() }),
}));

vi.mock("../../utils/truck-report", () => ({
  downloadTruckReport: vi.fn(),
}));

const SAO_PAULO = { latitude: -23.55052, longitude: -46.63331 };

const buildTruck = (
  id: string,
  identifier: string,
  license_plate: string,
  latitude: number,
  longitude: number
): TruckApiResponse => ({
  id,
  identifier,
  license_plate,
  tracker_serial_number: `T${id}0000`,
  coordinates: { latitude, longitude },
  image: "",
  start_date: "2024-01-01T12:00:00Z",
});

const TRUCKS = [
  buildTruck("1", "Rio de Janeiro", "RIO-0001", -22.9068, -43.1729),
  buildTruck("2", "São Paulo", "SPO-0002", -23.5617, -46.6559),
  buildTruck("3", "Curitiba", "CWB-0003", -25.4284, -49.2733),
];

const renderPage = () =>
  render(
    <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <ListTruck />
      </LocalizationProvider>
    </SWRConfig>
  );

const getRowIdentifiers = () =>
  within(screen.getByRole("table"))
    .getAllByRole("row")
    .slice(1)
    .map((row) => within(row).getAllByRole("cell")[1].textContent);

describe("ListTruck page", () => {
  beforeEach(() => {
    TRUCKS.forEach((truck) => server.create("truck", truck));
    mockGeolocationSuccess(SAO_PAULO);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    useSnackbarStore.getState().closeSnackbar();
  });

  it("should render the header and a loading skeleton", () => {
    renderPage();

    expect(
      screen.getByRole("heading", { name: "Listagem de Caminhões" })
    ).toBeInTheDocument();
    expect(screen.getAllByTestId("Skeleton").length).toBeGreaterThan(0);
  });

  it("should list the trucks sorted by proximity, with a marker on the map", async () => {
    renderPage();

    await screen.findByRole("table");

    expect(getRowIdentifiers()).toEqual([
      "São Paulo",
      "Curitiba",
      "Rio de Janeiro",
    ]);
    expect(screen.getAllByTestId("marker")).toHaveLength(3);
  });

  it("should invert the order when sorting by distance", async () => {
    renderPage();
    await screen.findByRole("table");

    await userEvent.click(screen.getByText("Distância (km)"));

    expect(getRowIdentifiers()).toEqual([
      "Rio de Janeiro",
      "Curitiba",
      "São Paulo",
    ]);
  });

  it("should keep the filters available when no truck matches them", async () => {
    renderPage();
    await screen.findByRole("table");

    await userEvent.type(screen.getByLabelText("Placa"), "ZZZ{Enter}");

    expect(
      await screen.findByText("Nenhum caminhão encontrado")
    ).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Limpar" }));

    expect(await screen.findByRole("table")).toBeInTheDocument();
    expect(getRowIdentifiers()).toHaveLength(3);
  });

  it("should filter by license plate", async () => {
    renderPage();
    await screen.findByRole("table");

    await userEvent.type(screen.getByLabelText("Placa"), "cwb");
    await userEvent.click(screen.getByRole("button", { name: "Buscar" }));

    expect(getRowIdentifiers()).toEqual(["Curitiba"]);
  });

  it("should still list the trucks when geolocation is denied", async () => {
    mockGeolocationDenied();
    renderPage();

    expect(await screen.findByRole("table")).toBeInTheDocument();
    expect(useSnackbarStore.getState().severity).toBe("warning");
  });

  it("should export the listed trucks to PDF", async () => {
    renderPage();
    await screen.findByRole("table");

    await userEvent.click(
      screen.getByRole("button", { name: /exportar pdf/i })
    );

    expect(downloadTruckReport).toHaveBeenCalledWith(
      expect.arrayContaining([expect.objectContaining({ id: "2" })])
    );
  });

  it("should delete a truck after confirmation", async () => {
    renderPage();
    await screen.findByRole("table");

    await userEvent.click(
      screen.getByRole("button", { name: "Ações para Curitiba" })
    );
    await userEvent.click(screen.getByRole("menuitem", { name: "Excluir" }));
    await userEvent.click(
      within(screen.getByRole("dialog")).getByRole("button", {
        name: "Excluir",
      })
    );

    await waitFor(() =>
      expect(getRowIdentifiers()).toEqual(["São Paulo", "Rio de Janeiro"])
    );
    expect(server.db.trucks.find("3")).toBeNull();
  });
});
