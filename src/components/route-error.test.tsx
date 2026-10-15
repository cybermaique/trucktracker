import { render, screen } from "@testing-library/react";
import { createMemoryRouter, data } from "react-router";
import { RouterProvider } from "react-router/dom";
import { describe, expect, it, vi } from "vitest";
import { RouteError } from "./route-error";

const renderFailingRoute = (loader: () => never) => {
  const router = createMemoryRouter([
    { path: "/", loader, Component: () => null, errorElement: <RouteError /> },
  ]);
  render(<RouterProvider router={router} />);
};

describe("RouteError", () => {
  it("shows HTTP errors thrown by a route", async () => {
    renderFailingRoute(() => {
      throw data(null, { status: 503, statusText: "Service Unavailable" });
    });

    expect(await screen.findByText("Algo deu errado")).toBeInTheDocument();
    expect(screen.getByText("503 · Service Unavailable")).toBeInTheDocument();
  });

  it("shows a generic message for unexpected errors and offers a reload", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    renderFailingRoute(() => {
      throw new Error("chunk failed to load");
    });

    expect(
      await screen.findByText(
        "Ocorreu um erro inesperado ao carregar esta página."
      )
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Recarregar a página" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Ir para a visão geral" })
    ).toHaveAttribute("href", "/");
  });
});
