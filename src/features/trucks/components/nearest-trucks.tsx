import { ChevronRight } from "lucide-react";
import { Link } from "react-router";
import { formatDistance } from "@/lib/format";
import { truckListUrl } from "../hooks/use-truck-filters";
import type { TruckWithDistance } from "../types";
import { TruckAvatar } from "./truck-avatar";

export function NearestTrucks({ trucks }: { trucks: TruckWithDistance[] }) {
  return (
    <ul className="-mx-2 space-y-1">
      {trucks.map((truck) => (
        <li key={truck.id}>
          <Link
            to={truckListUrl(truck.id)}
            className="group flex items-center gap-3 rounded-lg p-2 outline-none hover:bg-accent focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <TruckAvatar truck={truck} />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium">
                {truck.identifier}
              </span>
              <span className="block font-mono text-xs text-muted-foreground">
                {truck.licensePlate}
              </span>
            </span>
            <span className="text-sm text-muted-foreground tabular-nums">
              {formatDistance(truck.distanceKm)}
            </span>
            <ChevronRight
              className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5"
              aria-hidden
            />
          </Link>
        </li>
      ))}
    </ul>
  );
}
