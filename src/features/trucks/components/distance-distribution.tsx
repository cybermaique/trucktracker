import type { FleetStats } from "../lib/fleet-stats";

/** Horizontal bar chart in plain HTML/CSS: accessible and dependency-free. */
export function DistanceDistribution({
  bands,
  total,
}: Pick<FleetStats, "bands" | "total">) {
  return (
    <ul className="space-y-4" aria-label="Caminhões por faixa de distância">
      {bands.map(({ label, count }) => {
        const share = total ? Math.round((count / total) * 100) : 0;
        return (
          <li key={label} className="space-y-1.5">
            <div className="flex justify-between text-sm">
              <span>{label}</span>
              <span className="text-muted-foreground tabular-nums">
                {count} · {share}%
              </span>
            </div>
            <div
              className="h-2 overflow-hidden rounded-full bg-muted"
              aria-hidden
            >
              <div
                className="h-full rounded-full bg-primary transition-[width] duration-500"
                style={{ width: `${share}%` }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
