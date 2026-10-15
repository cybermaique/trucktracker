import { ArrowRight, Plus, Truck } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import { PageHeader } from "@/components/page-header";
import { QueryError } from "@/components/query-error";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { LocationStatus } from "@/features/location/location-status";
import { DistanceDistribution } from "@/features/trucks/components/distance-distribution";
import { FleetMap } from "@/features/trucks/components/fleet-map";
import { FleetStatCards } from "@/features/trucks/components/fleet-stat-cards";
import { NearestTrucks } from "@/features/trucks/components/nearest-trucks";
import { useFleet } from "@/features/trucks/hooks/use-fleet";
import { computeFleetStats } from "@/features/trucks/lib/fleet-stats";
import { ROUTES } from "@/lib/site";

const NEAREST_COUNT = 5;

function OverviewSkeleton() {
  return (
    <div className="space-y-6" aria-hidden>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-28 rounded-xl" />
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-3">
        <Skeleton className="h-[440px] rounded-xl xl:col-span-2" />
        <Skeleton className="h-[440px] rounded-xl" />
      </div>
    </div>
  );
}

function EmptyFleet() {
  return (
    <Empty className="border">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Truck />
        </EmptyMedia>
        <EmptyTitle>Nenhum caminhão cadastrado</EmptyTitle>
        <EmptyDescription>
          Cadastre o primeiro caminhão para acompanhá-lo no mapa.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button asChild>
          <Link to={ROUTES.newTruck}>
            <Plus />
            Cadastrar caminhão
          </Link>
        </Button>
      </EmptyContent>
    </Empty>
  );
}

export function OverviewPage() {
  const { trucks, location, isPending, isError, refetch } = useFleet();
  const [selectedTruckId, setSelectedTruckId] = useState<string | null>(null);
  const stats = computeFleetStats(trucks);

  const content = () => {
    if (isError) return <QueryError onRetry={() => void refetch()} />;
    if (isPending) return <OverviewSkeleton />;
    if (trucks.length === 0) return <EmptyFleet />;

    return (
      <>
        <FleetStatCards stats={stats} />
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <FleetMap
            trucks={trucks}
            origin={location}
            selectedTruckId={selectedTruckId}
            onSelectTruck={setSelectedTruckId}
            className="h-[360px] md:h-[460px] xl:col-span-2 xl:h-auto xl:min-h-[460px]"
          />
          {/* grid-cols-1 = minmax(0, 1fr): lets truncated text shrink. */}
          <div className="grid min-w-0 grid-cols-1 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Mais próximos de você</CardTitle>
                <CardDescription>
                  Os {NEAREST_COUNT} caminhões a menor distância.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <NearestTrucks trucks={trucks.slice(0, NEAREST_COUNT)} />
              </CardContent>
              <CardFooter>
                <Button variant="link" className="px-0" asChild>
                  <Link to={ROUTES.trucks}>
                    Ver todos os caminhões
                    <ArrowRight />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Distribuição por distância</CardTitle>
              </CardHeader>
              <CardContent>
                <DistanceDistribution bands={stats.bands} total={stats.total} />
              </CardContent>
            </Card>
          </div>
        </div>
      </>
    );
  };

  return (
    <>
      <PageHeader
        title="Visão geral"
        description="Acompanhe onde está cada caminhão da sua frota."
        actions={
          <Button asChild>
            <Link to={ROUTES.newTruck}>
              <Plus />
              Novo caminhão
            </Link>
          </Button>
        }
      />
      <div className="-mt-2 flex">
        <LocationStatus location={location} />
      </div>
      {content()}
    </>
  );
}
