import { screen, waitFor, within } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";
import { SITE } from "@/lib/site";
import { renderApp } from "@/test/render";
import { server, testDb } from "@/test/server";

describe("App shell", () => {
  it("navigates between pages from the sidebar, updating the breadcrumb", async () => {
    const { user, router } = renderApp("/");
    const navigation = await screen.findByRole("navigation", {
      name: "Navegação principal",
    });

    await user.click(
      within(navigation).getByRole("link", { name: "Caminhões" })
    );
    await screen.findByRole("heading", { level: 1, name: "Caminhões" });
    expect(router.state.location.pathname).toBe("/caminhoes");
    expect(
      within(navigation).getByRole("link", { name: "Caminhões" })
    ).toHaveAttribute("aria-current", "page");

    await user.click(
      within(navigation).getByRole("link", { name: "Novo caminhão" })
    );
    await screen.findByRole("heading", { level: 1, name: "Novo caminhão" });
    const breadcrumb = screen.getByRole("navigation", { name: "breadcrumb" });
    expect(
      within(breadcrumb).getByRole("link", { name: "Caminhões" })
    ).toBeInTheDocument();
    expect(within(breadcrumb).getByText("Novo caminhão")).toHaveAttribute(
      "aria-current",
      "page"
    );
  });

  it("sets the document title per page", async () => {
    renderApp("/caminhoes");

    await waitFor(() =>
      expect(document.title).toBe(`Caminhões · ${SITE.name}`)
    );
  });

  it("renders a not found page for unknown URLs", async () => {
    const { user, router } = renderApp("/rota-inexistente");

    expect(
      await screen.findByRole("heading", { name: "Página não encontrada" })
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole("link", { name: "Ir para a visão geral" })
    );
    expect(router.state.location.pathname).toBe("/");
  });

  it("switches between light and dark themes", async () => {
    const { user } = renderApp("/");
    await screen.findByRole("heading", { name: "Visão geral" });

    await user.click(screen.getByRole("button", { name: "Alterar tema" }));
    await user.click(screen.getByRole("menuitemradio", { name: "Escuro" }));

    expect(document.documentElement).toHaveClass("dark");
    expect(localStorage.getItem("trucktracker:theme")).toBe("dark");

    await user.click(screen.getByRole("button", { name: "Alterar tema" }));
    await user.click(screen.getByRole("menuitemradio", { name: "Sistema" }));

    expect(document.documentElement).not.toHaveClass("dark");
    expect(localStorage.getItem("trucktracker:theme")).toBeNull();
  });

  it("restores the demo data", async () => {
    testDb.reset([]);
    const { user } = renderApp("/");
    await screen.findByText("Nenhum caminhão cadastrado");
    testDb.reset([]);

    await user.click(
      screen.getByRole("button", { name: "Restaurar dados da demo" })
    );

    expect(
      await screen.findByText("Dados de demonstração restaurados.")
    ).toBeInTheDocument();
    expect(await screen.findByText("Caminhões na frota")).toBeInTheDocument();
  });

  it("reports when the demo data cannot be restored", async () => {
    server.use(
      http.post("*/api/demo/reset", () =>
        HttpResponse.json(null, { status: 500 })
      )
    );
    const { user } = renderApp("/");
    await screen.findByRole("heading", { name: "Visão geral" });

    await user.click(
      screen.getByRole("button", { name: "Restaurar dados da demo" })
    );

    expect(
      await screen.findByText("Não foi possível restaurar os dados.")
    ).toBeInTheDocument();
  });

  it("links to the author and the source code", async () => {
    renderApp("/");
    await screen.findByRole("heading", { name: "Visão geral" });

    expect(
      screen.getByRole("link", { name: SITE.author.name })
    ).toHaveAttribute("href", SITE.author.linkedin);
    expect(
      screen.getAllByRole("link", { name: /código-fonte/i })[0]
    ).toHaveAttribute("href", SITE.repository);
  });
});
