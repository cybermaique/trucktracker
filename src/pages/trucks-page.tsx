import { Plus, SearchX } from "lucide-react";
import { useDeferredValue, useRef, useState } from "react";
import { Link } from "react-router";
import { PageHeader } from "@/components/page-header";
import { QueryError } from "@/components/query-error";
import { Button } from "@/components/ui/button";
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
import { DeleteTruckDialog } from "@/features/trucks/components/delete-truck-dialog";
import { EditTruckSheet } from "@/features/trucks/components/edit-truck-sheet";
import { ExportMenu } from "@/features/trucks/components/export-menu";
import { FleetMap } from "@/features/trucks/components/fleet-map";
import { TruckFilters } from "@/features/trucks/components/truck-filters";
import { TrucksTable } from "@/features/trucks/components/trucks-table";
import { useFleet } from "@/features/trucks/hooks/use-fleet";
import { useTruckFilters } from "@/features/trucks/hooks/use-truck-filters";
import { filterTrucks } from "@/features/trucks/lib/filter-trucks";
import type { Truck, TruckWithDistance } from "@/features/trucks/types";
import { ROUTES } from "@/lib/site";

const prefersReducedMotion = () =>
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

function TrucksSkeleton() {
  return (
    <div className="space-y-4" aria-hidden>
      <Skeleton className="h-[420px] rounded-xl" />
      {Array.from({ length: 5 }, (_, index) => (
        <Skeleton key={index} className="h-14 rounded-lg" />
      ))}
    </div>
  );
}

function NoMatches({ onClear }: { onClear: () => void }) {
  return (
    <Empty className="border">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <SearchX />
        </EmptyMedia>
        <EmptyTitle>Nenhum caminhão encontrado</EmptyTitle>
        <EmptyDescription>
          Nenhum caminhão corresponde aos filtros aplicados.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button variant="outline" onClick={onClear}>
          Limpar filtros
        </Button>
      </EmptyContent>
    </Empty>
  );
}

export function TrucksPage() {
  const { trucks, location, isPending, isError, refetch } = useFleet();
  const {
    filters,
    selectedTruckId,
    setSearch,
    setRadius,
    selectTruck,
    clearFilters,
  } = useTruckFilters();
  const [editingTruck, setEditingTruck] = useState<Truck | null>(null);
  const [deletingTruck, setDeletingTruck] = useState<Truck | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);

  // Typing stays responsive while the list re-filters in the background.
  const search = useDeferredValue(filters.search);
  const visibleTrucks = filterTrucks(trucks, { ...filters, search });

  const showOnMap = (truck: TruckWithDistance) => {
    selectTruck(truck.id);
    mapRef.current?.scrollIntoView({
      behavior: prefersReducedMotion() ? "auto" : "smooth",
      block: "nearest",
    });
  };

  const content = () => {
    if (isError) return <QueryError onRetry={() => void refetch()} />;
    if (isPending) return <TrucksSkeleton />;

    return (
      <>
        <div className="flex flex-col gap-3">
          <TruckFilters
            filters={filters}
            onSearchChange={setSearch}
            onRadiusChange={setRadius}
            onClear={clearFilters}
          />
          <div className="flex">
            <LocationStatus location={location} />
          </div>
        </div>

        <div ref={mapRef} className="scroll-mt-20">
          <FleetMap
            trucks={visibleTrucks}
            origin={location}
            selectedTruckId={selectedTruckId}
            onSelectTruck={selectTruck}
            radiusKm={filters.radiusKm}
            className="h-[360px] md:h-[440px]"
          />
        </div>

        {visibleTrucks.length > 0 ? (
          <TrucksTable
            trucks={visibleTrucks}
            selectedTruckId={selectedTruckId}
            onSelect={showOnMap}
            onEdit={setEditingTruck}
            onDelete={setDeletingTruck}
          />
        ) : (
          <NoMatches onClear={clearFilters} />
        )}
      </>
    );
  };

  return (
    <>
      <PageHeader
        title="Caminhões"
        description={
          isPending
            ? "Carregando a frota…"
            : `${trucks.length} caminhões na frota, ordenados pela distância em linha reta até você.`
        }
        actions={
          <>
            <ExportMenu trucks={visibleTrucks} />
            <Button asChild>
              <Link to={ROUTES.newTruck}>
                <Plus />
                Novo caminhão
              </Link>
            </Button>
          </>
        }
      />
      {content()}
      <EditTruckSheet
        truck={editingTruck}
        onOpenChange={(open) => !open && setEditingTruck(null)}
      />
      <DeleteTruckDialog
        truck={deletingTruck}
        onOpenChange={(open) => !open && setDeletingTruck(null)}
        onDeleted={(truck) => truck.id === selectedTruckId && selectTruck(null)}
      />
    </>
  );
}
