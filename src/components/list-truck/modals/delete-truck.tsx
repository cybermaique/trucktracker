import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { TruckWithDistance } from "../../../interfaces/truck";

interface DeleteTruckDialogProps {
  open: boolean;
  selectedTruck: TruckWithDistance | null;
  handleDeleteClose: () => void;
  handleConfirmDelete: () => void;
}

const DeleteTruckDialog = ({
  open,
  selectedTruck,
  handleDeleteClose,
  handleConfirmDelete,
}: DeleteTruckDialogProps) => (
  <Dialog
    open={open}
    onClose={handleDeleteClose}
    aria-labelledby="delete-truck-title"
  >
    <DialogTitle id="delete-truck-title">Confirmar exclusão</DialogTitle>
    <DialogContent>
      <DialogContentText>
        Tem certeza que deseja excluir o caminhão{" "}
        <strong>{selectedTruck?.identifier}</strong>? Essa ação não pode ser
        desfeita.
      </DialogContentText>
    </DialogContent>
    <DialogActions sx={{ px: 3, pb: 2 }}>
      <Button onClick={handleDeleteClose} variant="outlined">
        Cancelar
      </Button>
      <Button onClick={handleConfirmDelete} variant="contained" color="error">
        Excluir
      </Button>
    </DialogActions>
  </Dialog>
);

export default DeleteTruckDialog;
