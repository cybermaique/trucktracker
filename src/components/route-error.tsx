import { AlertTriangle } from "lucide-react";
import { Link, isRouteErrorResponse, useRouteError } from "react-router";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { ROUTES } from "@/lib/site";

/** Error boundary for route rendering and lazy-loading failures. */
export function RouteError() {
  const error = useRouteError();
  const isNotFound = isRouteErrorResponse(error) && error.status === 404;
  const message = isRouteErrorResponse(error)
    ? `${error.status} · ${error.statusText}`
    : "Ocorreu um erro inesperado ao carregar esta página.";

  return (
    <Empty className="min-h-[60svh] flex-1">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <AlertTriangle />
        </EmptyMedia>
        <EmptyTitle>
          {isNotFound ? "Não encontrado" : "Algo deu errado"}
        </EmptyTitle>
        <EmptyDescription>{message}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent className="flex-row justify-center">
        <Button onClick={() => window.location.reload()}>
          Recarregar a página
        </Button>
        <Button variant="outline" asChild>
          <Link to={ROUTES.overview}>Ir para a visão geral</Link>
        </Button>
      </EmptyContent>
    </Empty>
  );
}
