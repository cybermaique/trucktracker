import AddRoundedIcon from "@mui/icons-material/AddRounded";
import HomeOutlined from "@mui/icons-material/HomeOutlined";
import LocalShipping from "@mui/icons-material/LocalShipping";
import { lazy } from "react";

// Pages are code-split: each route downloads its own chunk on first visit.
const Home = lazy(() => import("../pages/home"));
const ListTruck = lazy(() => import("../pages/list-truck"));
const AddTruck = lazy(() => import("../pages/add-truck"));
const NotFound = lazy(() => import("../pages/not-found"));

export interface AppRoute {
  path: string;
  title: string;
  element: React.ReactNode;
  icon?: React.ReactNode;
}

export const navigationRoutes: Required<AppRoute>[] = [
  {
    path: "/",
    title: "Página inicial",
    icon: <HomeOutlined />,
    element: <Home />,
  },
  {
    path: "/caminhoes/listar",
    title: "Listagem de Caminhões",
    icon: <LocalShipping />,
    element: <ListTruck />,
  },
  {
    path: "/caminhoes/cadastrar",
    title: "Cadastrar Caminhão",
    icon: <AddRoundedIcon />,
    element: <AddTruck />,
  },
];

export const routes: AppRoute[] = [
  ...navigationRoutes,
  { path: "*", title: "Página Não Encontrada", element: <NotFound /> },
];
