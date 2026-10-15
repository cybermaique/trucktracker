import { MapPinOff } from "lucide-react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { ROUTES, SITE } from "@/lib/site";

export function NotFoundPage() {
  return (
    <Empty className="flex-1">
      <title>{`Página não encontrada · ${SITE.name}`}</title>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <MapPinOff />
        </EmptyMedia>
        <EmptyTitle>
          <h1>Página não encontrada</h1>
        </EmptyTitle>
        <EmptyDescription>
          Este endereço não existe ou foi movido. Que tal voltar para a visão
          geral da frota?
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button asChild>
          <Link to={ROUTES.overview}>Ir para a visão geral</Link>
        </Button>
      </EmptyContent>
    </Empty>
  );
}
