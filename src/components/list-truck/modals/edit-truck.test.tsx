import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { TruckWithDistance } from "../../../interfaces/truck";
import EditTruckDialog from "./edit-truck";

const TRUCK: TruckWithDistance = {
  id: "1",
  identifier: "Caminhão 1",
  license_plate: "ABC-1234",
  tracker_serial_number: "T12345",
  coordinates: { latitude: 0, longitude: 0 },
  image: "",
  start_date: "2024-02-17T12:00:00Z",
  distance: 10,
};

describe("EditTruckDialog", () => {
  const renderDialog = (
    props: Partial<React.ComponentProps<typeof EditTruckDialog>> = {}
  ) => {
    const handlers = {
      handleEditClose: vi.fn(),
      handleSaveEdit: vi.fn(),
      handleChangeField: vi.fn(),
      handleChangeDate: vi.fn(),
    };
    render(
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <EditTruckDialog open selectedTruck={TRUCK} {...handlers} {...props} />
      </LocalizationProvider>
    );
    return handlers;
  };

  it("should fill the form with the selected truck", () => {
    renderDialog();

    expect(screen.getByLabelText("Identificador")).toHaveValue("Caminhão 1");
    expect(screen.getByLabelText("Placa")).toHaveValue("ABC-1234");
    expect(screen.getByLabelText("Rastreador")).toHaveValue("T12345");
  });

  it("should display validation errors", () => {
    renderDialog({ errors: { license_plate: "Placa inválida" } });

    expect(screen.getByText("Placa inválida")).toBeInTheDocument();
    expect(screen.getByLabelText("Placa")).toHaveAttribute(
      "aria-invalid",
      "true"
    );
  });

  it("should forward field changes and actions", async () => {
    const handlers = renderDialog();

    await userEvent.type(screen.getByLabelText("Identificador"), "0");
    await userEvent.click(screen.getByRole("button", { name: "Salvar" }));
    await userEvent.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(handlers.handleChangeField).toHaveBeenCalled();
    expect(handlers.handleSaveEdit).toHaveBeenCalledTimes(1);
    expect(handlers.handleEditClose).toHaveBeenCalledTimes(1);
  });
});
