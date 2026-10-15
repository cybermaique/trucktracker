import { setWorkerUrl } from "maplibre-gl";
import workerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?url";

// MapLibre v6 resolves its Web Worker relative to its own module, which
// breaks once the library is bundled. Point it at the emitted asset instead.
setWorkerUrl(workerUrl);
