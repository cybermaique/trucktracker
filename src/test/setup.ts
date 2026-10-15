import "@testing-library/jest-dom/vitest";
import { cleanup, configure } from "@testing-library/react";
import { afterAll, afterEach, beforeAll, vi } from "vitest";
import { resetGeolocation } from "./geolocation";
import { server, testDb } from "./server";

// jsdom has no WebGL: render the map as plain DOM (see maplibre-mock.tsx).
vi.mock("@vis.gl/react-maplibre", () => import("./maplibre-mock"));
vi.mock("@/lib/maplibre", () => ({}));

// Page tests load lazy route chunks; the first import of each one is slower
// under coverage instrumentation than the 1s default allows.
configure({ asyncUtilTimeout: 5000 });

beforeAll(() => server.listen({ onUnhandledFrame: "error" }));

afterEach(() => {
  cleanup();
  server.resetHandlers();
  testDb.reset();
  localStorage.clear();
  resetGeolocation();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

afterAll(() => server.close());

// Browser APIs missing from jsdom, used by Radix UI and the layout.
window.matchMedia ??= (query: string) =>
  ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  }) as MediaQueryList;

globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

Element.prototype.scrollIntoView ??= () => {};
window.scrollTo = () => {};
Element.prototype.hasPointerCapture ??= () => false;
Element.prototype.releasePointerCapture ??= () => {};
