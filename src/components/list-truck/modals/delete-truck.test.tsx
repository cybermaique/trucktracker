import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { TruckWithDistance } from "../../../interfaces/truck";
import DeleteTruckDialog from "./delete-truck";

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

describe("DeleteTruckDialog", () => {
  it("should ask for confirmation naming the truck", async () => {
    const handleConfirmDelete = vi.fn();
    const handleDeleteClose = vi.fn();

    render(
      <DeleteTruckDialog
        open
        selectedTruck={TRUCK}
        handleConfirmDelete={handleConfirmDelete}
        handleDeleteClose={handleDeleteClose}
      />
    );

    expect(
      screen.getByRole("dialog", { name: "Confirmar exclusão" })
    ).toHaveTextContent("Caminhão 1");

    await userEvent.click(screen.getByRole("button", { name: "Excluir" }));
    await userEvent.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(handleConfirmDelete).toHaveBeenCalledTimes(1);
    expect(handleDeleteClose).toHaveBeenCalledTimes(1);
  });
});
