import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import PageHeader from ".";

describe("PageHeader", () => {
  it("should render the title as the page heading and the subtitle", () => {
    render(<PageHeader title="Título Teste" subtitle="Subtítulo Teste" />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Título Teste" })
    ).toBeInTheDocument();
    expect(screen.getByText("Subtítulo Teste")).toHaveClass(
      "MuiTypography-subtitle1"
    );
  });

  it("should render an optional action", () => {
    render(
      <PageHeader
        title="Título"
        subtitle="Subtítulo"
        action={<button>Ação</button>}
      />
    );

    expect(screen.getByRole("button", { name: "Ação" })).toBeInTheDocument();
  });
});
