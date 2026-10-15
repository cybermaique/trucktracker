import { fireEvent, render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import Layout from ".";

vi.mock("../sidebar/index", () => ({
  default: ({ open }: { open: boolean }) => (
    <div data-testid="Sidebar">{open ? "Sidebar Open" : "Sidebar Closed"}</div>
  ),
}));

vi.mock("../toolbar/index", () => ({
  default: ({ onClickMenu }: { onClickMenu: () => void }) => (
    <button data-testid="ToolbarButton" onClick={onClickMenu}>
      Toggle Sidebar
    </button>
  ),
}));

describe("Layout Component", () => {
  it("should render Toolbar, Sidebar, and children correctly", () => {
    render(
      <BrowserRouter>
        <Layout>
          <div data-testid="Content">Content</div>
        </Layout>
      </BrowserRouter>
    );

    expect(screen.getByTestId("ToolbarButton")).toBeInTheDocument();
    expect(screen.getByTestId("Sidebar")).toHaveTextContent("Sidebar Open");
    expect(screen.getByTestId("Content")).toHaveTextContent("Content");
  });

  it("should toggle Sidebar visibility when clicking the Toolbar button", () => {
    render(
      <BrowserRouter>
        <Layout>
          <div data-testid="Content">Content</div>
        </Layout>
      </BrowserRouter>
    );

    const toolbarButton = screen.getByTestId("ToolbarButton");
    expect(screen.getByTestId("Sidebar")).toHaveTextContent("Sidebar Open");

    fireEvent.click(toolbarButton);
    expect(screen.getByTestId("Sidebar")).toHaveTextContent("Sidebar Closed");

    fireEvent.click(toolbarButton);
    expect(screen.getByTestId("Sidebar")).toHaveTextContent("Sidebar Open");
  });
});
