import "@/styles/globals.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

// The mock API (MSW) must be listening before the first request is made.
const { startMockApi } = await import("@/mocks/browser");
await startMockApi();

// Imported only now: creating the router runs the initial route loaders,
// which prefetch data and would otherwise reach the network before the
// Service Worker is ready.
const { App } = await import("@/app/app");

const container = document.getElementById("root");
if (!container) throw new Error("Root element #root not found");

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>
);
