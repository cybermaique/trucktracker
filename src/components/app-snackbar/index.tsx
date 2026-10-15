import { Alert, Snackbar } from "@mui/material";
import { useSnackbarStore } from "../../stores/snackbar";

const AUTO_HIDE_DURATION_MS = 4000;

const AppSnackbar = () => {
  const { open, message, severity, closeSnackbar } = useSnackbarStore();

  return (
    <Snackbar
      open={open}
      autoHideDuration={AUTO_HIDE_DURATION_MS}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      onClose={(_event, reason) => {
        if (reason !== "clickaway") closeSnackbar();
      }}
    >
      <Alert
        severity={severity}
        onClose={closeSnackbar}
        variant="filled"
        sx={{ width: "100%" }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
};

export default AppSnackbar;
