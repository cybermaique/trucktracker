import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { makeServer } from "./mirage/server";
import "./styles/global.css";

// There is no real backend: MirageJS intercepts the API calls in every
// environment (including the deployed demo) and keeps data in memory.
makeServer();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
