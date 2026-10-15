import { describe, expect, it } from "vitest";
import { navigationRoutes, routes } from ".";

describe("routes", () => {
  it.each([
    ["/", "Página inicial"],
    ["/caminhoes/listar", "Listagem de Caminhões"],
    ["/caminhoes/cadastrar", "Cadastrar Caminhão"],
  ])("should expose %s as a navigation route", (path, title) => {
    const route = navigationRoutes.find((item) => item.path === path);

    expect(route).toMatchObject({ path, title });
    expect(route?.icon).toBeDefined();
    expect(route?.element).toBeDefined();
  });

  it("should register a catch-all route that is not part of the navigation", () => {
    expect(routes.at(-1)?.path).toBe("*");
    expect(navigationRoutes.some(({ path }) => path === "*")).toBe(false);
  });
});
