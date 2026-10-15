import { Fragment } from "react";
import { Link, useMatches } from "react-router";
import { GitHubIcon } from "@/components/brand-icons";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { SITE } from "@/lib/site";
import { CommandMenu } from "./command-menu";

export interface RouteHandle {
  /** Breadcrumb label, static or derived from the route loader data. */
  crumb: string | ((loaderData: unknown) => string);
}

const hasCrumb = (handle: unknown): handle is RouteHandle =>
  typeof handle === "object" && handle !== null && "crumb" in handle;

export function AppHeader() {
  const crumbs = useMatches().filter((match) => hasCrumb(match.handle));

  return (
    <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b bg-background/80 px-4 backdrop-blur supports-backdrop-filter:bg-background/60">
      <SidebarTrigger className="-ml-1" aria-label="Alternar menu lateral" />
      <Separator
        orientation="vertical"
        className="mr-2 data-[orientation=vertical]:h-4"
      />

      <Breadcrumb>
        <BreadcrumbList>
          {crumbs.map((match, index) => {
            const { crumb } = match.handle as RouteHandle;
            const label =
              typeof crumb === "function" ? crumb(match.loaderData) : crumb;
            const isLast = index === crumbs.length - 1;
            return (
              <Fragment key={match.id}>
                {index > 0 && <BreadcrumbSeparator />}
                <BreadcrumbItem>
                  {isLast ? (
                    <BreadcrumbPage>{label}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link to={match.pathname}>{label}</Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </Fragment>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>

      <div className="ml-auto flex items-center gap-1">
        <CommandMenu />
        <ThemeToggle />
        <Button variant="ghost" size="icon" asChild>
          <a
            href={SITE.repository}
            target="_blank"
            rel="noreferrer"
            aria-label="Código-fonte no GitHub"
          >
            <GitHubIcon />
          </a>
        </Button>
      </div>
    </header>
  );
}
