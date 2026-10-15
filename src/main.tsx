import "@/styles/globals.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "@/app/app";

// The mock API (MSW) must be listening before the first request is made.
// It is loaded as a separate chunk, isolated from the application code.
const { startMockApi } = await import("@/mocks/browser");
await startMockApi();

const container = document.getElementById("root");
if (!container) throw new Error("Root element #root not found");

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>
);
