import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import NotFound from ".";

describe("NotFound", () => {
  it("should render the message and a link back to the home page", () => {
    render(
      <MemoryRouter>
        <NotFound />
      </MemoryRouter>
    );

    expect(
      screen.getByAltText(/ilustração de página não encontrada/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/Opa, URL não encontrada!/i)).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /ir para a página inicial/i })
    ).toHaveAttribute("href", "/");
  });
});
