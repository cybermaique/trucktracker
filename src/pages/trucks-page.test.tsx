import { screen, waitFor, within } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { describe, expect, it, vi } from "vitest";
import { exportTrucksToPdf } from "@/features/trucks/lib/export";
import { grantGeolocation } from "@/test/geolocation";
import { renderApp } from "@/test/render";
import { server, testDb } from "@/test/server";

vi.mock("@/features/trucks/lib/export", async (importOriginal) => ({
  ...(await importOriginal<object>()),
  exportTrucksToPdf: vi.fn(),
}));

const tableRows = () => within(screen.getByRole("table")).getAllByRole("row");

/** Truck names in table order (first cell of each body row). */
const listedTrucks = () =>
  tableRows()
    .slice(1)
    .map((row) => within(row).getAllByRole("cell")[0]?.textContent);

const renderTrucksPage = async (path = "/caminhoes") => {
  const view = renderApp(path);
  await screen.findByRole("table");
  return view;
};

describe("Trucks page", () => {
  it("lists the fleet sorted by distance from the user", async () => {
    grantGeolocation();
    await renderTrucksPage();

    expect(listedTrucks()[0]).toBe("Scania R 450 · Campinas (SP)");
    expect(listedTrucks()[1]).toBe("Volvo FH 540 · São Paulo (SP)");
    expect(screen.getByText("Mostrando 1–10 de 22")).toBeInTheDocument();
    expect(
      screen.getByText("Distâncias a partir da sua localização")
    ).toBeInTheDocument();
  });

  it("falls back to São Paulo when geolocation is unavailable", async () => {
    await renderTrucksPage();

    expect(listedTrucks()[0]).toBe("Volvo FH 540 · São Paulo (SP)");
    expect(
      screen.getByText("Distâncias a partir de São Paulo (SP)")
    ).toBeInTheDocument();
  });

  it("searches by plate ignoring case and punctuation, syncing the URL", async () => {
    const { user, router } = await renderTrucksPage();

    await user.type(screen.getByRole("searchbox"), "rjo7712");

    await waitFor(() =>
      expect(listedTrucks()).toEqual([
        "Mercedes-Benz Actros 2651 · Rio de Janeiro (RJ)",
      ])
    );
    await waitFor(() =>
      expect(router.state.location.search).toBe("?q=rjo7712")
    );
  });

  it("resets the search when the URL changes from elsewhere", async () => {
    const { user } = await renderTrucksPage("/caminhoes?q=rjo");
    expect(screen.getByRole("searchbox")).toHaveValue("rjo");

    await user.click(
      within(
        screen.getByRole("navigation", { name: "Navegação principal" })
      ).getByRole("link", { name: "Caminhões" })
    );

    await waitFor(() => expect(screen.getByRole("searchbox")).toHaveValue(""));
    expect(listedTrucks()).toHaveLength(10);
  });

  it("filters by maximum distance and draws the radius on the map", async () => {
    const { user } = await renderTrucksPage();

    await user.click(
      screen.getByRole("combobox", { name: "Distância máxima" })
    );
    await user.click(screen.getByRole("option", { name: "Até 100 km" }));

    await waitFor(() =>
      expect(listedTrucks()).toEqual([
        "Volvo FH 540 · São Paulo (SP)",
        "Scania R 450 · Campinas (SP)",
      ])
    );
    expect(screen.getByTestId("source-radius")).toBeInTheDocument();
  });

  it("shows an empty state that clears the filters", async () => {
    const { user, router } = renderApp("/caminhoes?q=inexistente");

    expect(
      await screen.findByText("Nenhum caminhão encontrado")
    ).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();

    const [, emptyStateButton] = screen.getAllByRole("button", {
      name: "Limpar filtros",
    });
    await user.click(emptyStateButton!);

    expect(await screen.findByRole("table")).toBeInTheDocument();
    expect(router.state.location.search).toBe("");
  });

  it("selects a truck from the table and shows it on the map", async () => {
    const { user, router } = await renderTrucksPage();

    const table = screen.getByRole("table");
    await user.click(within(table).getByText("Scania R 450 · Campinas (SP)"));

    const popup = await screen.findByRole("dialog", {
      name: "Detalhes do caminhão",
    });
    expect(popup).toHaveTextContent("CMP4E21");
    expect(router.state.location.search).toBe("?caminhao=2");
    expect(
      within(table).getByText("Scania R 450 · Campinas (SP)").closest("tr")
    ).toHaveAttribute("aria-selected", "true");
  });

  it("opens the page holding a truck selected through the URL", async () => {
    // Porto Velho is the farthest truck from São Paulo: last page.
    await renderTrucksPage("/caminhoes?caminhao=22");

    expect(screen.getByText("Mostrando 21–22 de 22")).toBeInTheDocument();
    expect(
      within(screen.getByRole("table"))
        .getByText("Scania R 500 · Porto Velho (RO)")
        .closest("tr")
    ).toHaveAttribute("aria-selected", "true");
  });

  it("paginates and changes the page size", async () => {
    const { user } = await renderTrucksPage();

    await user.click(screen.getByRole("button", { name: "Próxima página" }));
    expect(screen.getByText("Mostrando 11–20 de 22")).toBeInTheDocument();

    await user.click(
      screen.getByRole("combobox", { name: "Itens por página" })
    );
    await user.click(screen.getByRole("option", { name: "50 por página" }));
    expect(screen.getByText("Mostrando 1–22 de 22")).toBeInTheDocument();
  });

  it("sorts by another column from its header", async () => {
    const { user } = await renderTrucksPage();

    await user.click(screen.getByRole("button", { name: /Caminhão/ }));

    expect(listedTrucks()[0]).toBe("DAF CF 450 · Cuiabá (MT)");
    expect(
      screen.getByRole("columnheader", { name: /Caminhão/ })
    ).toHaveAttribute("aria-sort", "ascending");
  });

  it("deletes a truck after confirmation", async () => {
    const { user } = await renderTrucksPage();

    await user.click(
      screen.getByRole("button", {
        name: "Ações para Scania R 450 · Campinas (SP)",
      })
    );
    await user.click(screen.getByRole("menuitem", { name: "Excluir" }));
    const dialog = screen.getByRole("alertdialog");
    expect(dialog).toHaveTextContent("CMP4E21");
    await user.click(within(dialog).getByRole("button", { name: "Excluir" }));

    expect(
      await screen.findByText("Scania R 450 · Campinas (SP) foi excluído.")
    ).toBeInTheDocument();
    expect(listedTrucks()).not.toContain("Scania R 450 · Campinas (SP)");
    expect(testDb.find("2")).toBeUndefined();
  });

  it("restores the truck when deleting fails", async () => {
    server.use(
      http.delete("*/api/trucks/:id", () =>
        HttpResponse.json({ message: "Erro" }, { status: 500 })
      )
    );
    const { user } = await renderTrucksPage();

    await user.click(
      screen.getByRole("button", {
        name: "Ações para Scania R 450 · Campinas (SP)",
      })
    );
    await user.click(screen.getByRole("menuitem", { name: "Excluir" }));
    await user.click(
      within(screen.getByRole("alertdialog")).getByRole("button", {
        name: "Excluir",
      })
    );

    expect(
      await screen.findByText(
        "Não foi possível excluir Scania R 450 · Campinas (SP)."
      )
    ).toBeInTheDocument();
    expect(listedTrucks()).toContain("Scania R 450 · Campinas (SP)");
  });

  it("edits a truck in the side sheet", async () => {
    const { user } = await renderTrucksPage();

    await user.click(
      screen.getByRole("button", {
        name: "Ações para Scania R 450 · Campinas (SP)",
      })
    );
    await user.click(screen.getByRole("menuitem", { name: "Editar" }));

    const sheet = screen.getByRole("dialog", { name: "Editar caminhão" });
    const identifier = within(sheet).getByLabelText("Identificação");
    await user.clear(identifier);
    await user.type(identifier, "Scania R 450 · Jundiaí (SP)");
    await user.click(
      within(sheet).getByRole("button", { name: "Salvar alterações" })
    );

    expect(
      await screen.findByText("Scania R 450 · Jundiaí (SP) foi atualizado.")
    ).toBeInTheDocument();
    expect(listedTrucks()).toContain("Scania R 450 · Jundiaí (SP)");
    expect(testDb.find("2")?.identifier).toBe("Scania R 450 · Jundiaí (SP)");
  });

  it("rejects a license plate that belongs to another truck", async () => {
    const { user } = await renderTrucksPage();

    await user.click(
      screen.getByRole("button", {
        name: "Ações para Scania R 450 · Campinas (SP)",
      })
    );
    await user.click(screen.getByRole("menuitem", { name: "Editar" }));
    const sheet = screen.getByRole("dialog", { name: "Editar caminhão" });
    const plate = within(sheet).getByLabelText("Placa");
    await user.clear(plate);
    await user.type(plate, "FRT2A41");
    await user.click(
      within(sheet).getByRole("button", { name: "Salvar alterações" })
    );

    expect(
      await within(sheet).findByText("Já existe um caminhão com essa placa")
    ).toBeInTheDocument();
    expect(plate).toHaveFocus();
  });

  it("exports the visible trucks", async () => {
    const createObjectURL = vi.fn(() => "blob:csv");
    vi.stubGlobal(
      "URL",
      Object.assign(URL, { createObjectURL, revokeObjectURL: vi.fn() })
    );
    const { user } = await renderTrucksPage("/caminhoes?raio=100");

    await user.click(screen.getByRole("button", { name: "Exportar" }));
    await user.click(screen.getByRole("menuitem", { name: "Planilha CSV" }));
    expect(createObjectURL).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole("button", { name: "Exportar" }));
    await user.click(
      screen.getByRole("menuitem", { name: "Relatório em PDF" })
    );
    expect(exportTrucksToPdf).toHaveBeenCalledWith([
      expect.objectContaining({ id: "1" }),
      expect.objectContaining({ id: "2" }),
    ]);
  });

  it("reports a failed PDF export", async () => {
    vi.mocked(exportTrucksToPdf).mockRejectedValueOnce(new Error("boom"));
    const { user } = await renderTrucksPage();

    await user.click(screen.getByRole("button", { name: "Exportar" }));
    await user.click(
      screen.getByRole("menuitem", { name: "Relatório em PDF" })
    );

    expect(
      await screen.findByText("Não foi possível gerar o PDF.")
    ).toBeInTheDocument();
  });

  it("offers a retry when the fleet cannot be loaded", async () => {
    server.use(
      http.get("*/api/trucks", () => HttpResponse.json(null, { status: 500 }))
    );
    const { user } = renderApp("/caminhoes");
    const retry = await screen.findByRole("button", {
      name: "Tentar novamente",
    });

    server.resetHandlers();
    await user.click(retry);

    expect(await screen.findByRole("table")).toBeInTheDocument();
  });
});
