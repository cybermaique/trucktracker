import { Box, Button, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import NotFoundImage from "../../assets/images/not-found.svg";

const NotFound = () => (
  <Box
    display="flex"
    flexDirection="column"
    gap={4}
    justifyContent="center"
    alignItems="center"
    textAlign="center"
    height="100%"
    p={3}
  >
    <img
      src={NotFoundImage}
      alt="Ilustração de página não encontrada"
      style={{ maxWidth: "100%", height: "auto" }}
    />
    <Typography variant="h5" component="h1">
      Opa, URL não encontrada! Volte para a página inicial ou tente novamente.
    </Typography>
    <Button component={RouterLink} to="/" variant="contained">
      Ir para a página inicial
    </Button>
  </Box>
);

export default NotFound;
