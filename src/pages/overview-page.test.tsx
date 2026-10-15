import { screen, waitFor, within } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";
import { grantGeolocation } from "@/test/geolocation";
import { renderApp } from "@/test/render";
import { server, testDb } from "@/test/server";

const statCard = (label: string) =>
  screen.getByText(label).closest<HTMLElement>("[data-slot=card]")!;

describe("Overview page", () => {
  it("summarizes the fleet relative to the user's location", async () => {
    grantGeolocation();
    renderApp("/");

    expect(await screen.findByText("Caminhões na frota")).toBeInTheDocument();
    expect(statCard("Caminhões na frota")).toHaveTextContent("22");
    expect(statCard("Mais próximo")).toHaveTextContent(
      "Scania R 450 · Campinas (SP)"
    );
    expect(statCard("Último em operação")).toHaveTextContent("16/06/2025");
    expect(
      screen.getByText("Distâncias a partir da sua localização")
    ).toBeInTheDocument();
  });

  it("lists the five nearest trucks, linking to each one on the list", async () => {
    const { user, router } = renderApp("/");

    await screen.findByText("Mais próximos de você");

    const links = screen
      .getAllByRole("link")
      .filter((link) => link.getAttribute("href")?.includes("caminhao="));
    expect(links).toHaveLength(5);

    await user.click(links[0]!);
    await waitFor(() =>
      expect(router.state.location.pathname).toBe("/caminhoes")
    );
    expect(router.state.location.search).toBe("?caminhao=1");
  });

  it("breaks the fleet down by distance band", async () => {
    renderApp("/");

    const chart = await screen.findByRole("list", {
      name: "Caminhões por faixa de distância",
    });
    const bands = within(chart).getAllByRole("listitem");
    expect(bands).toHaveLength(4);
    expect(bands[0]).toHaveTextContent("Até 500 km");
  });

  it("invites the user to register a truck when the fleet is empty", async () => {
    testDb.reset([]);
    renderApp("/");

    expect(
      await screen.findByText("Nenhum caminhão cadastrado")
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Cadastrar caminhão" })
    ).toHaveAttribute("href", "/caminhoes/novo");
  });

  it("shows an error state when the API fails", async () => {
    server.use(
      http.get("*/api/trucks", () => HttpResponse.json(null, { status: 500 }))
    );
    renderApp("/");

    expect(
      await screen.findByText("Não foi possível carregar a frota")
    ).toBeInTheDocument();
  });
});
