import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import { EditErrors } from "../../../containers/use-actions-table";
import { TruckWithDistance } from "../../../interfaces/truck";

interface EditTruckDialogProps {
  open: boolean;
  selectedTruck: TruckWithDistance | null;
  errors?: EditErrors;
  handleEditClose: () => void;
  handleSaveEdit: () => void;
  handleChangeField: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleChangeDate: (value: dayjs.Dayjs | null) => void;
}

const FIELDS = [
  { name: "identifier", label: "Identificador", maxLength: 40 },
  { name: "license_plate", label: "Placa", maxLength: 8 },
  { name: "tracker_serial_number", label: "Rastreador", maxLength: 20 },
] as const;

const EditTruckDialog = ({
  open,
  selectedTruck,
  errors = {},
  handleEditClose,
  handleSaveEdit,
  handleChangeField,
  handleChangeDate,
}: EditTruckDialogProps) => (
  <Dialog
    open={open}
    onClose={handleEditClose}
    fullWidth
    maxWidth="xs"
    aria-labelledby="edit-truck-title"
  >
    <DialogTitle id="edit-truck-title">Editar caminhão</DialogTitle>
    <DialogContent>
      {FIELDS.map(({ name, label, maxLength }) => (
        <TextField
          key={name}
          fullWidth
          label={label}
          name={name}
          value={selectedTruck?.[name] ?? ""}
          onChange={handleChangeField}
          error={Boolean(errors[name])}
          helperText={errors[name]}
          slotProps={{ htmlInput: { maxLength } }}
          sx={{ mt: 2 }}
        />
      ))}
      <DatePicker
        label="Data de início"
        value={
          selectedTruck?.start_date ? dayjs(selectedTruck.start_date) : null
        }
        onChange={handleChangeDate}
        sx={{ mt: 2, width: "100%" }}
      />
    </DialogContent>
    <DialogActions sx={{ px: 3, pb: 2 }}>
      <Button onClick={handleEditClose} variant="outlined">
        Cancelar
      </Button>
      <Button onClick={handleSaveEdit} variant="contained">
        Salvar
      </Button>
    </DialogActions>
  </Dialog>
);

export default EditTruckDialog;
