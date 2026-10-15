import { Truck as TruckIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { Truck } from "../types";

interface TruckAvatarProps {
  truck: Pick<Truck, "identifier" | "imageUrl">;
  className?: string;
}

export function TruckAvatar({ truck, className }: TruckAvatarProps) {
  return (
    <Avatar className={cn("size-9 rounded-lg", className)}>
      {truck.imageUrl && (
        <AvatarImage
          src={truck.imageUrl}
          alt={`Foto do caminhão ${truck.identifier}`}
          className="object-cover"
        />
      )}
      <AvatarFallback className="rounded-lg bg-primary/10 text-primary">
        <TruckIcon className="size-1/2" aria-hidden />
      </AvatarFallback>
    </Avatar>
  );
}
