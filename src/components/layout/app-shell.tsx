import { Outlet, ScrollRestoration, useNavigation } from "react-router";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Spinner } from "@/components/ui/spinner";
import { AppHeader } from "./app-header";
import { AppSidebar } from "./app-sidebar";

const MAIN_CONTENT_ID = "conteudo";

/** Shown while the first route chunk downloads. */
export function AppLoading() {
  return (
    <div className="flex min-h-svh items-center justify-center">
      <Spinner className="size-6 text-muted-foreground" />
      <span className="sr-only">Carregando</span>
    </div>
  );
}

/** Thin bar while a lazily loaded route chunk downloads. */
function NavigationProgress() {
  const isNavigating = useNavigation().state !== "idle";
  if (!isNavigating) return null;

  return (
    <div
      role="progressbar"
      aria-label="Carregando página"
      className="fixed inset-x-0 top-0 z-50 h-0.5 overflow-hidden bg-primary/20"
    >
      <div className="h-full w-1/3 animate-[progress_1s_ease-in-out_infinite] bg-primary" />
    </div>
  );
}

export function AppShell() {
  return (
    <SidebarProvider>
      <NavigationProgress />
      <a
        href={`#${MAIN_CONTENT_ID}`}
        className="sr-only z-50 rounded-md bg-background px-4 py-2 shadow focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
      >
        Pular para o conteúdo
      </a>
      <AppSidebar />
      {/* min-w-0 stops wide children (e.g. the map canvas) from stretching
          the layout beyond the viewport. */}
      <SidebarInset className="min-w-0">
        <AppHeader />
        <main
          id={MAIN_CONTENT_ID}
          tabIndex={-1}
          className="flex min-w-0 flex-1 flex-col gap-6 p-4 outline-none md:p-6 lg:p-8"
        >
          <Outlet />
        </main>
      </SidebarInset>
      <ScrollRestoration />
    </SidebarProvider>
  );
}
