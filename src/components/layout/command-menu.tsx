import { useQuery } from "@tanstack/react-query";
import {
  LayoutDashboard,
  Monitor,
  Moon,
  Plus,
  Search,
  Sun,
  Truck,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useTheme, type Theme } from "@/components/theme/theme-provider";
import { Button } from "@/components/ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { Kbd } from "@/components/ui/kbd";
import { trucksQueryOptions } from "@/features/trucks/api/queries";
import { matchesSearch } from "@/lib/search";
import { ROUTES, truckDetailsPath } from "@/lib/site";

const PAGES = [
  { to: ROUTES.overview, label: "Visão geral", icon: LayoutDashboard },
  { to: ROUTES.trucks, label: "Caminhões", icon: Truck },
  { to: ROUTES.newTruck, label: "Novo caminhão", icon: Plus },
];

const THEMES: { value: Theme; label: string; icon: typeof Sun }[] = [
  { value: "light", label: "Tema claro", icon: Sun },
  { value: "dark", label: "Tema escuro", icon: Moon },
  { value: "system", label: "Tema do sistema", icon: Monitor },
];

const isApplePlatform = () =>
  /Mac|iPhone|iPad/.test(globalThis.navigator?.userAgent ?? "");

// Substring match (same rules as the list search) instead of cmdk's fuzzy
// default, which matches plates loosely (e.g. "zz" in "BHZ3C58 Horizonte").
// Items with keywords (trucks) match on them only, never on their id value.
const strictFilter = (value: string, search: string, keywords?: string[]) =>
  matchesSearch(search, keywords?.length ? keywords : [value]) ? 1 : 0;

/** Ctrl/⌘ + K: jump to any truck, page or setting from the keyboard. */
export function CommandMenu() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { setTheme } = useTheme();
  // Only loads (or reads from cache) when the palette is opened.
  const { data: trucks = [] } = useQuery({
    ...trucksQueryOptions(),
    enabled: open,
  });

  useEffect(() => {
    const toggleOnShortcut = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((current) => !current);
      }
    };
    document.addEventListener("keydown", toggleOnShortcut);
    return () => document.removeEventListener("keydown", toggleOnShortcut);
  }, []);

  const run = (action: () => void) => {
    setOpen(false);
    action();
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="text-muted-foreground"
        onClick={() => setOpen(true)}
        aria-label="Abrir paleta de comandos"
        aria-keyshortcuts="Control+K Meta+K"
      >
        <Search />
        <span className="hidden lg:inline">Buscar caminhões…</span>
        <Kbd className="hidden sm:inline-flex">
          {isApplePlatform() ? "⌘K" : "Ctrl K"}
        </Kbd>
      </Button>

      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        filter={strictFilter}
        title="Paleta de comandos"
        description="Busque caminhões, páginas e ações"
      >
        <CommandInput placeholder="Buscar por nome, placa, rastreador ou página…" />
        <CommandList>
          <CommandEmpty>Nenhum resultado.</CommandEmpty>
          <CommandGroup heading="Páginas">
            {PAGES.map(({ to, label, icon: Icon }) => (
              <CommandItem
                key={to}
                value={label}
                onSelect={() => run(() => void navigate(to))}
              >
                <Icon />
                {label}
              </CommandItem>
            ))}
          </CommandGroup>
          {trucks.length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup heading="Caminhões">
                {trucks.map((truck) => (
                  <CommandItem
                    key={truck.id}
                    value={truck.id}
                    keywords={[
                      truck.identifier,
                      truck.licensePlate,
                      truck.licensePlate.replace("-", ""),
                      truck.trackerSerialNumber,
                    ]}
                    onSelect={() =>
                      run(() => void navigate(truckDetailsPath(truck.id)))
                    }
                  >
                    <Truck />
                    <span className="truncate">{truck.identifier}</span>
                    <CommandShortcut className="font-mono tracking-wider">
                      {truck.licensePlate}
                    </CommandShortcut>
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}
          <CommandSeparator />
          <CommandGroup heading="Preferências">
            {THEMES.map(({ value, label, icon: Icon }) => (
              <CommandItem
                key={value}
                value={label}
                onSelect={() => run(() => setTheme(value))}
              >
                <Icon />
                {label}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
