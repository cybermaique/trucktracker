import { act, renderHook } from "@testing-library/react";
import dayjs from "dayjs";
import { beforeEach, describe, expect, it, Mock, vi } from "vitest";
import { TruckWithDistance } from "../interfaces/truck";
import { deleteTruck } from "../services/delete-truck";
import { updateTruck } from "../services/update-truck";
import { useLoadingStore } from "../stores/loading";
import { useSnackbarStore } from "../stores/snackbar";
import { useActionsTable } from "./use-actions-table";

const mutate = vi.fn();
vi.mock("swr", () => ({ useSWRConfig: () => ({ mutate }) }));
vi.mock("../services/delete-truck", () => ({ deleteTruck: vi.fn() }));
vi.mock("../services/update-truck", () => ({ updateTruck: vi.fn() }));

const TRUCK: TruckWithDistance = {
  id: "1",
  identifier: "Caminhão Teste",
  license_plate: "ABC-1234",
  tracker_serial_number: "T12345",
  coordinates: { latitude: -23.5, longitude: -46.6 },
  image: "",
  start_date: "2024-01-01T00:00:00.000Z",
  distance: 10,
};

const changeEvent = (name: string, value: string) =>
  ({ target: { name, value } }) as React.ChangeEvent<HTMLInputElement>;

const renderActionsTable = () => renderHook(() => useActionsTable());

describe("useActionsTable", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useSnackbarStore.getState().closeSnackbar();
    useLoadingStore.setState({ isLoading: false });
  });

  it("should open and close the edit dialog for the given truck", () => {
    const { result } = renderActionsTable();

    act(() => result.current.handleEditOpen(TRUCK));
    expect(result.current.selectedTruck).toEqual(TRUCK);
    expect(result.current.openEditDialog).toBe(true);

    act(() => result.current.handleEditClose());
    expect(result.current.openEditDialog).toBe(false);
  });

  it("should open and close the delete dialog for the given truck", () => {
    const { result } = renderActionsTable();

    act(() => result.current.handleDeleteOpen(TRUCK));
    expect(result.current.selectedTruck).toEqual(TRUCK);
    expect(result.current.openDeleteDialog).toBe(true);

    act(() => result.current.handleDeleteClose());
    expect(result.current.openDeleteDialog).toBe(false);
  });

  it("should update fields, formatting the license plate", () => {
    const { result } = renderActionsTable();
    act(() => result.current.handleEditOpen(TRUCK));

    act(() =>
      result.current.handleChangeField(changeEvent("license_plate", "xyz9876"))
    );
    act(() =>
      result.current.handleChangeDate(dayjs("2025-03-10T00:00:00.000Z"))
    );

    expect(result.current.selectedTruck).toMatchObject({
      license_plate: "XYZ-9876",
      start_date: "2025-03-10T00:00:00.000Z",
    });
  });

  it("should save the edited truck and revalidate the list", async () => {
    (updateTruck as Mock).mockResolvedValue(TRUCK);
    const { result } = renderActionsTable();
    act(() => result.current.handleEditOpen(TRUCK));

    await act(() => result.current.handleSaveEdit());

    expect(updateTruck).toHaveBeenCalledWith("/api/caminhao/1", {
      arg: TRUCK,
    });
    expect(mutate).toHaveBeenCalledWith("/api/caminhoes");
    expect(result.current.openEditDialog).toBe(false);
    expect(useSnackbarStore.getState()).toMatchObject({
      message: "Caminhão atualizado com sucesso!",
      severity: "success",
    });
    expect(useLoadingStore.getState().isLoading).toBe(false);
  });

  it("should not save and expose field errors when the data is invalid", async () => {
    const { result } = renderActionsTable();
    act(() => result.current.handleEditOpen(TRUCK));
    act(() =>
      result.current.handleChangeField(changeEvent("license_plate", "AB"))
    );

    await act(() => result.current.handleSaveEdit());

    expect(updateTruck).not.toHaveBeenCalled();
    expect(result.current.editErrors.license_plate).toBe("Placa inválida");
    expect(result.current.openEditDialog).toBe(true);

    act(() =>
      result.current.handleChangeField(changeEvent("license_plate", "ABC1D23"))
    );
    expect(result.current.editErrors.license_plate).toBeUndefined();
  });

  it("should show an error when saving fails", async () => {
    (updateTruck as Mock).mockRejectedValue(new Error("Erro"));
    const { result } = renderActionsTable();
    act(() => result.current.handleEditOpen(TRUCK));

    await act(() => result.current.handleSaveEdit());

    expect(useSnackbarStore.getState()).toMatchObject({
      message: "Erro ao atualizar caminhão!",
      severity: "error",
    });
    expect(result.current.openEditDialog).toBe(true);
    expect(useLoadingStore.getState().isLoading).toBe(false);
  });

  it("should delete the truck and revalidate the list", async () => {
    (deleteTruck as Mock).mockResolvedValue(undefined);
    const { result } = renderActionsTable();
    act(() => result.current.handleDeleteOpen(TRUCK));

    await act(() => result.current.handleConfirmDelete());

    expect(deleteTruck).toHaveBeenCalledWith("/api/caminhao/1");
    expect(mutate).toHaveBeenCalledWith("/api/caminhoes");
    expect(result.current.selectedTruck).toBeNull();
    expect(result.current.openDeleteDialog).toBe(false);
    expect(useSnackbarStore.getState().message).toBe(
      "Caminhão excluído com sucesso!"
    );
  });

  it("should show an error when deleting fails", async () => {
    (deleteTruck as Mock).mockRejectedValue(new Error("Erro"));
    const { result } = renderActionsTable();
    act(() => result.current.handleDeleteOpen(TRUCK));

    await act(() => result.current.handleConfirmDelete());

    expect(useSnackbarStore.getState()).toMatchObject({
      message: "Erro ao excluir caminhão!",
      severity: "error",
    });
    expect(useLoadingStore.getState().isLoading).toBe(false);
  });
});
