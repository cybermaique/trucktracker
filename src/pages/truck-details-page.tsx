import { ArrowLeft, Copy, ExternalLink, Pencil, Trash2 } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Link, Navigate, useParams, useRevalidator } from "react-router";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import { QueryError } from "@/components/query-error";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { LocationStatus } from "@/features/location/location-status";
import type { UserLocation } from "@/features/location/use-user-location";
import { useDrivingRoute } from "@/features/routing/use-driving-route";
import { DeleteTruckDialog } from "@/features/trucks/components/delete-truck-dialog";
import { EditTruckSheet } from "@/features/trucks/components/edit-truck-sheet";
import { FleetMap } from "@/features/trucks/components/fleet-map";
import { TruckAvatar } from "@/features/trucks/components/truck-avatar";
import { useFleet } from "@/features/trucks/hooks/use-fleet";
import type { TruckWithDistance } from "@/features/trucks/types";
import {
  formatCoordinate,
  formatDate,
  formatDistance,
  formatDuration,
  formatSince,
} from "@/lib/format";
import { ROUTES } from "@/lib/site";

const googleMapsDirectionsUrl = (
  truck: TruckWithDistance,
  origin?: UserLocation
) => {
  const url = new URL("https://www.google.com/maps/dir/");
  url.searchParams.set("api", "1");
  url.searchParams.set(
    "destination",
    `${truck.coordinates.latitude},${truck.coordinates.longitude}`
  );
  if (origin?.source === "device") {
    url.searchParams.set(
      "origin",
      `${origin.coordinates.latitude},${origin.coordinates.longitude}`
    );
  }
  url.searchParams.set("travelmode", "driving");
  return url.toString();
};

function Detail({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[minmax(0,9rem)_minmax(0,1fr)] gap-3 py-2.5 text-sm">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="min-w-0 font-medium">{children}</dd>
    </div>
  );
}

function RouteSummary({
  truck,
  origin,
}: {
  truck: TruckWithDistance;
  origin?: UserLocation;
}) {
  const route = useDrivingRoute(origin?.coordinates, truck.coordinates);

  if (route.isPending) return <Skeleton className="h-5 w-40" />;
  if (route.isError) {
    return (
      <span className="font-normal text-muted-foreground">
        Indisponível no momento
      </span>
    );
  }
  return (
    <span>
      {formatDistance(route.data.distanceKm)} ·{" "}
      {formatDuration(route.data.durationMinutes)} de viagem
    </span>
  );
}

function TruckDetails({
  truck,
  origin,
}: {
  truck: TruckWithDistance;
  origin?: UserLocation;
}) {
  const revalidator = useRevalidator();
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { latitude, longitude } = truck.coordinates;
  const coordinates = `${formatCoordinate(latitude)}, ${formatCoordinate(longitude)}`;

  const copyCoordinates = async () => {
    try {
      await navigator.clipboard.writeText(`${latitude}, ${longitude}`);
      toast.success("Coordenadas copiadas.");
    } catch {
      toast.error("Não foi possível copiar as coordenadas.");
    }
  };

  return (
    <>
      <PageHeader
        title={truck.identifier}
        description={
          <span className="font-mono tracking-wider">{truck.licensePlate}</span>
        }
        actions={
          <>
            <Button variant="outline" asChild>
              <a
                href={googleMapsDirectionsUrl(truck, origin)}
                target="_blank"
                rel="noreferrer"
              >
                <ExternalLink />
                Abrir rota no Google Maps
              </a>
            </Button>
            <Button variant="outline" onClick={() => setIsEditing(true)}>
              <Pencil />
              Editar
            </Button>
            <Button
              variant="outline"
              className="text-destructive hover:text-destructive"
              onClick={() => setIsDeleting(true)}
            >
              <Trash2 />
              Excluir
            </Button>
          </>
        }
      />
      <div className="-mt-2 flex">
        <LocationStatus location={origin} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]">
        <Card>
          <CardHeader className="flex items-center gap-4">
            <TruckAvatar truck={truck} className="size-16" />
            <CardTitle className="text-base">Ficha do veículo</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="divide-y">
              <Detail label="Placa">
                <span className="font-mono tracking-wider">
                  {truck.licensePlate}
                </span>
              </Detail>
              <Detail label="Rastreador">
                <span className="font-mono">{truck.trackerSerialNumber}</span>
              </Detail>
              <Detail label="Em operação desde">
                {formatDate(truck.startDate)}{" "}
                <span className="font-normal text-muted-foreground">
                  ({formatSince(truck.startDate)})
                </span>
              </Detail>
              <Detail label="Coordenadas">
                <span className="flex items-center gap-1">
                  <span className="truncate tabular-nums">{coordinates}</span>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    aria-label="Copiar coordenadas"
                    onClick={() => void copyCoordinates()}
                  >
                    <Copy />
                  </Button>
                </span>
              </Detail>
              <Detail label="Em linha reta">
                {formatDistance(truck.distanceKm)}
              </Detail>
              <Detail label="Por estrada">
                <RouteSummary truck={truck} origin={origin} />
              </Detail>
            </dl>
          </CardContent>
        </Card>

        <FleetMap
          trucks={[truck]}
          origin={origin}
          selectedTruckId={truck.id}
          showDetailsLink={false}
          className="min-h-[360px] lg:min-h-[480px]"
        />
      </div>

      <EditTruckSheet
        truck={isEditing ? truck : null}
        onOpenChange={(open) => {
          setIsEditing(open);
          // The breadcrumb label comes from the loader: refresh it.
          if (!open) void revalidator.revalidate();
        }}
      />
      <DeleteTruckDialog
        truck={isDeleting ? truck : null}
        onOpenChange={setIsDeleting}
      />
    </>
  );
}

export function TruckDetailsPage() {
  const { truckId } = useParams();
  const { trucks, location, isPending, isError, refetch } = useFleet();
  const truck = trucks.find(({ id }) => id === truckId);

  if (isError) return <QueryError onRetry={() => void refetch()} />;
  if (isPending) {
    return (
      <div className="space-y-6" aria-hidden>
        <Skeleton className="h-12 w-80 rounded-lg" />
        <Skeleton className="h-[480px] rounded-xl" />
      </div>
    );
  }
  // The loader rejects unknown ids, so a missing truck was just deleted.
  if (!truck) return <Navigate to={ROUTES.trucks} replace />;

  return (
    <>
      <div>
        <Button variant="ghost" size="sm" className="-ml-2" asChild>
          <Link to={ROUTES.trucks}>
            <ArrowLeft />
            Todos os caminhões
          </Link>
        </Button>
      </div>
      <TruckDetails truck={truck} origin={location} />
    </>
  );
}
