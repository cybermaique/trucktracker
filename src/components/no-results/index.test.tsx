import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import NoResults from ".";
import NoResultsFound from "../../assets/images/no-results-found.svg";
import { colors } from "../../styles/colors";

describe("NoResults Component", () => {
  it("should render the NoResults component correctly", () => {
    render(<NoResults />);

    const container = screen.getByRole("img").parentElement;
    expect(container).toBeInTheDocument();
  });

  it("should display the correct image with alt text", () => {
    render(<NoResults />);

    const image = screen.getByRole("img", {
      name: /Nenhum resultado encontrado/i,
    });
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute("src", NoResultsFound);
    expect(image).toHaveAttribute("width", "200");
  });

  it("should display the correct title and description", () => {
    render(<NoResults />);

    const title = screen.getByText(/Nenhum caminhão encontrado/i);
    expect(title).toBeInTheDocument();
    expect(title).toHaveStyle(`color: ${colors.darkLiver}`);

    const description = screen.getByText(
      /Não encontramos caminhões disponíveis. Verifique os filtros ou tente novamente em alguns instantes./i
    );
    expect(description).toBeInTheDocument();
    expect(description).toHaveStyle(`color: ${colors.darkLiver}`);
  });
});
