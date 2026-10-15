import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Footer from ".";
import { AUTHOR } from "../../constants/author";

describe("Footer", () => {
  it("should render the project and author information", () => {
    render(<Footer />);

    expect(
      screen.getByText("TruckTracker · Gestão de frotas de caminhões")
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: AUTHOR.name })).toHaveAttribute(
      "href",
      AUTHOR.github
    );
  });

  it("should link to the source code repository in a new tab", () => {
    render(<Footer />);

    const repositoryLink = screen.getByRole("link", {
      name: /código-fonte no github/i,
    });

    expect(repositoryLink).toHaveAttribute("href", AUTHOR.repository);
    expect(repositoryLink).toHaveAttribute("target", "_blank");
    expect(repositoryLink).toHaveAttribute("rel", "noopener noreferrer");
  });
});
