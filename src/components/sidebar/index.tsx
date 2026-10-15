import { Box, Tooltip, Typography } from "@mui/material";
import { NavLink } from "react-router-dom";
import { navigationRoutes } from "../../routes";
import { colors } from "../../styles/colors";

interface SidebarProps {
  open: boolean;
  onNavigate?: () => void;
}

const Sidebar = ({ open, onNavigate }: SidebarProps) => (
  <Box
    component="nav"
    aria-label="Menu principal"
    display="flex"
    flexDirection="column"
    py={2.5}
    minWidth={open ? 240 : "auto"}
    flexShrink={0}
    style={{
      backgroundColor: colors.white,
      borderRight: `1px solid ${colors.chineseWhite}`,
    }}
    data-testid="Sidebar"
  >
    {navigationRoutes.map(({ icon, path, title }) => (
      <Tooltip key={path} title={open ? "" : title} placement="right">
        <NavLink
          to={path}
          end
          aria-label={title}
          onClick={onNavigate}
          style={({ isActive }) => ({
            backgroundColor: isActive ? colors.brightGray : colors.white,
            borderLeft: `4px solid ${
              isActive ? colors.royalAzure : colors.white
            }`,
            color: colors.black,
            textDecoration: "none",
          })}
        >
          <Box alignItems="center" display="flex" gap={1} height={56} px={2}>
            {icon}
            {open && <Typography variant="body2">{title}</Typography>}
          </Box>
        </NavLink>
      </Tooltip>
    ))}
  </Box>
);

export default Sidebar;
