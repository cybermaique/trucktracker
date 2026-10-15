import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useUpdateTruck } from "../api/mutations";
import type { Truck, TruckInput } from "../types";
import { TruckForm } from "./truck-form";

interface EditTruckSheetProps {
  truck: Truck | null;
  onOpenChange: (open: boolean) => void;
}

export function EditTruckSheet({ truck, onOpenChange }: EditTruckSheetProps) {
  const { mutateAsync: updateTruck } = useUpdateTruck();

  const save = async (input: TruckInput) => {
    if (!truck) return;
    await updateTruck({ ...input, id: truck.id });
    toast.success(`${input.identifier} foi atualizado.`);
    onOpenChange(false);
  };

  return (
    <Sheet open={truck !== null} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>Editar caminhão</SheetTitle>
          <SheetDescription>
            Atualize os dados e a localização de {truck?.identifier}.
          </SheetDescription>
        </SheetHeader>
        {truck && (
          <div className="px-4 pb-6">
            <TruckForm
              key={truck.id}
              layout="stacked"
              defaultValues={truck}
              submitLabel="Salvar alterações"
              onSubmit={save}
              onCancel={() => onOpenChange(false)}
            />
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
