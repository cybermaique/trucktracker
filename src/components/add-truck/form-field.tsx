import { TextField } from "@mui/material";
import { Control, Controller, FieldPath, FieldValues } from "react-hook-form";
import { formatLicensePlate } from "../../utils/list-truck";

interface TruckFormFieldProps<T extends FieldValues> {
  name: FieldPath<T>;
  label: string;
  control: Control<T>;
  isLicensePlate?: boolean;
  maxLength?: number;
  required?: boolean;
}

const TruckFormField = <T extends FieldValues>({
  name,
  label,
  control,
  isLicensePlate,
  maxLength,
  required,
}: TruckFormFieldProps<T>) => (
  <Controller
    name={name}
    control={control}
    render={({ field, fieldState: { error } }) => (
      <TextField
        {...field}
        value={field.value ?? ""}
        label={label}
        required={required}
        error={Boolean(error)}
        helperText={error?.message}
        onChange={(event) => {
          const { value } = event.target;
          field.onChange(isLicensePlate ? formatLicensePlate(value) : value);
        }}
        slotProps={{ htmlInput: { maxLength } }}
      />
    )}
  />
);

export default TruckFormField;
