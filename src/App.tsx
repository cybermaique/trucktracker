import { CssBaseline, ThemeProvider } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import "dayjs/locale/pt-br";
import { Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { SWRConfig } from "swr";
import { fetcher } from "./api/fetcher";
import AppSnackbar from "./components/app-snackbar";
import Layout from "./components/layout";
import { Loader, PageLoader } from "./components/loader";
import { routes } from "./routes";
import theme from "./styles/theme";

const App = () => (
  <ThemeProvider theme={theme}>
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pt-br">
      <CssBaseline />
      <SWRConfig
        value={{
          fetcher,
          revalidateOnFocus: false,
          revalidateOnReconnect: false,
        }}
      >
        <BrowserRouter basename={import.meta.env.BASE_URL}>
          <Loader />
          <AppSnackbar />
          <Layout>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {routes.map(({ path, element }) => (
                  <Route key={path} path={path} element={element} />
                ))}
              </Routes>
            </Suspense>
          </Layout>
        </BrowserRouter>
      </SWRConfig>
    </LocalizationProvider>
  </ThemeProvider>
);

export default App;
