import { setupWorker } from "msw/browser";
import { createTruckRepository } from "./db";
import { createHandlers } from "./handlers";

const browserDb = createTruckRepository(window.localStorage);

/**
 * There is no real backend: a Service Worker answers `/api/*` in every
 * environment, including the static GitHub Pages deploy.
 */
export async function startMockApi() {
  const worker = setupWorker(...createHandlers(browserDb));

  await worker.start({
    serviceWorker: {
      url: `${import.meta.env.BASE_URL}mockServiceWorker.js`,
    },
    onUnhandledFrame: "bypass",
    quiet: import.meta.env.PROD,
  });
}
