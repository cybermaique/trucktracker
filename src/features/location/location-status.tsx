import { LocateFixed, LocateOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { FALLBACK_LOCATION, type UserLocation } from "./use-user-location";

/** Tells the user where distances are measured from. */
export function LocationStatus({ location }: { location?: UserLocation }) {
  if (!location) return null;

  if (location.source === "device") {
    return (
      <Badge variant="secondary" className="gap-1.5">
        <LocateFixed className="text-emerald-600 dark:text-emerald-400" />
        Distâncias a partir da sua localização
      </Badge>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge
          variant="outline"
          className="gap-1.5 border-warning/50 text-foreground"
          tabIndex={0}
        >
          <LocateOff className="text-warning" />
          Distâncias a partir de {FALLBACK_LOCATION.label}
        </Badge>
      </TooltipTrigger>
      <TooltipContent className="max-w-64">
        Não foi possível acessar sua localização. Permita o acesso no navegador
        e recarregue a página para ver as distâncias reais.
      </TooltipContent>
    </Tooltip>
  );
}
