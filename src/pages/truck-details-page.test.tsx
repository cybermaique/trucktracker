import { screen, waitFor, within } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";
import { ROUTING_BASE_URL } from "@/features/routing/routing-api";
import { grantGeolocation } from "@/test/geolocation";
import { renderApp } from "@/test/render";
import { server, testDb } from "@/test/server";

// Truck 2: Scania R 450 · Campinas (SP).
const renderDetails = async (id = "2") => {
  const view = renderApp(`/caminhoes/${id}`);
  await screen.findByRole("heading", {
    level: 1,
    name: "Scania R 450 · Campinas (SP)",
  });
  return view;
};

const detail = (label: string) =>
  screen.getByText(label, { selector: "dt" }).nextElementSibling;

describe("Truck details page", () => {
  it("shows the vehicle sheet with straight-line and road distances", async () => {
    await renderDetails();

    expect(detail("Placa")).toHaveTextContent("CMP4E21");
    expect(detail("Rastreador")).toHaveTextContent("SC450CP02");
    expect(detail("Em operação desde")).toHaveTextContent("02/07/2024");
    expect(detail("Em linha reta")).toHaveTextContent("84 km");
    await waitFor(() =>
      expect(detail("Por estrada")).toHaveTextContent(
        /^105 km · 1 h 30 min de viagem$/
      )
    );
    expect(
      within(screen.getByRole("navigation", { name: "breadcrumb" })).getByText(
        "Scania R 450 · Campinas (SP)"
      )
    ).toHaveAttribute("aria-current", "page");
  });

  it("draws the road route on the map", async () => {
    await renderDetails();

    expect(await screen.findByTestId("source-route")).toBeInTheDocument();
    expect(screen.queryByTestId("source-connection")).not.toBeInTheDocument();
  });

  it("falls back to the straight line when routing is unavailable", async () => {
    server.use(
      http.get(`${ROUTING_BASE_URL}/:coordinates`, () =>
        HttpResponse.json(null, { status: 503 })
      )
    );
    await renderDetails();

    await waitFor(() =>
      expect(detail("Por estrada")).toHaveTextContent("Indisponível no momento")
    );
    expect(screen.getByTestId("source-connection")).toBeInTheDocument();
  });

  it("links to Google Maps directions from the user's position", async () => {
    grantGeolocation();
    await renderDetails();

    const link = screen.getByRole("link", { name: /Google Maps/ });
    const url = new URL(link.getAttribute("href")!);
    expect(url.searchParams.get("destination")).toBe("-22.9056,-47.0608");
    expect(url.searchParams.get("origin")).toBe("-22.9056,-47.0608");
    expect(link).toHaveAttribute("target", "_blank");
  });

  it("copies the coordinates to the clipboard", async () => {
    const { user } = await renderDetails();

    await user.click(
      screen.getByRole("button", { name: "Copiar coordenadas" })
    );

    expect(await navigator.clipboard.readText()).toBe("-22.9056, -47.0608");
    expect(
      await screen.findByText("Coordenadas copiadas.")
    ).toBeInTheDocument();
  });

  it("updates the page and breadcrumb after editing", async () => {
    const { user } = await renderDetails();

    await user.click(screen.getByRole("button", { name: "Editar" }));
    const sheet = screen.getByRole("dialog", { name: "Editar caminhão" });
    const identifier = within(sheet).getByLabelText("Identificação");
    await user.clear(identifier);
    await user.type(identifier, "Scania R 450 · Jundiaí (SP)");
    await user.click(
      within(sheet).getByRole("button", { name: "Salvar alterações" })
    );

    expect(
      await screen.findByRole("heading", {
        level: 1,
        name: "Scania R 450 · Jundiaí (SP)",
      })
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(
        within(
          screen.getByRole("navigation", { name: "breadcrumb" })
        ).getByText("Scania R 450 · Jundiaí (SP)")
      ).toBeInTheDocument()
    );
  });

  it("returns to the list after deleting the truck", async () => {
    const { user, router } = await renderDetails();

    await user.click(screen.getByRole("button", { name: "Excluir" }));
    await user.click(
      within(screen.getByRole("alertdialog")).getByRole("button", {
        name: "Excluir",
      })
    );

    await waitFor(() =>
      expect(router.state.location.pathname).toBe("/caminhoes")
    );
    await waitFor(() => expect(testDb.find("2")).toBeUndefined());
  });

  it("shows a not found state for an unknown truck", async () => {
    renderApp("/caminhoes/nao-existe");

    expect(await screen.findByText("Não encontrado")).toBeInTheDocument();
    expect(
      screen.getByText("404 · Caminhão não encontrado")
    ).toBeInTheDocument();
    // Rendered inside the app shell: navigation stays available.
    expect(
      screen.getByRole("navigation", { name: "Navegação principal" })
    ).toBeInTheDocument();
  });
});
