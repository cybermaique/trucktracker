import { screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { buildTruck } from "@/test/factories";
import { renderWithProviders } from "@/test/render";
import { TrucksTable } from "./trucks-table";

const trucks = [
  buildTruck({
    id: "1",
    identifier: "Alfa",
    licensePlate: "AAA-1111",
    distanceKm: 5,
  }),
  buildTruck({
    id: "2",
    identifier: "Bravo",
    licensePlate: "BBB2B22",
    distanceKm: 50,
  }),
];

const renderTable = (
  props: Partial<Parameters<typeof TrucksTable>[0]> = {}
) => {
  const handlers = { onSelect: vi.fn(), onEdit: vi.fn(), onDelete: vi.fn() };
  const view = renderWithProviders(
    <TrucksTable
      trucks={trucks}
      selectedTruckId={null}
      {...handlers}
      {...props}
    />
  );
  return { ...view, ...handlers };
};

const rowOf = (name: string) =>
  within(screen.getByRole("table")).getByText(name).closest("tr")!;

describe("TrucksTable", () => {
  it("selects a row with the keyboard", async () => {
    const { user, onSelect } = renderTable();

    rowOf("Bravo").focus();
    await user.keyboard("{Enter}");
    await user.keyboard(" ");

    expect(onSelect).toHaveBeenCalledTimes(2);
    expect(onSelect).toHaveBeenCalledWith(trucks[1]);
  });

  it("offers view, edit and delete actions per row", async () => {
    const { user, onSelect, onEdit, onDelete } = renderTable();
    const openMenu = () =>
      user.click(screen.getByRole("button", { name: "Ações para Alfa" }));

    await openMenu();
    await user.click(screen.getByRole("menuitem", { name: "Ver no mapa" }));
    await openMenu();
    await user.click(screen.getByRole("menuitem", { name: "Editar" }));
    await openMenu();
    await user.click(screen.getByRole("menuitem", { name: "Excluir" }));

    expect(onSelect).toHaveBeenCalledWith(trucks[0]);
    expect(onEdit).toHaveBeenCalledWith(trucks[0]);
    expect(onDelete).toHaveBeenCalledWith(trucks[0]);
  });

  it("toggles the distance order from its header", async () => {
    const { user } = renderTable();
    const distanceHeader = screen.getByRole("columnheader", {
      name: /Distância/,
    });
    expect(distanceHeader).toHaveAttribute("aria-sort", "ascending");

    await user.click(within(distanceHeader).getByRole("button"));

    expect(distanceHeader).toHaveAttribute("aria-sort", "descending");
    expect(
      within(screen.getByRole("table")).getAllByRole("row")[1]
    ).toHaveTextContent("Bravo");
  });

  it("handles an empty list", () => {
    renderTable({ trucks: [] });

    expect(screen.getByText("Nenhum caminhão")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Próxima página" })
    ).toBeDisabled();
  });
});
