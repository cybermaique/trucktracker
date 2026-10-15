import { Box, Button, Paper, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import HomeImage from "../../assets/images/home.svg";
import PageHeader from "../../components/page-header";
import { DEMO_USER } from "../../constants/user";

const Home = () => (
  <Box display="flex" flexDirection="column" gap={2} px={3} py={2.5}>
    <PageHeader
      title={`Boas-vindas, ${DEMO_USER.name}!`}
      subtitle="Aqui, você pode visualizar e cadastrar caminhões, além de acompanhar suas localizações no mapa."
    />
    <Paper
      elevation={2}
      sx={{
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        alignItems: "center",
        gap: 3,
        p: 3,
        borderRadius: 5,
      }}
    >
      <img
        src={HomeImage}
        alt="Ilustração de caminhões em um mapa"
        style={{ maxWidth: "100%", height: "auto", flexShrink: 0 }}
      />
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        gap={2}
        flex={1}
        textAlign="center"
      >
        <Typography variant="h5" component="h2" fontWeight={600}>
          Sistema de Cadastro e Localização de Caminhões
        </Typography>
        <Typography variant="body1">
          Caso seja seu primeiro acesso, recomendamos que inicie cadastrando um
          novo caminhão.
        </Typography>
        <Box display="flex" gap={2} flexWrap="wrap" justifyContent="center">
          <Button
            component={RouterLink}
            to="/caminhoes/cadastrar"
            variant="contained"
          >
            Cadastrar caminhão
          </Button>
          <Button
            component={RouterLink}
            to="/caminhoes/listar"
            variant="outlined"
          >
            Ver caminhões
          </Button>
        </Box>
      </Box>
    </Paper>
  </Box>
);

export default Home;
