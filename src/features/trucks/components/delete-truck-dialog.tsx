import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useDeleteTruck } from "../api/mutations";
import type { Truck } from "../types";

interface DeleteTruckDialogProps {
  truck: Truck | null;
  onOpenChange: (open: boolean) => void;
  onDeleted?: (truck: Truck) => void;
}

/**
 * The truck disappears immediately (optimistic update) and comes back if the
 * request fails.
 */
export function DeleteTruckDialog({
  truck,
  onOpenChange,
  onDeleted,
}: DeleteTruckDialogProps) {
  const { mutate: deleteTruck } = useDeleteTruck();

  const confirm = () => {
    if (!truck) return;
    deleteTruck(truck.id, {
      onSuccess: () => {
        toast.success(`${truck.identifier} foi excluído.`);
        onDeleted?.(truck);
      },
      onError: () =>
        toast.error(`Não foi possível excluir ${truck.identifier}.`),
    });
    onOpenChange(false);
  };

  return (
    <AlertDialog open={truck !== null} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir caminhão?</AlertDialogTitle>
          <AlertDialogDescription>
            <strong className="text-foreground">{truck?.identifier}</strong> (
            {truck?.licensePlate}) será removido da frota. Essa ação não pode
            ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={confirm}>
            Excluir
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
