import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import Home from ".";
import { DEMO_USER } from "../../constants/user";

const renderHome = () =>
  render(
    <MemoryRouter>
      <Home />
    </MemoryRouter>
  );

describe("Home", () => {
  it("should greet the user", () => {
    renderHome();

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: `Boas-vindas, ${DEMO_USER.name}!`,
      })
    ).toBeInTheDocument();
  });

  it("should render the illustration", () => {
    renderHome();

    expect(
      screen.getByAltText("Ilustração de caminhões em um mapa")
    ).toHaveAttribute("src", expect.stringContaining("home.svg"));
  });

  it("should link to the main features", () => {
    renderHome();

    expect(
      screen.getByRole("link", { name: "Cadastrar caminhão" })
    ).toHaveAttribute("href", "/caminhoes/cadastrar");
    expect(screen.getByRole("link", { name: "Ver caminhões" })).toHaveAttribute(
      "href",
      "/caminhoes/listar"
    );
  });
});
