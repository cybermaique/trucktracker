import { CloudOff, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

export function QueryError({ onRetry }: { onRetry: () => void }) {
  return (
    <Empty className="border" role="alert">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <CloudOff />
        </EmptyMedia>
        <EmptyTitle>Não foi possível carregar a frota</EmptyTitle>
        <EmptyDescription>
          Verifique sua conexão e tente novamente.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button onClick={onRetry}>
          <RotateCw />
          Tentar novamente
        </Button>
      </EmptyContent>
    </Empty>
  );
}
