import { useNavigate } from "react-router";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserLocation } from "@/features/location/use-user-location";
import { useCreateTruck } from "@/features/trucks/api/mutations";
import { TruckForm } from "@/features/trucks/components/truck-form";
import { truckListUrl } from "@/features/trucks/hooks/use-truck-filters";
import type { TruckInput } from "@/features/trucks/types";

export function NewTruckPage() {
  const navigate = useNavigate();
  const { mutateAsync: createTruck } = useCreateTruck();
  const { data: location, isPending } = useUserLocation();

  const save = async (input: TruckInput) => {
    const truck = await createTruck(input);
    toast.success(`${truck.identifier} foi cadastrado.`);
    // Lands on the list with the new truck selected on the map.
    await navigate(truckListUrl(truck.id));
  };

  return (
    <>
      <PageHeader
        title="Novo caminhão"
        description="Informe os dados do veículo e marque a posição dele no mapa."
      />
      <Card>
        <CardContent>
          {isPending ? (
            <Skeleton className="h-[480px] rounded-lg" aria-hidden />
          ) : (
            <TruckForm
              submitLabel="Cadastrar caminhão"
              // Pre-fills the position with the device location, when shared.
              defaultValues={{
                coordinates:
                  location?.source === "device" ? location.coordinates : null,
              }}
              onSubmit={save}
              onCancel={() => void navigate(-1)}
            />
          )}
        </CardContent>
      </Card>
    </>
  );
}
