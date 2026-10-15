import { LayoutDashboard, Plus, RotateCcw, Truck } from "lucide-react";
import { NavLink, useLocation } from "react-router";
import { toast } from "sonner";
import { GitHubIcon, LinkedInIcon } from "@/components/brand-icons";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { useResetDemoData } from "@/features/trucks/api/mutations";
import { ROUTES, SITE } from "@/lib/site";

const NAVIGATION = [
  { to: ROUTES.overview, label: "Visão geral", icon: LayoutDashboard },
  { to: ROUTES.trucks, label: "Caminhões", icon: Truck },
  { to: ROUTES.newTruck, label: "Novo caminhão", icon: Plus },
];

export function AppSidebar() {
  const { setOpenMobile } = useSidebar();
  const { pathname } = useLocation();
  const resetDemo = useResetDemoData();

  const handleReset = () =>
    resetDemo.mutate(undefined, {
      onSuccess: () => toast.success("Dados de demonstração restaurados."),
      onError: () => toast.error("Não foi possível restaurar os dados."),
    });

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <NavLink to={ROUTES.overview}>
                <span className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Truck className="size-4" />
                </span>
                <span className="grid flex-1 text-left leading-tight">
                  <span className="truncate font-semibold">{SITE.name}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {SITE.tagline}
                  </span>
                </span>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <nav aria-label="Navegação principal">
          <SidebarGroup>
            <SidebarGroupLabel>Navegação</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {NAVIGATION.map(({ to, label, icon: Icon }) => (
                  <SidebarMenuItem key={to}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === to}
                      tooltip={label}
                    >
                      <NavLink to={to} end onClick={() => setOpenMobile(false)}>
                        <Icon />
                        <span>{label}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </nav>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Restaurar dados da demo"
              disabled={resetDemo.isPending}
              onClick={handleReset}
            >
              <RotateCcw />
              <span>Restaurar dados da demo</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="LinkedIn do autor" asChild>
              <a href={SITE.author.linkedin} target="_blank" rel="noreferrer">
                <LinkedInIcon />
                <span>{SITE.author.name}</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Código-fonte no GitHub" asChild>
              <a href={SITE.repository} target="_blank" rel="noreferrer">
                <GitHubIcon />
                <span>Código-fonte</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
