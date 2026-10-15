import { CalendarClock, Navigation, Radar, Truck } from "lucide-react";
import type { ComponentType, ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate, formatDistance } from "@/lib/format";
import { NEARBY_RADIUS_KM, type FleetStats } from "../lib/fleet-stats";

interface StatCardProps {
  label: string;
  value: ReactNode;
  detail?: ReactNode;
  icon: ComponentType<{ className?: string }>;
}

function StatCard({ label, value, detail, icon: Icon }: StatCardProps) {
  return (
    <Card className="gap-0 py-5">
      <CardContent className="flex items-start justify-between gap-4">
        <div className="min-w-0 space-y-1">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="truncate text-2xl font-semibold tracking-tight tabular-nums">
            {value}
          </p>
          {detail && (
            <p className="truncate text-xs text-muted-foreground">{detail}</p>
          )}
        </div>
        <span className="rounded-lg bg-primary/10 p-2 text-primary">
          <Icon className="size-5" aria-hidden />
        </span>
      </CardContent>
    </Card>
  );
}

export function FleetStatCards({ stats }: { stats: FleetStats }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        label="Caminhões na frota"
        value={stats.total}
        detail="Cadastrados e rastreados"
        icon={Truck}
      />
      <StatCard
        label="Mais próximo"
        value={stats.nearest ? formatDistance(stats.nearest.distanceKm) : "—"}
        detail={stats.nearest?.identifier}
        icon={Navigation}
      />
      <StatCard
        label={`Em até ${NEARBY_RADIUS_KM} km`}
        value={stats.withinRadius}
        detail={
          stats.averageDistanceKm !== null
            ? `Distância média: ${formatDistance(stats.averageDistanceKm)}`
            : undefined
        }
        icon={Radar}
      />
      <StatCard
        label="Último em operação"
        value={stats.latestStartDate ? formatDate(stats.latestStartDate) : "—"}
        detail="Data de início mais recente"
        icon={CalendarClock}
      />
    </div>
  );
}
