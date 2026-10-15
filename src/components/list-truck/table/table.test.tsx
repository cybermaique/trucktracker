import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { TRUCK_TABLE_COLUMNS } from "../../../constants/table";
import { TruckWithDistance } from "../../../interfaces/truck";
import { TruckTable } from "./table";

const mockTrucks: TruckWithDistance[] = [
  "A1",
  "B2",
  "C3",
  "D4",
  "E5",
  "F6",
].map((identifier, index) => ({
  id: String(index + 1),
  identifier,
  license_plate: `ABC-12${index}0`,
  tracker_serial_number: `TSN00${index}`,
  coordinates: { latitude: index * 10, longitude: index * 10 },
  distance: (index + 1) * 100,
  image: "",
  start_date: "2023-01-15T12:00:00Z",
}));

const renderTable = (
  props: Partial<React.ComponentProps<typeof TruckTable>> = {}
) => {
  const defaultProps = {
    trucks: mockTrucks,
    selectedTruck: null,
    setSelectedTruck: vi.fn(),
    setIsDistanceDescending: vi.fn(),
    isDistanceDescending: false,
    handleEditOpen: vi.fn(),
    handleDeleteOpen: vi.fn(),
  };
  const mergedProps = { ...defaultProps, ...props };
  render(<TruckTable {...mergedProps} />);
  return mergedProps;
};

describe("TruckTable", () => {
  it("should render every column header", () => {
    renderTable();

    TRUCK_TABLE_COLUMNS.forEach((column) => {
      expect(
        screen.getByRole("columnheader", { name: column.label })
      ).toBeInTheDocument();
    });
  });

  it("should render only the first page of trucks with formatted values", () => {
    renderTable();

    expect(screen.getByText("A1")).toBeInTheDocument();
    expect(screen.getByText("E5")).toBeInTheDocument();
    expect(screen.queryByText("F6")).not.toBeInTheDocument();
    expect(screen.getByText("100.00")).toBeInTheDocument();
    expect(screen.getAllByText("15/01/2023")).toHaveLength(5);
  });

  it("should display the number of results", () => {
    renderTable();

    expect(
      screen.getByText(`${mockTrucks.length} Resultados encontrados`)
    ).toBeInTheDocument();
  });

  it("should use the singular form when there is a single result", () => {
    renderTable({ trucks: [mockTrucks[0]] });

    expect(screen.getByText("1 Resultado encontrado")).toBeInTheDocument();
  });

  it("should toggle the distance sorting when clicking its header", async () => {
    const { setIsDistanceDescending } = renderTable();

    await userEvent.click(screen.getByText("Distância (km)"));

    expect(setIsDistanceDescending).toHaveBeenCalledWith(true);
  });

  it("should go to the next page", async () => {
    renderTable();

    await userEvent.click(
      screen.getByRole("button", { name: /próxima página/i })
    );

    expect(screen.getByText("F6")).toBeInTheDocument();
    expect(screen.queryByText("A1")).not.toBeInTheDocument();
  });

  it("should select a truck when its row is clicked or activated by keyboard", async () => {
    const { setSelectedTruck } = renderTable();
    const row = screen.getByText("B2").closest("tr")!;

    await userEvent.click(row);
    expect(setSelectedTruck).toHaveBeenCalledWith(mockTrucks[1]);

    row.focus();
    await userEvent.keyboard("{Enter}");
    expect(setSelectedTruck).toHaveBeenCalledTimes(2);
  });

  it("should highlight the selected truck", () => {
    renderTable({ selectedTruck: mockTrucks[2] });

    expect(screen.getByText("C3").closest("tr")).toHaveAttribute(
      "aria-selected",
      "true"
    );
  });

  it("should open the edit and delete actions from the row menu", async () => {
    const { handleEditOpen, handleDeleteOpen, setSelectedTruck } =
      renderTable();

    await userEvent.click(
      screen.getByRole("button", { name: "Ações para A1" })
    );
    await userEvent.click(screen.getByRole("menuitem", { name: "Editar" }));
    expect(handleEditOpen).toHaveBeenCalledWith(mockTrucks[0]);

    await userEvent.click(
      screen.getByRole("button", { name: "Ações para B2" })
    );
    await userEvent.click(screen.getByRole("menuitem", { name: "Excluir" }));
    expect(handleDeleteOpen).toHaveBeenCalledWith(mockTrucks[1]);

    // Opening the menu must not change the map selection.
    expect(setSelectedTruck).not.toHaveBeenCalled();
  });

  it("should change the page size", async () => {
    renderTable();

    await userEvent.click(
      within(screen.getByText("Exibir").parentElement!).getByRole("combobox")
    );
    await userEvent.click(screen.getByRole("option", { name: "10" }));

    expect(screen.getByText("F6")).toBeInTheDocument();
  });
});
