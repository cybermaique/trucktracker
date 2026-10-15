import { createTheme } from "@mui/material/styles";
import { ptBR } from "@mui/material/locale";
import { colors } from "./colors";

const theme = createTheme(
  {
    palette: {
      background: {
        default: colors.brightGray,
      },
      primary: {
        main: colors.smokyBlack,
      },
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      button: { textTransform: "none", fontWeight: 600 },
    },
    shape: { borderRadius: 8 },
  },
  ptBR
);

export default theme;
