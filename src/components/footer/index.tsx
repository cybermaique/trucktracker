import GitHub from "@mui/icons-material/GitHub";
import { Box, IconButton, Link, Typography } from "@mui/material";
import { AUTHOR } from "../../constants/author";
import { colors } from "../../styles/colors";

const Footer = () => (
  <Box
    component="footer"
    sx={{
      backgroundColor: colors.darkLiver,
      color: colors.white,
      py: 3,
      px: 2,
      textAlign: "center",
    }}
  >
    <Typography variant="body2" fontWeight={600}>
      TruckTracker · Gestão de frotas de caminhões
    </Typography>
    <Typography variant="body2" mt={0.5}>
      Desenvolvido por{" "}
      <Link
        href={AUTHOR.github}
        target="_blank"
        rel="noopener noreferrer"
        color="inherit"
        underline="always"
      >
        {AUTHOR.name}
      </Link>
    </Typography>
    <IconButton
      href={AUTHOR.repository}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Código-fonte no GitHub"
      sx={{ color: colors.white, mt: 1 }}
    >
      <GitHub />
    </IconButton>
  </Box>
);

export default Footer;
