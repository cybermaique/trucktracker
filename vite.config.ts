import { fileURLToPath, URL } from "node:url";
import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  // GitHub Pages serves the app from /<repo>/; locally it is served from /.
  base: process.env.BASE_PATH ?? "/",
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    tailwindcss(),
  ],
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  build: {
    // MapLibre GL (the WebGL map engine) is ~1 MB minified on its own. It is
    // isolated in a long-cached chunk, so the default 500 kB warning is noise.
    chunkSizeWarningLimit: 1100,
    rolldownOptions: {
      output: {
        // Long-lived vendor chunks: they rarely change, so browsers keep them
        // cached across deploys. Everything else is split per route.
        codeSplitting: {
          groups: [
            {
              name: "react",
              test: /node_modules[\\/](react|react-dom|react-router|scheduler)[\\/]/,
            },
            { name: "maplibre", test: /node_modules[\\/]maplibre-gl[\\/]/ },
          ],
        },
      },
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    css: false,
    // Page tests render real routes (lazy chunks, data, user flows).
    testTimeout: 15_000,
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov", "json-summary"],
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/**/*.test.{ts,tsx}",
        // Browser-only bootstrap and wiring, exercised by the E2E suite.
        "src/main.tsx",
        "src/app/app.tsx",
        "src/lib/maplibre.ts",
        "src/test/**",
        "src/mocks/browser.ts",
        "src/components/ui/**",
        "src/**/*.d.ts",
      ],
      // Measured on React Compiler output (what ships), which adds memoization
      // branches; source-level branch coverage is a few points higher.
      thresholds: {
        statements: 90,
        branches: 85,
        functions: 90,
        lines: 90,
      },
    },
  },
});
