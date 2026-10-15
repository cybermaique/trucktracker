import KeyboardArrowDown from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUp from "@mui/icons-material/KeyboardArrowUp";
import LocalShipping from "@mui/icons-material/LocalShipping";
import Logout from "@mui/icons-material/Logout";
import MenuIcon from "@mui/icons-material/Menu";
import {
  Avatar,
  Box,
  ButtonBase,
  IconButton,
  Menu,
  MenuItem,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { Link } from "react-router-dom";
import { DEMO_USER } from "../../constants/user";
import { useSnackbarStore } from "../../stores/snackbar";
import { colors } from "../../styles/colors";

interface ToolbarProps {
  onClickMenu: () => void;
}

const Toolbar = ({ onClickMenu }: ToolbarProps) => {
  const showSnackbar = useSnackbarStore((state) => state.showSnackbar);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const isMenuOpen = Boolean(anchorEl);
  const ArrowIcon = isMenuOpen ? KeyboardArrowUp : KeyboardArrowDown;

  const handleClose = () => setAnchorEl(null);

  const handleLogout = () => {
    handleClose();
    showSnackbar(
      "Autenticação não está disponível na versão de demonstração.",
      "info"
    );
  };

  return (
    <Box
      component="header"
      alignItems="center"
      borderBottom={`4px solid ${colors.royalAzure}`}
      display="flex"
      justifyContent="space-between"
      py={1.5}
      px={{ xs: 1, sm: 2 }}
      style={{ backgroundColor: colors.black }}
    >
      <Box alignItems="center" display="flex" gap={1}>
        <IconButton
          onClick={onClickMenu}
          aria-label="Abrir ou fechar menu"
          data-testid="ToolbarButton"
        >
          <MenuIcon style={{ color: colors.white }} />
        </IconButton>

        <Link
          to="/"
          aria-label="TruckTracker — página inicial"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            textDecoration: "none",
          }}
        >
          <LocalShipping sx={{ color: colors.white, fontSize: 32 }} />
          <Typography
            variant="h6"
            component="span"
            sx={{ color: colors.white, fontWeight: 700, letterSpacing: 0.5 }}
          >
            TruckTracker
          </Typography>
        </Link>
      </Box>

      <ButtonBase
        onClick={(event) => setAnchorEl(event.currentTarget)}
        aria-haspopup="menu"
        aria-expanded={isMenuOpen}
        aria-controls={isMenuOpen ? "account-menu" : undefined}
        sx={{ gap: 1.5, borderRadius: 1, p: 0.5 }}
      >
        <Avatar sx={{ bgcolor: colors.white, color: colors.black }}>
          {DEMO_USER.initials}
        </Avatar>
        <Typography
          sx={{ color: colors.white, display: { xs: "none", sm: "block" } }}
          variant="body2"
        >
          {DEMO_USER.name}
        </Typography>
        <ArrowIcon sx={{ color: colors.white }} />
      </ButtonBase>

      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={isMenuOpen}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{ paper: { sx: { mt: 1, width: 170 } } }}
      >
        <MenuItem onClick={handleLogout}>
          <Box width="100%" display="flex" justifyContent="space-between">
            <Typography>Sair</Typography>
            <Logout fontSize="small" />
          </Box>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default Toolbar;
