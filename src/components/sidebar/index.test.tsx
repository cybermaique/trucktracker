import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import Sidebar from ".";
import { navigationRoutes } from "../../routes";
import { colors } from "../../styles/colors";

const renderSidebar = (
  props: React.ComponentProps<typeof Sidebar>,
  initialEntries = ["/"]
) =>
  render(
    <MemoryRouter initialEntries={initialEntries}>
      <Sidebar {...props} />
    </MemoryRouter>
  );

describe("Sidebar", () => {
  it("should render a link for each navigation route", () => {
    renderSidebar({ open: true });

    navigationRoutes.forEach(({ title, path }) => {
      expect(screen.getByRole("link", { name: title })).toHaveAttribute(
        "href",
        path
      );
    });
  });

  it("should show the labels only when open, keeping links accessible", () => {
    const { unmount } = renderSidebar({ open: true });
    navigationRoutes.forEach(({ title }) => {
      expect(screen.getByText(title)).toBeInTheDocument();
    });
    unmount();

    renderSidebar({ open: false });
    navigationRoutes.forEach(({ title }) => {
      expect(screen.queryByText(title)).not.toBeInTheDocument();
      expect(screen.getByRole("link", { name: title })).toBeInTheDocument();
    });
  });

  it("should highlight only the active route", () => {
    renderSidebar({ open: true }, ["/caminhoes/listar"]);

    expect(
      screen.getByRole("link", { name: "Listagem de Caminhões" })
    ).toHaveStyle(`background-color: ${colors.brightGray}`);
    expect(screen.getByRole("link", { name: "Página inicial" })).toHaveStyle(
      `background-color: ${colors.white}`
    );
  });

  it("should notify when a link is clicked", async () => {
    const onNavigate = vi.fn();
    renderSidebar({ open: true, onNavigate });

    await userEvent.click(
      screen.getByRole("link", { name: "Cadastrar Caminhão" })
    );

    expect(onNavigate).toHaveBeenCalled();
  });
});
