import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TruckFilters } from "./filters";

const mockSetFilters = vi.fn();
const mockOnSearch = vi.fn();
const mockOnKeyDown = vi.fn();
const mockOnClear = vi.fn();

const initialFilters = {
  licensePlate: "",
  trackerSerialNumber: "",
  maxDistance: "",
};

describe("TruckFilters", () => {
  it("renders input fields and buttons", () => {
    render(
      <TruckFilters
        filters={initialFilters}
        setFilters={mockSetFilters}
        onSearch={mockOnSearch}
        onKeyDown={mockOnKeyDown}
        onClear={mockOnClear}
      />
    );

    expect(screen.getByLabelText(/Placa/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Rastreador/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Distância Máxima/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Limpar/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /Buscar/i })).toBeDisabled();
  });

  it("enables buttons when filters are filled", () => {
    render(
      <TruckFilters
        filters={{ ...initialFilters, licensePlate: "ABC-1234" }}
        setFilters={mockSetFilters}
        onSearch={mockOnSearch}
        onKeyDown={mockOnKeyDown}
        onClear={mockOnClear}
      />
    );

    expect(screen.getByRole("button", { name: /Limpar/i })).not.toBeDisabled();
    expect(screen.getByRole("button", { name: /Buscar/i })).not.toBeDisabled();
  });

  it("calls setFilters correctly when typing in the license plate field", () => {
    render(
      <TruckFilters
        filters={initialFilters}
        setFilters={mockSetFilters}
        onSearch={mockOnSearch}
        onKeyDown={mockOnKeyDown}
        onClear={mockOnClear}
      />
    );

    const plateInput = screen.getByLabelText(/Placa/i);
    fireEvent.change(plateInput, { target: { value: "abc1234" } });

    expect(mockSetFilters).toHaveBeenCalledWith(
      expect.objectContaining({ licensePlate: "ABC-1234" })
    );
  });

  it("calls setFilters correctly when typing in the tracker field", () => {
    render(
      <TruckFilters
        filters={initialFilters}
        setFilters={mockSetFilters}
        onSearch={mockOnSearch}
        onKeyDown={mockOnKeyDown}
        onClear={mockOnClear}
      />
    );

    const trackerInput = screen.getByLabelText(/Rastreador/i);
    fireEvent.change(trackerInput, { target: { value: "abcd1234efg" } });

    expect(mockSetFilters).toHaveBeenCalledWith(
      expect.objectContaining({ trackerSerialNumber: "ABCD1234EF" })
    );
  });

  it("calls onSearch when clicking the Search button", () => {
    render(
      <TruckFilters
        filters={{ ...initialFilters, licensePlate: "XYZ-5678" }}
        setFilters={mockSetFilters}
        onSearch={mockOnSearch}
        onKeyDown={mockOnKeyDown}
        onClear={mockOnClear}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /Buscar/i }));
    expect(mockOnSearch).toHaveBeenCalled();
  });

  it("calls onClear when clicking the Clear button", () => {
    render(
      <TruckFilters
        filters={{ ...initialFilters, licensePlate: "XYZ-5678" }}
        setFilters={mockSetFilters}
        onSearch={mockOnSearch}
        onKeyDown={mockOnKeyDown}
        onClear={mockOnClear}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /Limpar/i }));
    expect(mockOnClear).toHaveBeenCalled();
  });
});
