import dayjs from "dayjs";
import { useState } from "react";
import { useSWRConfig } from "swr";
import { API_ROUTES } from "../constants/api";
import { TruckWithDistance } from "../interfaces/truck";
import { deleteTruck } from "../services/delete-truck";
import { updateTruck } from "../services/update-truck";
import { useLoadingStore } from "../stores/loading";
import { useSnackbarStore } from "../stores/snackbar";
import { formatLicensePlate } from "../utils/list-truck";
import { TruckEditValues, truckEditSchema } from "../validation/truck-schema";

export type EditErrors = Partial<Record<keyof TruckEditValues, string>>;

export const useActionsTable = () => {
  const setLoading = useLoadingStore((state) => state.setLoading);
  const showSnackbar = useSnackbarStore((state) => state.showSnackbar);
  const { mutate } = useSWRConfig();

  const [selectedTruck, setSelectedTruck] = useState<TruckWithDistance | null>(
    null
  );
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [editErrors, setEditErrors] = useState<EditErrors>({});

  const handleEditOpen = (truck: TruckWithDistance) => {
    setSelectedTruck(truck);
    setEditErrors({});
    setOpenEditDialog(true);
  };

  const handleEditClose = () => setOpenEditDialog(false);

  const handleDeleteOpen = (truck: TruckWithDistance) => {
    setSelectedTruck(truck);
    setOpenDeleteDialog(true);
  };

  const handleDeleteClose = () => setOpenDeleteDialog(false);

  const validateEdit = (truck: TruckWithDistance) => {
    const result = truckEditSchema.safeParse(truck);
    if (result.success) {
      setEditErrors({});
      return true;
    }

    const fieldErrors = result.error.flatten().fieldErrors;
    setEditErrors(
      Object.fromEntries(
        Object.entries(fieldErrors).map(([field, messages]) => [
          field,
          messages?.[0],
        ])
      )
    );
    return false;
  };

  const handleSaveEdit = async () => {
    if (!selectedTruck || !validateEdit(selectedTruck)) return;

    try {
      setLoading(true);
      await updateTruck(API_ROUTES.truckById(selectedTruck.id), {
        arg: selectedTruck,
      });
      await mutate(API_ROUTES.trucks);

      showSnackbar("Caminhão atualizado com sucesso!", "success");
      handleEditClose();
    } catch {
      showSnackbar("Erro ao atualizar caminhão!", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedTruck) return;

    try {
      setLoading(true);
      await deleteTruck(API_ROUTES.truckById(selectedTruck.id));
      await mutate(API_ROUTES.trucks);

      showSnackbar("Caminhão excluído com sucesso!", "success");
      setSelectedTruck(null);
      handleDeleteClose();
    } catch {
      showSnackbar("Erro ao excluir caminhão!", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleChangeField = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedTruck) return;

    const { name, value } = event.target;

    setSelectedTruck({
      ...selectedTruck,
      [name]: name === "license_plate" ? formatLicensePlate(value) : value,
    });
    setEditErrors((errors) => ({ ...errors, [name]: undefined }));
  };

  const handleChangeDate = (value: dayjs.Dayjs | null) => {
    if (!selectedTruck) return;

    setSelectedTruck({
      ...selectedTruck,
      start_date: value?.toISOString() ?? "",
    });
  };

  return {
    selectedTruck,
    setSelectedTruck,
    openEditDialog,
    openDeleteDialog,
    editErrors,
    handleEditOpen,
    handleEditClose,
    handleDeleteOpen,
    handleDeleteClose,
    handleSaveEdit,
    handleConfirmDelete,
    handleChangeField,
    handleChangeDate,
  };
};
