import { Box, Drawer, Link, useMediaQuery, useTheme } from "@mui/material";
import { useState } from "react";
import { colors } from "../../styles/colors";
import Footer from "../footer";
import Sidebar from "../sidebar";
import Toolbar from "../toolbar";

interface LayoutProps {
  children: React.ReactNode;
}

const MAIN_CONTENT_ID = "main-content";

const Layout = ({ children }: LayoutProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const toggleSidebar = () =>
    isMobile
      ? setIsMobileSidebarOpen((open) => !open)
      : setIsDesktopSidebarOpen((open) => !open);

  const closeMobileSidebar = () => setIsMobileSidebarOpen(false);

  return (
    <Box display="flex" flexDirection="column" minHeight="100vh">
      <Link
        href={`#${MAIN_CONTENT_ID}`}
        sx={{
          position: "absolute",
          left: -9999,
          zIndex: theme.zIndex.tooltip,
          padding: 1,
          backgroundColor: colors.white,
          "&:focus": { left: 8, top: 8 },
        }}
      >
        Pular para o conteúdo
      </Link>

      <Toolbar onClickMenu={toggleSidebar} />

      <Box display="flex" flex={1}>
        {isMobile ? (
          <Drawer open={isMobileSidebarOpen} onClose={closeMobileSidebar}>
            <Sidebar open onNavigate={closeMobileSidebar} />
          </Drawer>
        ) : (
          <Sidebar open={isDesktopSidebarOpen} />
        )}
        <Box
          component="main"
          id={MAIN_CONTENT_ID}
          tabIndex={-1}
          flex={1}
          minWidth={0}
          pb={3}
          sx={{ outline: "none" }}
        >
          {children}
        </Box>
      </Box>

      <Footer />
    </Box>
  );
};

export default Layout;
