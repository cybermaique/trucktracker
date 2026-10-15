import { expect, test, type Page } from "@playwright/test";

const fleetTable = (page: Page) => page.getByRole("table");
const rowFor = (page: Page, name: string) =>
  fleetTable(page).getByRole("row").filter({ hasText: name });

test.describe("Fleet management", () => {
  test("overview summarizes the fleet on a rendered map", async ({ page }) => {
    await page.goto("/");

    await expect(
      page.getByRole("heading", { level: 1, name: "Visão geral" })
    ).toBeVisible();
    await expect(page.getByText("Caminhões na frota")).toBeVisible();
    await expect(
      page.getByText("Distâncias a partir da sua localização")
    ).toBeVisible();
    // The WebGL canvas proves MapLibre, its worker and the tiles loaded.
    await expect(page.locator(".maplibregl-canvas")).toBeVisible();
  });

  test("filters the list and shows the selected truck on the map", async ({
    page,
  }) => {
    await page.goto("/caminhoes");

    await page.getByRole("searchbox", { name: "Buscar caminhões" }).fill("rjo");
    await expect(fleetTable(page).getByRole("row")).toHaveCount(2);

    await rowFor(page, "Rio de Janeiro").click();

    await expect(page).toHaveURL(/caminhao=3/);
    await expect(page.locator(".maplibregl-popup")).toContainText("RJO-7712");
  });

  test("registers a truck by clicking on the map", async ({ page }) => {
    await page.goto("/caminhoes/novo");

    await page.getByLabel("Identificação").fill("Volvo FH 540 · Santos (SP)");
    await page.getByLabel("Placa").pressSequentially("SNT1A23");
    await page.getByLabel("Nº de série do rastreador").fill("VT540SNT");
    await page
      .getByRole("group", { name: "Mapa para selecionar a localização" })
      .click({ position: { x: 120, y: 140 } });
    await expect(page.getByText(/^Latitude -2\d,\d{5}/)).toBeVisible();

    await page.getByRole("button", { name: "Cadastrar caminhão" }).click();

    await expect(
      page.getByText("Volvo FH 540 · Santos (SP) foi cadastrado.")
    ).toBeVisible();
    await expect(page).toHaveURL(/\/caminhoes\?caminhao=/);
    await expect(rowFor(page, "Santos (SP)")).toHaveAttribute(
      "aria-selected",
      "true"
    );
  });

  test("deletes a truck and keeps the change after reloading", async ({
    page,
  }) => {
    await page.goto("/caminhoes");
    const campinas = rowFor(page, "Campinas (SP)");

    await campinas.getByRole("button", { name: /Ações para/ }).click();
    await page.getByRole("menuitem", { name: "Excluir" }).click();
    await page
      .getByRole("alertdialog")
      .getByRole("button", { name: "Excluir" })
      .click();

    // The row disappears optimistically; wait for the server to confirm.
    await expect(campinas).toHaveCount(0);
    await expect(page.getByText(/foi excluído/)).toBeVisible();
    await page.reload();
    await expect(fleetTable(page)).toBeVisible();
    await expect(rowFor(page, "Campinas (SP)")).toHaveCount(0);
  });

  test("navigates with the sidebar and toggles the theme", async ({
    page,
    isMobile,
  }) => {
    await page.goto("/");

    if (isMobile) {
      await page.getByRole("button", { name: "Alternar menu lateral" }).click();
    }
    await page
      .getByRole("navigation", { name: "Navegação principal" })
      .getByRole("link", { name: "Caminhões" })
      .click();
    await expect(
      page.getByRole("heading", { level: 1, name: "Caminhões" })
    ).toBeVisible();

    await page.getByRole("button", { name: "Alterar tema" }).click();
    await page.getByRole("menuitemradio", { name: "Escuro" }).click();
    await expect(page.locator("html")).toHaveClass(/dark/);
  });
});
