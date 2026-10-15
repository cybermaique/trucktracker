import { screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderApp } from "@/test/render";

const renderWithPalette = async () => {
  const view = renderApp("/");
  await screen.findByRole("heading", { level: 1, name: "Visão geral" });
  return view;
};

describe("Command menu", () => {
  it("opens with Ctrl+K and jumps to a truck found by its plate", async () => {
    const { user, router } = await renderWithPalette();

    await user.keyboard("{Control>}k{/Control}");
    const input = await screen.findByPlaceholderText(/Buscar por nome, placa/);
    await user.type(input, "cmp4e21");
    await screen.findByRole("option", { name: /Scania R 450 · Campinas/ });
    await user.keyboard("{Enter}");

    await waitFor(() =>
      expect(router.state.location.pathname).toBe("/caminhoes/2")
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("navigates to pages and changes the theme", async () => {
    const { user, router } = await renderWithPalette();

    await user.click(
      screen.getByRole("button", { name: "Abrir paleta de comandos" })
    );
    await user.click(
      await screen.findByRole("option", { name: "Novo caminhão" })
    );
    await waitFor(() =>
      expect(router.state.location.pathname).toBe("/caminhoes/novo")
    );

    await user.keyboard("{Control>}k{/Control}");
    await user.click(
      await screen.findByRole("option", { name: "Tema escuro" })
    );
    expect(document.documentElement).toHaveClass("dark");
  });

  it("tells when nothing matches", async () => {
    const { user } = await renderWithPalette();

    await user.keyboard("{Control>}k{/Control}");
    await user.type(
      await screen.findByPlaceholderText(/Buscar por nome, placa/),
      "zzzzzz"
    );

    expect(await screen.findByText("Nenhum resultado.")).toBeInTheDocument();
  });
});
